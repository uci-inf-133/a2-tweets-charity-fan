function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// DATES
	tweet_array.sort((a, b) => a.time - b.time);

	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	const earliestDate = tweet_array[0].time.toLocaleDateString('en-US', options);
	const latestDate = tweet_array[tweet_array.length - 1].time.toLocaleDateString('en-US', options);

	document.getElementById('firstDate').innerText = earliestDate;
	document.getElementById('lastDate').innerText = latestDate;

	// TWEET CATEGORIES
	const numCompleted = tweet_array.filter(function(tweet) {
		return tweet.source === "completed_event";
	});
	const numLive = tweet_array.filter(function(tweet) {
		return tweet.source === "live_event";
	});
	const numAchievements = tweet_array.filter(function(tweet) {
		return tweet.source === "achievement";
	});
	const numMisc = tweet_array.filter(function(tweet) {
		return tweet.source === "miscellaneous";
	});
	// console.log("total:", tweet_array.length);
	document.getElementsByClassName('completedEvents')[0].innerText = numCompleted.length;
	document.getElementsByClassName('completedEvents')[1].innerText = numCompleted.length;
	document.getElementsByClassName('liveEvents')[0].innerText = numLive.length;
	document.getElementsByClassName('achievements')[0].innerText = numAchievements.length;
	document.getElementsByClassName('miscellaneous')[0].innerText = numMisc.length;

	document.getElementsByClassName('completedEventsPct')[0].innerText = ((numCompleted.length/tweet_array.length) * 100).toFixed(2) + '%';
	document.getElementsByClassName('liveEventsPct')[0].innerText = ((numLive.length/tweet_array.length) * 100).toFixed(2) + '%';
	document.getElementsByClassName('achievementsPct')[0].innerText = ((numAchievements.length/tweet_array.length) * 100).toFixed(2) + '%';
	document.getElementsByClassName('miscellaneousPct')[0].innerText = ((numMisc.length/tweet_array.length) * 100).toFixed(2) + '%';
	
	// WRITTEN TWEETS
	const numWritten = tweet_array.filter(function(tweet) {
		return tweet.written == true;
	});
	document.getElementsByClassName('written')[0].innerText = numWritten.length;
	document.getElementsByClassName('writtenPct')[0].innerText = ((numWritten.length/numCompleted.length) * 100).toFixed(2) + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});