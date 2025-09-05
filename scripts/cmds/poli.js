const axios = require('axios');
const fs = require('fs-extra');
const path = __dirname + '/cache/poli.png';

module.exports = {
	config: {
		name: "poli",
		version: "1.0.0",
		author: "jameslim",
		countDown: 2,
		role: 0,
		description: {
			en: "Generate image from Pollinations AI"
		},
		category: "ai",
		guide: {
			en: "{pn} <query>"
		}
	},

	onStart: async function ({ message, args, event, api }) {
		// Add reaction indicator
		if (typeof api?.sendMessage === "function" && event?.messageID) {
			api.setMessageReaction("🎨", event.messageID, () => {}, true);
		}
		const query = args.join(" ");
		if (!query) return message.reply("put text/query");
		const poli = (await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
			responseType: "arraybuffer"
		})).data;
		fs.writeFileSync(path, Buffer.from(poli, "utf-8"));
		await message.reply({
			body: "» Here is your image.",
			attachment: fs.createReadStream(path)
		});
		fs.unlinkSync(path);
	}
};
