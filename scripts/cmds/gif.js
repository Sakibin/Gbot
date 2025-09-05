const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
	config: {
		name: "gif",
		version: "1.0.0",
		author: "August Quinn",
		countDown: 5,
		role: 0,
		description: {
			en: "Search for GIFs on Giphy and send them as attachments."
		},
		category: "fun",
		guide: {
			en: "{pn} <query>"
		}
	},

	onStart: async function ({ message, args }) {
		if (args.length === 0) {
			return message.reply("Please provide a search query for Giphy.");
		}
		const query = args.join(' ');
		const apiKey = 'QHv1qVaxy4LS3AmaNuUYNT9zr40ReFBI';
		const cacheDir = path.join(__dirname, 'cache');
		if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

		try {
			const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
				params: {
					q: query,
					api_key: apiKey,
					limit: 6,
					rating: 'g',
				},
			});
			const gifResults = response.data?.data || [];
			if (gifResults.length > 0) {
				const gifAttachments = [];
				try {
					for (let i = 0; i < gifResults.length; i++) {
						const gifURL = gifResults[i].images.original.url;
						const filePath = path.join(cacheDir, `giphy${i}.gif`);
						const getContent = (await axios.get(gifURL, { responseType: 'arraybuffer' })).data;
						fs.writeFileSync(filePath, Buffer.from(getContent, 'binary'));
						gifAttachments.push(fs.createReadStream(filePath));
					}
					await message.reply({ attachment: gifAttachments });
				} finally {
					for (let i = 0; i < gifResults.length; i++) {
						const filePath = path.join(cacheDir, `giphy${i}.gif`);
						if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
					}
				}
			} else {
				message.reply('No GIFs found for the provided query.');
			}
		} catch (error) {
			console.error(error);
			message.reply('An error occurred while searching for GIFs.');
		}
	}
};
