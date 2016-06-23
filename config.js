module.exports = {

	// Channel or group name, required only if 'method' is not 'user'
	channelOrGroup: 'bot-lropero',

	// Wordsbot's commands
	commands: {
		contains: 'contains',
		endsWith: 'ends-with',
		guess: 'guess',
		ocurrencies: 'ocurrencies',
		startsWith: 'starts-with',
		thinkAWord: 'think a word'
	},

	// Error messages
	errors: {
		noEnd: 'Seems like the word ends with no letter :(',
		noFriend: 'My friend is not connected :(',
		noMethod: 'Method is not configured properly :(',
		noStart: 'Seems like the word starts with no letter :(',
		Unable: 'Sorry, I\'m unable to find the word :(',
		zeroLetters: 'The word has zero letters :('
	},

	// Wordsbot's name, referred to as "friend" because we need him to play the word guessing game
	friend: 'wordsbot',

	// Method of interaction, either 'channel', 'group', or 'user' (direct message)
	method: 'group',

	// Bot's name
	name: 'newton',

	// Time to wait until retrying after 'slackbots' library fails to send a message, expressed in milliseconds
	retry: 10000,

	// Slack's token
	token: 'SLACK BOT TOKEN GOES HERE',

	// Time to wait until sending next message, expressed in milliseconds
	wait: 1000
};
