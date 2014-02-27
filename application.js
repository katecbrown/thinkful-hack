$(document).ready(function() {

	var accessToken = getAnchor();
	var listIds = new Array();

	// Get the Foursquare user's lists and the venues from her lists

	if (accessToken !== null) {
		var url = "https://api.foursquare.com/v2/users/self/lists?oauth_token=" + accessToken + "&v=20140210";
	
		$.getJSON(url, function(data) {

			for (var i = data.response.lists.groups[0].items.length - 1; i >= 0; i--) {
				var listName = data.response.lists.groups[0].items[i].name;
				var listId = data.response.lists.groups[0].items[i].id;
				listIds.push(listId);
				$('ul').append('<li>' + listName + '</li>');
			}
		})
		
			.then(function(){
				$.each(listIds, function(i, val) {
					$.getJSON("https://api.foursquare.com/v2/lists/" + val + "?oauth_token=" + accessToken + "&v=20140210", function(data) {
						for (var key in data.response.list.listItems.items) {
							var venueName = data.response.list.listItems.items[key].venue.name;
							var venueCity = data.response.list.listItems.items[key].venue.location.city;
							var venueAddress = data.response.list.listItems.items[key].venue.location.address;
							getYelpReview(venueName, venueCity); 				
						}
					})
			});

		});

	}

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
	// TODO: Should also accept venueAddress

	function getYelpReview(venueName, venueCity) {

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
		parameters.push(['term', venueName]); // Changed terms to venueName
		parameters.push(['location', venueCity]); // changed near to venueCity
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
		parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
		// console.log(parameterMap);

		$.ajax({
		  'url': message.action,
		  'data': parameterMap,
		  'cache': true,
		  'dataType': 'jsonp',
		  'jsonpCallback': 'cb',
		  'success': function(data, textStats, XMLHttpRequest) {
		  	$('body').append('<p>' + venueName + ' - ' + data.businesses[0].rating + '</p>'); 
		  }
		});
	}

});