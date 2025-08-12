const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.7",
		author: "NTKhang + Modified by XNIL + Updated by Sakibin",
		countDown: 5,
		role: 0,
		description: "Change bot prefix in your group or globally",
		category: "config",
		guide: {
			en: "{pn} <new prefix>: change prefix in this group\n"
				+ "{pn} <new prefix> -g: change global prefix (admin only)\n"
				+ "{pn} reset: reset prefix to default"
		}
	},

	langs: {
		en: {
			reset: "✅ Prefix reset to default:\n➡️  System prefix: %1",
			onlyAdmin: "⛔ Only admin can change the system-wide prefix.",
			confirmGlobal: "⚙️ Global prefix change requested.\n🪄 React to confirm.",
			confirmThisThread: "🛠️ Group prefix change requested.\n🪄 React to confirm.",
			successGlobal: "✅ Global prefix changed successfully!\n🆕 New prefix: %1",
			successThisThread: "✅ Group prefix updated!\n🆕 New prefix: %1"
		}
	},

	onStart: async function ({ api, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) return api.shareContact("Syntax error!", "100065445284007", event.threadID);

		if (args[0] === "reset") {
			await threadsData.set(event.threadID, null, "data.prefix");
			const msgText = getLang("reset", global.GoatBot.config.prefix);
			return api.shareContact(msgText, "100065445284007", event.threadID);
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix,
			setGlobal: args[1] === "-g"
		};

		if (formSet.setGlobal && role < 2)
			return api.shareContact(getLang("onlyAdmin"), "100065445284007", event.threadID);

		const confirmMsg = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

		const sentMessage = await api.shareContact(confirmMsg, "100065445284007", event.threadID);
		formSet.messageID = sentMessage.messageID;
		global.GoatBot.onReaction.set(sentMessage.messageID, formSet);
	},

	onReaction: async function ({ api, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return api.shareContact(getLang("successGlobal", newPrefix), "100065445284007", event.threadID);
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return api.shareContact(getLang("successThisThread", newPrefix), "100065445284007", event.threadID);
		}
	},

	onChat: async function ({ api, event }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			const systemPrefix = global.GoatBot.config.prefix;
			const groupPrefix = utils.getPrefix(event.threadID);

			const dateTime = new Date().toLocaleString("en-US", {
				timeZone: "Asia/Dhaka",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
				day: "2-digit",
				month: "2-digit",
				year: "numeric"
			});

			const [datePart, timePart] = dateTime.split(", ");

			const infoBox = `

🌐 System Prefix  : ${systemPrefix}
💬 Group Prefix   : ${groupPrefix}
🕒 Time           : ${timePart}
📅 Date           : ${datePart}
`;

			return api.shareContact(infoBox, "100065445284007", event.threadID);
		}
	}
};
