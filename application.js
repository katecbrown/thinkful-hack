$(document).ready(function() {

	var accessToken = getAnchor();
	var listIds = new Array();
	var correctBusiness;

	// Get the Foursquare user's lists and the venues from her lists

	if (accessToken !== null) {
		var url = "https://api.foursquare.com/v2/users/self/lists?oauth_token=" + accessToken + "&v=20140306&group=created";
	
		$.getJSON(url, function(data) {

			for (var i = data.response.lists.items.length - 1; i >= 0; i--) {
				var listName = data.response.lists.items[i].name;
				var listId = data.response.lists.items[i].id;
				listIds.push(listId);
				$('select').append('<option id="' + listId + '">' + listName + '</option>');
			}
		})
			.then(function(){
				$.each(listIds, function(i, val) {
					$.getJSON("https://api.foursquare.com/v2/lists/" + val + "?oauth_token=" + accessToken + "&v=20140306", function(data) {
						for (var key in data.response.list.listItems.items) {
							var listName = data.response.list.name;
							var listId = data.response.list.id;
							var venueName = data.response.list.listItems.items[key].venue.name;
							var venueCity = data.response.list.listItems.items[key].venue.location.city;
							var venueAddress = data.response.list.listItems.items[key].venue.location.address;
							var venuePhone = data.response.list.listItems.items[key].venue.contact.phone;
							getYelpReview(listName, listId, venueName, venueCity, venueAddress, venuePhone); 				
						}
					});
			});

		});

	}

	// Need to filter results based on list selection
	// Referring to http://stackoverflow.com/questions/6315215/change-content-based-on-select-dropdown-id-in-jquery

	// $('.outtaHere').change(function() {
	// 	var selected = $(this).find(':selected');
	// 	console.log(selected);
	// })

	// Scrapes the Foursquare token from the URL

	function getAnchor() {
		var fullHash = location.hash;
		if (fullHash !== "") {
			var x = fullHash.split('=');
			return x[1];
		} else {
			return null;
		}
	}

	// Takes venueName and venueCity for each venue and fetches Yelp rating

	function getYelpReview(listName, listId, venueName, venueCity, venueAddress, venuePhone) {

	// Taken almost verbatim from the Yelp OAuth example on GitHub

		var auth = { 
			consumerKey: "281o_SIxUDw90PAk8-z2og", 
			consumerSecret: "JSSgO22iULGmK4Wcr-0nNxCl-4c",
	  		accessToken: "VsLRn5JrnqXovmcf5Fl4uUPf7HjAvW4O",
	  		accessTokenSecret: "vms4r-h0nv9Y7cSCAnfK0ezDjaM",
	  		serviceProvider: { 
	    		signatureMethod: "HMAC-SHA1"
	  		}
		};

		var accessor = {
		  consumerSecret: auth.consumerSecret,
		  tokenSecret: auth.accessTokenSecret
		};

		parameters = [];
		parameters.push(['term', venueName]);
		parameters.push(['location', venueCity, venueAddress]); // Added venueAddress, not sure if it is working
		parameters.push(['callback', 'cb']);
		parameters.push(['oauth_consumer_key', auth.consumerKey]);
		parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
		parameters.push(['oauth_token', auth.accessToken]);
		parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

		var message = { 
		  'action': 'http://api.yelp.com/v2/search',
		  'method': 'GET',
		  'parameters': parameters 
		};

		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		var parameterMap = OAuth.getParameterMap(message.parameters);
		parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
		// console.log(parameterMap);

		$.ajax({
			'url': message.action,
			'data': parameterMap,
			'cache': true,
		  	'dataType': 'jsonp',
		  	'jsonpCallback': 'cb',
		  	'success': function(data, textStats, XMLHttpRequest) {

		  		// Find the business listing where Yelp and Foursquare phone number match, and return the name, rating, and URL
		  		// Ignores businesses without phone numbers for now

		  		for (var key in data.businesses) {

		  			if (venuePhone !== undefined && data.businesses[key].phone == venuePhone) {
		  				correctBusiness = key;
		  				$('#main').append('<p class="' + listId + '">' + venueName + ' - ' + data.businesses[correctBusiness].rating + ' - ' + data.businesses[correctBusiness].url + '</p>');
		  			
		  			}
		  		}
		  	}
		});
	}
});