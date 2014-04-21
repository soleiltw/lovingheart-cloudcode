// Find if user facebook image is old one
Parse.Cloud.job("findFacebookImageHttpUrl", function(request, response) {
	var graphicImage = Parse.Object.extend("GraphicImage");
	var graphicQuery = new Parse.Query(graphicImage);
	graphicQuery.find({
		success: function(results) {
		
			var totalCount = 0;
			
			for (var index = 0 ; index < results.length; index ++) {
				var graphicObject = results[index];
				var graphicUrl = graphicObject.get("imageUrl");
				if (graphicUrl && graphicUrl.indexOf("http://graph.facebook.com") === 0) {
					alert("Url need to update: "+graphicUrl);
					totalCount++;
				}
			}
			response.success("Http graph url total Count: "+ totalCount);
		}, 
		error: function(error) {
			response.error("Error: " + error.code + " " + error.message);
		}
	})
});

// Update Story share count
Parse.Cloud.afterSave("Event", function(request) {
	if (request.object.get("action") == "share_to_facebook") {
		
		var eventQuery = new Parse.Query("Event");
		eventQuery.include("story");
		eventQuery.get(request.object.id, {
			success: function(eventObject) {
				var storiesQuery = new Parse.Query("Story");
		var storyObject = eventObject.get("story");
		
		var eventCountQuery = new Parse.Query("Event");
		eventCountQuery.equalTo("story", storyObject);
		eventCountQuery.count({
			success: function(count) {
			// Update count to idea
			storyObject.set("shareCount", count);
			storyObject.save();	
			alert("Story saved. With share count: " + storyObject.get("shareCount"));
		}, error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
		}
		});

			}, 
			error:function(error) {
							console.log("Could not save. " + error.message);
			}
		});
	
	}
});

// Update idea doneCount for each user after story share.
Parse.Cloud.afterSave("Story", function(request) {
	if (request.object.get("ideaPointer")) {
		var idea = request.object.get("ideaPointer");
		var storiesQuery = new Parse.Query("Story");
		storiesQuery.equalTo("ideaPointer", idea);
		storiesQuery.count({
			success: function(count) {
			// Update count to idea
			idea.set("doneCount", count);
			idea.save();	
			alert("Story saved. With done count: " + count);
		}, error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
		}
		});
	} else {
		alert("Story saved. No idea pointer found.");
	}
});

// Update Users stories count for user impact
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