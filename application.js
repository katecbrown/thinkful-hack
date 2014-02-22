$(document).ready(function() {

	var accessToken = getAnchor();
	var listIds = new Array();
	var 

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
			$.getJSON("https://api.foursquare.com/v2/lists/" + listIds[0] + "?oauth_token=" + accessToken + "&v=20140210", function(data) {
				for (var key in data.response.list.listItems.items) {
					var venueName = data.response.list.listItems.items[key].venue.name;
					var venuePhone = data.response.list.listItems.items[key].venue.contact.phone;
					var venueCity = data.response.list.listItems.items[key].venue.location.city;
					var venueAddress = data.response.list.listItems.items[key].venue.location.address;
					$('body').append('<p>' + venueName + '</p>');
						}
					});
		});

	function getAnchor() {
		var fullHash = location.hash;
		if (fullHash !== "") {
			var x = fullHash.split('=');
			return x[1];
		} else {
			return null;
		}
	}
	
	}

});