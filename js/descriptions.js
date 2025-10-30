function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	written = tweet_array.filter(tweet => tweet.written);
	document.getElementById("searchCount").innerText = 0;
	document.getElementById("searchText").innerText = "";
	
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const searchBox = document.getElementById("textFilter");
	const table = document.getElementById("tweetTable");
	searchBox.addEventListener('input', () => {
		const search = searchBox.value.toLowerCase();
		document.getElementById("searchText").innerText = search;

		// if search is empty, clear table
		if (!search) {
			table.innerHTML = "";
			document.getElementById("searchCount").innerText = 0;
			return;
		}

		const matching = written.filter(tweet => tweet.writtenText.toLowerCase().includes(search));

		document.getElementById("searchCount").innerText = matching.length;

		table.innerHTML = "";
		matching.forEach((tweet, index) => {
			table.innerHTML += tweet.getHTMLTableRow(index + 1);
		});
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});