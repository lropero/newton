# newton
A Slack bot that guesses wordsbot's word

## Author
Luciano Ropero: <lropero@gmail.com>

## Installation and run
First off, you need [Node.js](https://nodejs.org/) installed on your computer. Then execute:

```sh
$ npm install
$ npm start
```

> Note that npm consumes package.json so make sure you are standing at the root of the project folder where this file resides. Also note that this bot depends on another bot which needs to be running called 'wordsbot', written by Rocio Belfiore.

## Configuration
These configurations are modified within config.js file:

### - channelOrGroup
Channel or group name, required only if 'method' is not 'user'

### - commands
Wordsbot's commands

### - errors
Error messages

### - friend
Wordsbot's name, referred to as "friend" because we need him to play the word guessing game

### - method
Method of interaction, either 'channel', 'group', or 'user' (direct message)

### - name
Bot's name

### - retry
Time to wait until retrying after 'slackbots' library fails to send a message, expressed in milliseconds

### - roken
Slack's token

### - wait
Time to wait until sending next message, expressed in milliseconds
