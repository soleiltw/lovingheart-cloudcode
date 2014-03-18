
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

// Update Users stories count
Parse.Cloud.define("updateUserStoriesCount", function(request, response){
	var story = Parse.Object.extend("Story");
	var storiesQuery = new Parse.Query(story);
	storiesQuery.equalTo("StoryTeller", Parse.User.current());
	storiesQuery.find({
		success: function(results) {
			// Update for user impact
			var userImpact = Parse.Object.extend("UserImpact");
			var userImpactQuery = new Parse.Query(userImpact);
			userImpactQuery.equalTo("User", Parse.User.current());
			userImpactQuery.find({
				success: function(userImpacts) {
					for (var i = 0; i < userImpacts.length; i++) { 
						var userImpactObject = userImpacts[i];
						userImpactObject.set("sharedStoriesCount", results.length);
						userImpactObject.save();
						
						response.success("Successfully save " + results.length + " stories count for " + Parse.User.current().get("name") +".");
					}
					if (userImpacts.length == 0) {
						var UserImpact = Parse.Object.extend("UserImpact");
						var userImpactObject = new UserImpact();
						
						userImpactObject.set("User", Parse.User.current());
						userImpactObject.set("sharedStoriesCount", results.length);
						userImpactObject.save();
						
						response.success("Successfully create new user impact with " + results.length + " stories count for " + Parse.User.current().get("name") +".");
					}
				}, 
				error: function(error) {
					response.error("Error: " + error.code + " " + error.message);
				}
			});
		}, 
		error: function(error) {
			response.error("Error: " + error.code + " " + error.message);
		}
	}
	);
});