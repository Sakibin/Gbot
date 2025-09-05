const APIURL = global.GoatBot.config.ApiUrl;
const APIKEY = "SAKI-BIN-SWT56X";

module.exports = {
	config: {
		name: "circle",
		version: "2.0.0",
		author: "SAKIBIN",
		countDown: 0,
		role: 0,
		description: {
			en: "Apply circle effect to an image using uid/mention/reply"
		},
		category: "fun",
		guide: {
			en: "{pn} [reply_image/@mention]"
		}
	},

	onStart: async function ({ message, args, event }) {
		const axios = require("axios");
		const fs = require("fs-extra");
		let url;
		if (args.join().indexOf('@') !== -1 && event.mentions && Object.keys(event.mentions).length > 0) {
			url = `https://graph.facebook.com/${Object.keys(event.mentions)[0]}/picture?width=720&height=720&access_token=1174099472704185|0722a7d5b5a4ac06b11450f7114eb2e9`;
		} else if (event.type === "message_reply" && event.messageReply?.attachments?.[0]?.url) {
			url = event.messageReply.attachments[0].url;
		} else {
			url = args[0] || `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=1174099472704185|0722a7d5b5a4ac06b11450f7114eb2e9`;
		}
		const cacheDir = __dirname + `/cache`;
		const pathImg = cacheDir + `/circle_${event.senderID}.png`;
		// Ensure cache directory exists
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}
		const res = await axios.get(`${APIURL}/api/maker/circle?url=${encodeURIComponent(url)}&apikey=${APIKEY}`, { responseType: "arraybuffer" });
		fs.writeFileSync(pathImg, Buffer.from(res.data));
		await message.reply({ attachment: fs.createReadStream(pathImg) });
		fs.unlinkSync(pathImg);
	}
};
