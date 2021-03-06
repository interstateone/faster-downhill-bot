var Botkit = require('botkit')
var request = require('request')
var mapsToken = process.env.GOOGLE_MAPS_TOKEN

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

controller.hears(['where'], ['direct_message', 'direct_mention'], function (bot, message) {
	request('http://tracker.brandonevans.ca/points/latest', function(error, response, body) {
		var point = JSON.parse(body);
		var prefix = point.inside ? " in " : " near ";
		var location = point.name;

		var text = 'I\'m' + prefix + location
		var imageURL = 'https://maps.googleapis.com/maps/api/staticmap?center=' + encodeURIComponent(location) + '&zoom=6&size=400x250&maptype=roadmap&key=' + mapsToken
		var attachments = [{
			username: "slug",
			fallback: text,
			pretext: ':round_pushpin: ' + text,
			image_url: imageURL
		}]
		bot.reply(message, {attachments: attachments});
	});	
});

controller.hears(['.*'], ['direct_message', 'direct_mention'], function (bot, message) {
	bot.reply(message, "Sorry, I didn't understand that. I blame my creator. :face_with_rolling_eyes:\n My source is here if you'd like to suggest changes: https://github.com/interstateone/faster-downhill-bot");
});
