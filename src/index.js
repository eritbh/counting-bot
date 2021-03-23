const path = require('path');
const {Client} = require('yuuko');
const config = require('../config.json');

const bot = new Client({
	token: config.token,
	prefix: config.prefix,
});
bot.extendContext({
	shouldDeleteNonNumbers (channelID) {
		return false;
	},
	getEmoji (channelID) {
		return '✅';
	},
});

bot.addDir(path.join(__dirname, 'commands'));
bot.addDir(path.join(__dirname, 'events'));

bot.on('ready', () => {
	console.log(`Connected to Discord as ${bot.user.username}#${bot.user.discriminator}`);
});

bot.on('error', (error, shardID) => {
	console.error('Eris error:', shardID, error);
});

bot.connect();
