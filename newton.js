var _ = require('lodash');
var axios = require('axios');
var cheerio = require('cheerio');
var SlackBot = require('slackbots');

var config = require('./config');

function Newton() {

	var bot = new SlackBot({
		name: config.name,
		token: config.token
	});

	var candidates;
	var counter;
	var current;
	var friend;
	var keys;
	var lastMessage;
	var me;

	// These variables are to overcome a random behaviour within 'slackbots'
	// library where it won't send a message, so we retry until it gets sent
	var retry;
	var waitFor;

	var word = {
		ocurrencies: {},
		startsWith: '',
		endsWith: ''
	};

	bot.on('start', function() {
		bot.getUsers().then(function(users) {

			friend = _.filter(users.members, {
				'name': config.friend
			});

			if(!friend.length) {
				error(config.errors.noFriend);
			} else {

				me = _.filter(users.members, {
					'name': config.name
				});

				friend = friend[0];
				me = me[0];

				console.log(me.name.charAt(0).toUpperCase() + me.name.slice(1) + ' is running, let\'s play :)');

				send(config.commands.thinkAWord);
			}
		});
	});

	bot.on('message', function(message) {
		if(message.type === 'message') {
			switch(message.user) {

				case friend.id:
					if(message.text.indexOf('<@' + me.id + '>: ') === 0) {
						switch(lastMessage) {

							case config.commands.thinkAWord:
								current = 'a';
								setTimeout(function() {
									send(config.commands.ocurrencies, current);
								}, config.wait);
							break;

							case config.commands.ocurrencies:

								var ocurrencies = parseInt(message.text.slice(('<@' + me.id + '>: ').length), 10);

								if(ocurrencies > 0) {
									word.ocurrencies[current] = ocurrencies;
								}

								if(current !== 'z') {
									current = String.fromCharCode(current.charCodeAt(0) + 1);
									setTimeout(function() {
										send(config.commands.ocurrencies, current);
									}, config.wait);
								} else {

									keys = Object.keys(word.ocurrencies);

									if(!keys.length) {
										error(config.errors.zeroLetters);
									} else {
										counter = 0;
										setTimeout(function() {
											send(config.commands.startsWith, keys[counter]);
										}, config.wait);
									}
								}
							break;

							case config.commands.startsWith:

								var result = message.text.slice(('<@' + me.id + '>: ').length);

								if(result === 'True') {

									word.startsWith = keys[counter];

									counter = 0;
									setTimeout(function() {
										send(config.commands.endsWith, keys[counter]);
									}, config.wait);
								} else {
									if(typeof(keys[++counter]) === 'undefined') {
										error(config.errors.noStart);
									} else {
										setTimeout(function() {
											send(config.commands.startsWith, keys[counter]);
										}, config.wait);
									}
								}
							break;

							case config.commands.endsWith:

								var result = message.text.slice(('<@' + me.id + '>: ').length);

								if(result === 'True') {

									word.endsWith = keys[counter];

									searchCandidates();
								} else {
									if(typeof(keys[++counter]) === 'undefined') {
										error(config.errors.noEnd);
									} else {
										setTimeout(function() {
											send(config.commands.endsWith, keys[counter]);
										}, config.wait);
									}
								}
							break;

							case config.commands.guess:

								var result = message.text.slice(('<@' + me.id + '>: ').length);

								if(result.indexOf('Congrats!') === 0) {
									console.log('YAY!! The word is ' + candidates[counter] + ' :)');
									process.exit();
								} else if(result.indexOf('Wrong') === 0) {
									if(typeof(candidates[++counter]) === 'undefined') {
										error(config.errors.unable);
									} else {
										setTimeout(function() {
											send(config.commands.guess, candidates[counter]);
										}, config.wait);
									}
								}
							break;
						}
					}
				break;

				case me.id:
					if(message.text.slice(('<@' + friend.id + '>: ').length) === waitFor) {
						clearTimeout(retry);
					}
				break;
			}
		}
	});

	var error = function(message) {

		console.log(message);

		var params = {
			as_user: true
		};

		switch(config.method) {

			case 'channel':
				var promise = bot.postMessageToChannel(config.channelOrGroup, message, params);
			break;

			case 'group':
				var promise = bot.postMessageToGroup(config.channelOrGroup, message, params);
			break;

			case 'user':
				var promise = bot.postMessageToUser(friend.name, message, params);
			break;

			default:
				process.exit();
		}

		promise.always(function() {
			process.exit();
		});
	};

	var searchCandidates = function() {

		candidates = [];

		var letters = '';

		for(var i = 0; i < keys.length; i++) {
			for(var j = 0; j < word.ocurrencies[keys[i]]; j++) {
				letters += keys[i];
			}
		}

		console.log('Searching anagrams of ' + letters);

		axios.get('http://en.anagramme-expert.com/' + letters + '/').then(function(response) {

			// The only "decent" anagram retrieval service doesn't have an API so we need to parse HTML :(
			var $ = cheerio.load(response.data);
			var $liste_anagramme = $('div#liste_anagramme');
			var first = $liste_anagramme.find('h3').first().html();
			if(first.indexOf(letters.length + ' character') > -1) {
				$liste_anagramme.find('ul.liste').first().find('li').each(function(index, element) {
					var anagram = $(element).attr('id').slice(3);
					if(anagram.charAt(0) === word.startsWith && anagram.charAt(letters.length - 1) === word.endsWith) {
						candidates.push(anagram);
					}
				});
			}

			if(candidates.length) {
				counter = 0;
				setTimeout(function() {
					send(config.commands.guess, candidates[counter]);
				}, config.wait);
			} else {
				error(config.errors.unable);
			}
		});
	};

	var send = function(message, param) {

		lastMessage = message;

		var param = typeof param !== 'undefined' ? (' ' + param) : '';

		console.log('Sending ' + message + param);

		waitFor = message + param;
		retry = setTimeout(function() {
			send(message, param.trim());
		}, config.retry);

		var params = {
			as_user: true
		};

		switch(config.method) {

			case 'channel':
				bot.postMessageToChannel(config.channelOrGroup, '<@' + friend.id + '>: ' + message + param, params);
			break;

			case 'group':
				bot.postMessageToGroup(config.channelOrGroup, '<@' + friend.id + '>: ' + message + param, params);
			break;

			case 'user':
				bot.postMessageToUser(friend.name, '<@' + friend.id + '>: ' + message + param, params);
			break;

			default:
				error(config.errors.noMethod);
		}
	};
}

var newton = new Newton();
