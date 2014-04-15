$(document).ready(function() {

	var accessToken = getAnchor();
	var listIds = new Array();
	var correctBusiness;

	// Get the Foursquare user's lists

	if (accessToken !== null) {
		var url = "https://api.foursquare.com/v2/users/self/lists?oauth_token=" + accessToken + "&v=20140406&group=created";
	
		$.getJSON(url, function(data) {

			for (var i = data.response.lists.items.length - 1; i >= 0; i--) {
				var listName = data.response.lists.items[i].name;
				var listId = data.response.lists.items[i].id;
				listIds.push(listId);
				$('select').append('<option id="' + listId + '">' + listName + '</option>');
			}
		})
			.then(function() {
				var selectedListId = $('select').find(':selected').attr('id');
				getVenues(selectedListId);
		})
	}

	// Call Foursquare API for venues from currently selected list

    function getVenues(selectedListId) {
        $.getJSON("https://api.foursquare.com/v2/lists/" + selectedListId + "?oauth_token=" + accessToken + "&v=20140406", function(data) {
            for (var key in data.response.list.listItems.items) {
                var listId = data.response.list.id;
                var venueName = data.response.list.listItems.items[key].venue.name;
                var venueAddress = data.response.list.listItems.items[key].venue.location.address;
                var venueLoc = data.response.list.listItems.items[key].venue.location.address + " " + data.response.list.listItems.items[key].venue.location.city;
                var venueLat = data.response.list.listItems.items[key].venue.location.lat;
                var venueLong = data.response.list.listItems.items[key].venue.location.lng;
                var venuePhone = data.response.list.listItems.items[key].venue.contact.phone;
                showCoordinates(venueName, venueLat, venueLong);
                getYelpReview(venueName, venueLat, venueLong, venuePhone);                  
            }
        });
    }

	// Swap out venues when different list is selected

	$('select').change(function() {
		var selected = $(this).find(':selected');
		var selectedListId = selected.attr('id');
		$('#venues').html("");
		getVenues(selectedListId);
		});
	
	// Scrape the Foursquare token from the URL

	function getAnchor() {
		var fullHash = location.hash;
		if (fullHash !== "") {
			var x = fullHash.split('=');
			return x[1];
		} else {
			return null;
		}
	}

	function showCoordinates(venueName, venueLat, venueLong) {
        $('#venues').append('<p>' + venueName + "," + venueLat + "," + venueLong + '</p>');
    }

	// Take venueName and venueCity for each venue and fetches Yelp rating

    function getYelpReview(venueName, venueLat, venueLong, venuePhone) {

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
        var ll = venueLat + "," + venueLong;
        parameters = [];
        parameters.push(['term', venueName]);
        parameters.push(['ll', ll]);
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
        console.log(parameterMap);


        // Removed jsonpCallback parameter, allowing jquery to define name of the callback.
        // Before, I believe multiple ajax requests were trying to use the same callback name 'cb'
        // which caused responses for the wrong request to be processed by the success function
        $.ajax({
            'url': message.action,
            'data': parameterMap,
            'cache': true,
            'dataType': 'jsonp',
            'success': function(data, textStats, XMLHttpRequest) {
                // Find the business listing where Yelp and Foursquare phone number match, and return the name, rating, and URL
                // Ignores businesses without phone numbers for now
                console.log(data);
                for (var key in data.businesses) {
                    console.log("venueName: " + venueName + " yelpName: " + data.businesses[key].name);
                    // You may also want to try fuzzy string matching on the venue names. I'd try something like Levenshtein 
                    // distance which computes the number of single character changes to transform one string into another one.
                    // 
                    // Levenshtein overview: http://en.wikipedia.org/wiki/Levenshtein_distance
                    // Javascript implementation: http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
                    if (venuePhone !== undefined && data.businesses[key].phone == venuePhone) {
                        console.log("match found.");
                        correctBusiness = key;
                        $('#venues').append('<p>' + venueName + venuePhone + ' - ' + data.businesses[correctBusiness].rating + ' - ' + data.businesses[correctBusiness].url + '</p>');
                        break;

                    }
                }
            }
        });
    }
});

