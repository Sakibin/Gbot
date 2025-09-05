const APIURL = global.GoatBot.config.ApiUrl;

module.exports = {
	config: {
		name: "emojimix",
		version: "1.0.1",
		author: "Deku",
		countDown: 0,
		role: 0,
		description: {
			en: "Mix emoji"
		},
		category: "image",
		guide: {
			en: "{pn} <emoji1> | <emoji2>"
		}
	},

	onStart: async function ({ message, args }) {
		const fs = require("fs-extra");
		const axios = require("axios");
		const [emoji1, emoji2] = args.join(" ").split("|").map(e => e && e.trim());
		if (!emoji1 || !emoji2) {
			return message.reply("Wrong format!\nUse: emojimix emoji1 | emoji2");
		}
		const path = __dirname + "/cache/emojimix.png";
		try {
			const res = await axios.get(`${APIURL}/api/maker/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}&apikey=SAKIBIN-FREE-SY6B4X`, { responseType: "arraybuffer" });
			fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
			await message.reply({ attachment: fs.createReadStream(path) });
			fs.unlinkSync(path);
		} catch (err) {
			return message.reply(`Can't mix ${emoji1} and ${emoji2}`);
		}
	}
};
