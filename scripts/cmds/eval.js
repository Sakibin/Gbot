const { removeHomeDir, log } = global.utils;

module.exports = {
	config: {
		name: "eval",
		version: "1.6",
		author: "ɴᴛᴋʜᴀɴɢ & ᴀɴɪᴋ_🐢",
		countDown: 5,
		role: 2,
		description: {
			en: "ᴛᴇsᴛ ᴄᴏᴅᴇ ǫᴜɪᴄᴋʟʏ"
		},
		category: "ᴏᴡɴᴇʀ",
		guide: {
			en: "{pn} <ᴄᴏᴅᴇ ᴛᴏ ᴛᴇsᴛ>"
		}
	},

	langs: {
		en: {
			error: "❌ ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ:",
			noPerm: "⛔  Only Sakibin can use this module"
		}
	},

	onStart: async function ({ api, args, message, event, getLang }) {
		// ᴜɪᴅ ʟᴏᴄᴋ ғᴏʀ sᴀᴊɪɴ
		if (event.senderID !== "100065445284007") {
			return message.reply(getLang("noPerm"));
		}

		function output(msg) {
			if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
				msg = msg.toString();
			else if (msg instanceof Map) {
				let text = `ᴍᴀᴘ(${msg.size}) `;
				text += JSON.stringify(mapToObj(msg), null, 2);
				msg = text;
			}
			else if (typeof msg == "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg == "undefined")
				msg = "ᴜɴᴅᴇғɪɴᴇᴅ";

			message.reply(msg);
		}
		function out(msg) {
			output(msg);
		}
		function mapToObj(map) {
			const obj = {};
			map.forEach(function (v, k) {
				obj[k] = v;
			});
			return obj;
		}
		const cmd = `
		(async () => {
			try {
				${args.join(" ")}
			}
			catch(err) {
				log.err("eval command", err);
				message.send(
					"${getLang("error")}\\n" +
					(err.stack ?
						removeHomeDir(err.stack) :
						removeHomeDir(JSON.stringify(err, null, 2) || "")
					)
				);
			}
		})()`;
		eval(cmd);
	}
};