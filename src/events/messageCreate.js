const {EventListener} = require('yuuko');

function getNumberFromMessage (message) {
	const numberPart = message.content.match(/^\d+$/);
	if (!numberPart) {
		return NaN;
	}
	const num = parseFloat(numberPart[0]);
	if (isNaN(num)) {
		return NaN;
	}
	return num;
}

module.exports = new EventListener('messageCreate', async (message, context) => {
	// Ignore messages not in the counting channel
	if (!message.guildID || message.channel.name !== 'counting') {
		return;
	}

	// Ignore our own messages - sometimes we have good reason to broadcast something
	if (message.author.id === context.client.user.id) {
		return;
	}

	// Only care about messages that are only numbers
	const number = getNumberFromMessage(message);
	if (isNaN(number)) return;

	// Get the latest messages from the channel and find the last one that was counting
	const oldMessages = await message.channel.getMessages();
	oldMessages.splice(0, oldMessages.findIndex(m => m.id === message.id) + 1);
	// eslint-disable-next-line prefer-const,no-unused-vars
	let [lastAuthor, lastNumber] = oldMessages.map(m => [m.author.id, getNumberFromMessage(m)]).find(([author, num]) => !isNaN(num)) || [null, null];
	if (lastNumber == null) {
		lastNumber = 0;
	}

	if (number !== lastNumber + 1 || message.author.id === lastAuthor) {
		// if the number is right but was sent by the same person who sent the previous number, delete it
		// if the number is wrong and doesn't have other text, delete it
		message.delete().catch(error => {
			console.error('error deleting bad number:', error);
		});
	} else {
		message.addReaction(context.getEmoji(message.channel.id)).catch(error => {
			console.error('error adding reaction to good number:', error);
		});
	}
});
