//$(document).ready(function() {

	// To do: Set var for token, but need to parse token from URL:
	// "If your app is pure Javascript, you can easily parse the token from the URL."
	// 
	// What do I pass in for the &callback= parameter?

	$.getJSON("https://api.foursquare.com/v2/users/self/lists?oauth_token=1HL25ZFN00KCGIVC4GFAKRBEKUITWEOVH1FXKRY2MCCKI5XT&v=20140114&callback=?",
		
	// Trying to mimic the code on JSONP section of http://jqfundamentals.com/chapter/ajax-deferreds
	// Having some trouble!
	// What does resp.results.length do, show length of JSON object?
	
		function(resp) {
			$('li').html('Results: ' + resp.results.length);
	});
});

});