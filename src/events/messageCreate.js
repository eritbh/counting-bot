const {EventListener} = require('yuuko');

module.exports = new EventListener('messageCreate', message => {
	console.log(message.content);
});
