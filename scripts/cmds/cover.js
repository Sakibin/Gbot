module.exports = {
	config: {
		name: "cover",
		version: "1.0.0",
		author: "Sakibin",
		countDown: 10,
		role: 0,
		description: {
			en: "Make a Facebook cover"
		},
		category: "edit",
		guide: {
			en: "{pn} name1,name2,email,phonenumber,address,color"
		}
	},

	onStart: async function ({ message, args, event }) {
		const axios = require("axios");
		const fs = require("fs-extra");
		const moment = require("moment-timezone");
		const time = moment.tz("Asia/Dhaka").format("LLLL");

		const inputText = args.join(" ").trim().replace(/\s+/g, " ").replace(/(\s+\|)/g, "|").replace(/\|\s+/g, "|").replace(/\|/g, ",");
		const textArray = inputText.split(",");

		const text1 = textArray[0] || "";
		const text2 = textArray[1] || "";
		const text3 = textArray[2] || "";
		const text4 = textArray[3] || "";
		const text5 = textArray[4] || "";
		const color = textArray[5] || "";
		const uid = event.senderID;

		if (!text1) {
			return message.reply("❗ Example:\ncover name1,name2,email,phonenumber,address,color");
		}

		const apiEndpoint = `https://xakibin-fs8d.onrender.com/fbcover/v1?name=${encodeURIComponent(text1)}&color=${encodeURIComponent(color)}&address=${encodeURIComponent(text5)}&email=${encodeURIComponent(text3)}&subname=${encodeURIComponent(text2)}&sdt=${encodeURIComponent(text4)}&uid=${uid}`;
		const pathSave = `${__dirname}/cache/server4.png`;

		try {
			await message.reply("⚙️ Processing your request...");
			const response = await axios.get(apiEndpoint, { responseType: "arraybuffer" });
			fs.writeFileSync(pathSave, Buffer.from(response.data));
			await message.reply({
				body: `✅ Your Cover was created by Sakibin Server at ${time} 🔖`,
				attachment: fs.createReadStream(pathSave)
			});
			fs.unlinkSync(pathSave);
		} catch (error) {
			let errorMessage = "ERROR ❌\nSAKIBIN Server Busy 😓";
			if (error.response && error.response.data) {
				try {
					const errData = JSON.parse(error.response.data.toString());
					errorMessage += `\nDetails: ${errData.message || "Unknown error"}`;
				} catch {
					errorMessage += "\nDetails: Unable to parse server error response.";
				}
			}
			return message.reply(errorMessage);
		}
	}
};
