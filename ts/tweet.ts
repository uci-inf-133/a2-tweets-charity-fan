class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.startsWith("Watch my")) {
            return "live_event";
        } else if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        } else if (this.text.startsWith("Achieved")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        if (this.text.includes(" - ")) {
            return true;
        }
        return false;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        // strip until '- ', save written until 'https'
        const start = this.text.indexOf(" - ") + 3;
        const end = this.text.indexOf("https");
        const writtentxt = this.text.substring(start, end).trim();
        return writtentxt;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        let start = 0;
        let end = this.text.length;

        // checks for phrases matching format of ##.## km/mi
        const distance_loc = this.text.match(/\d+(\.\d+)?\s?(km|mi)\s+/i);
        if (distance_loc) {
            start = this.text.indexOf(distance_loc[0]) + distance_loc[0].length;
            end = this.written ? this.text.indexOf("-", start) : this.text.indexOf("with", start);
        } else if (this.text.startsWith("Just posted")) {
            start = this.text.indexOf("Just posted a") + "Just posted a".length + 1;
            end = this.text.indexOf(" in");
        }
        const activity_type = this.text.substring(start, end).trim();
        return activity_type;
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        let distance = 0;
        if (this.text.includes(" km ") || this.text.includes(" mi ")) {
            const words = this.text.trim().split(/\s+/);
            distance = parseFloat(words[3]);
            if (words[4] === "km") {
                distance /= 1.609;
            }
        }
        return distance;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const url = this.text.match(/https?:\/\/\S+/);
        let clickable = this.text;
        if (url) {
            const link = url[0];
            clickable = this.text.replace(link, `<a href="${link}" target="_blank">${link}</a>`)
        }
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${clickable}</td></tr>`;
    }
}