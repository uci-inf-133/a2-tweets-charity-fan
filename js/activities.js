function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const completedTweets = tweet_array.filter(function(tweet) {
		return tweet.source === "completed_event";
	});
	
	// updating spans for most frequent activities
	let activityFrequencies = sortByFrequency(completedTweets); // dictionary of [activity: frequency] pairs sorted in ascending order by frequency
	document.getElementById('numberActivities').innerText = Object.keys(activityFrequencies).length;
	document.getElementById('firstMost').innerText = Object.keys(activityFrequencies)[0];
	document.getElementById('secondMost').innerText = Object.keys(activityFrequencies)[1];
	document.getElementById('thirdMost').innerText = Object.keys(activityFrequencies)[2];
	
	// longest and shortest activities
	let firstMostAvgDistance = averageDistance(completedTweets, Object.keys(activityFrequencies)[0]);
	let secondMostAvgDistance = averageDistance(completedTweets, Object.keys(activityFrequencies)[1]);
	let thirdMostAvgDistance = averageDistance(completedTweets, Object.keys(activityFrequencies)[2]);
	
	const distAvgs = [
		{ activity: Object.keys(activityFrequencies)[0], avg: firstMostAvgDistance },
		{ activity: Object.keys(activityFrequencies)[1], avg: secondMostAvgDistance },
		{ activity: Object.keys(activityFrequencies)[2], avg: thirdMostAvgDistance }
	];

	const longestActivity = distAvgs.reduce((a, b) => (b.avg > a.avg ? b : a));
	const shortestActivity = distAvgs.reduce((a, b) => (b.avg < a.avg ? b : a));
	document.getElementById('longestActivityType').innerText = longestActivity.activity;
	document.getElementById('shortestActivityType').innerText = shortestActivity.activity;
	document.getElementById('weekdayOrWeekendLonger').innerText = "the weekend";

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": tweet_array
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
	  "encoding": {
		"x": {
			"field": "activityType",
			"type": "nominal",
			"title": "Activity Type"
		},
		"y": {
			"aggregate": "count",
			"title": "Number of Tweets"
		}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	tweet_array.forEach(tweet => {
		const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		tweet.dayOfWeek = days[new Date(tweet.time).getDay()];
	});

	// filtering array for only the tweets in the top 3 activities
	const top3ActivityTypes = Object.keys(activityFrequencies).slice(0, 3);
	const top3Activities = tweet_array.filter(tweet => top3ActivityTypes.includes(tweet.activityType) && tweet.dayOfWeek);
	const distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of distances by day of the week for the three most tweeted-about activites.",
	  "data": {
	    "values": top3Activities
	  },
	  "mark": "point",
	  "encoding": {
		"x": {
			"field": "dayOfWeek",
			"type": "ordinal",
			"title": "time (day)",
			"sort": "['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
		},
		"y": {
			"field": "distance",
			"type": "quantitative",
			"title": "distance",
			"scale": {"zero": false}
		},
		"color": { "field": "activityType", "type": "nominal" }
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	const distance_vis_agg_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A plot of the distances by day of the week for all of the three most tweeted-about activities, aggregating the activities by the mean.",
	  "data": {
	    "values": top3Activities
	  },
	  "mark": "point",
	  "encoding": {
		"x": {
			"field": "dayOfWeek",
			"type": "ordinal",
			"title": "time (day)",
			"sort": "['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
		},
		"y": {
			"field": "distance",
			"aggregate": "mean",
			"type": "quantitative",
			"title": "distance",
			"scale": {"zero": false}
		},
		"color": { "field": "activityType", "type": "nominal" }
	  }
	};
	
	// switch on button click
	let showingMean = false;

	document.getElementById("aggregate").addEventListener('click', () => {
		showingMean = !showingMean;
		const graphToShow = showingMean ? distance_vis_agg_spec : distance_vis_spec;
		vegaEmbed('#distanceVis', graphToShow, {actions:false});
		document.getElementById('aggregate').innerText = showingMean ? "Show all activities" : "Show means";
	});
}

function sortByFrequency(completed_tweets) {
	// returns a dictionary of all activity types with corresponding frequencies
	let activityFreqs = {};
	for (let i = 0; i < completed_tweets.length; i++) {
		let activity = completed_tweets[i].activityType;
		if (activity !== "unknown" && activity) {
			if (activityFreqs[activity]) {
				activityFreqs[activity]++;
			} else {
				activityFreqs[activity] = 1;
			}
		}
	}

	// convert to array for sorting
	let freqArray = Object.entries(activityFreqs);
	freqArray.sort((a, b) => b[1] - a[1]);
	const sortedFreqs = Object.fromEntries(freqArray);
	return sortedFreqs;
}

function averageDistance(completed_tweets, activity) {
	let distances_total = 0;
	let activity_count = 0
	for (let i = 0; i < completed_tweets.length; i++) {
		let type = completed_tweets[i].activityType;
		let distance = completed_tweets[i].distance;
		if (type === activity) {
			distances_total += distance;
			activity_count++;
		}
	}
	return distances_total / activity_count;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});