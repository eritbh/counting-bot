/** @module Yuuko */

const {Command} = require('yuuko');

// TODO - remove dependence on superagent for this command
let superagent;
try {
	// eslint-disable-next-line global-require
	superagent = require('superagent');
} catch (error) {
	throw new Error('The superagent package is required as a peer dependency for the built-in setavatar command.');
}

module.exports = new Command('setavatar', async (msg, args, {client}) => {
	// Get the URL of the image
	let url = args[0] || ''; // URL specified in chat, or an empty string so we can handle errors later
	if (msg.attachments[0]) url = msg.attachments[0].url; // URL specified by upload
	url = url.replace(/<([^>]+)>/, '$1'); // Allow suppressed URLs
	if (!url) {
		msg.channel.createMessage('No image was uploaded or linked.').catch(() => {});
		return;
	}

	// Get the image itself by requesting the URL
	msg.channel.sendTyping();
	try {
		const res = superagent.get(url);
		// Handle possible errors
		if (!res.ok) {
			msg.channel.createMessage(`Got non-ok response (${res.statusCode}) while retrieving avatar`).catch(() => {});
			return;
		}
		// Edit the avatar
		try {
			await client.editSelf({
				avatar: `data:${res.headers['content-type']};base64,${res.body.toString('base64')}`,
			});
		} catch (_) {
			msg.channel.createMessage('There was an error while uploading the new avatar.').catch(() => {});
		}
	} catch (err) {
		msg.channel.createMessage(`Error while retrieving avatar: ${err}`).catch(() => {});
	}
	msg.channel.createMessage('Avatar updated!').catch(() => {});
}, {
	owner: true,
});
