const {EventListener} = require('yuuko');

module.exports = new EventListener('messageCreate', async (message, context) => {
	// Ignore messages not in the counting channel
	if (!message.guildID || message.channel.name !== 'counting') {
		return;
	}

	// Ignore our own messages - sometimes we have good reason to broadcast something
	if (message.author.id === context.client.user.id) {
		return;
	}

	// Only care about messages with numbers in them
	let numberPart = message.content.match(/\d+/);
	if (!numberPart) {
		return;
	}
	numberPart = parseFloat(numberPart[0]);
	if (isNaN(numberPart)) {
		return;
	}

	// Get the latest messages from the channel and find the last one that was counting
	const oldMessages = await message.channel.getMessages();
	oldMessages.splice(0, oldMessages.findIndex(m => m.id === message.id) + 1);
	// eslint-disable-next-line prefer-const,no-unused-vars
	let [lastAuthor, lastNumber] = oldMessages.map(m => [m.author.id, parseInt(m.content.replace(/[,.]/g, ''), 10)]).filter(([author, num]) => !isNaN(num))[0] || [null, null];
	if (lastNumber == null) {
		lastNumber = 0;
	}

	const numberIsCorrect = numberPart === lastNumber + 1;
	const isOnlyNumber = !!message.content.match(/^\d+$/);
	const isLastAuthor = message.author.id === lastAuthor;

	if (numberIsCorrect && (!isOnlyNumber || isLastAuthor) || !numberIsCorrect && isOnlyNumber) {
		// if the number is right but has other text, delete it
		// if the number is right but was sent by the same person who sent the previous number, delete it
		// if the number is wrong and doesn't have other text, delete it
		message.delete().catch(error => {
			console.error('error deleting bad number:', error);
		});
	} else if (numberIsCorrect) {
		// if the number is right and doesn't have other text, approve it
		message.addReaction(context.getEmoji(message.channel.id)).catch(error => {
			console.error('error adding reaction to good number:', error);
		});
	} else {
		// if the number is wrong but has other text, let it vibe
		console.log('weird condition:', message.content, lastNumber);
	}
});
