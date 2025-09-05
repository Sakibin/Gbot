const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const moment = require("moment-timezone");

const allowedUsers = ["100065445284007", "100083289819306"];
const godUsers = ["100065445284007", "100083289819306"];

module.exports = {
	config: {
		name: "admin",
		aliases: ["self"],
		version: "1.6",
		author: "sakibin",
		countDown: 5,
		usePrefix: false,
		role: 0,
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "Add, remove, edit admin role"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng'
				+ '\n	  {pn} [list | -l]: Liệt kê danh sách admin',
			en: '   {pn} [add | -a] <uid | @tag>: Add admin role for user'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Remove admin role of user'
				+ '\n	  {pn} [list | -l]: List all admins'
		}
	},

	langs: {
		vi: {
			added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin từ trước rồi:\n%2",
			missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
			removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
			listAdmin: "👑 | Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID or tag user to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | List of admins:\n%1",
			listId: "•═════•UID•═════•\n%1\n•═════•LIST•═════•",
			noPermission: "❗ Only Sakibin can manage admin list!",
			invalidPage: "Invalid page number."
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const senderID = event.senderID;
		const adminList = config.adminBot;
		const time = moment().tz("Asia/Dhaka").format("HH:mm:ss D/MM/YYYY");
		switch ((args[0] || "").toLowerCase()) {
			case "all":
			case "ls": {
				const getNames = await Promise.all(adminList.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(
					"🎓 | Owner: Sakibin Sinha\n•══════════════•\n" +
					getNames.map(({ name }) => `👤 | ${name}`).join("\n")
				);
			}
			case "id":
			case "uid":
			case "ids": {
				return message.reply(
					getLang("listId", adminList.map(uid => `» UID${uid}`).join("\n"))
				);
			}
			case "list": {
				const page = parseInt(args[1]) || 1;
				const itemsPerPage = 20;
				const totalPages = Math.ceil(adminList.length / itemsPerPage);
				if (page < 1 || page > totalPages) {
					return message.reply(getLang("invalidPage"));
				}
				const startIndex = (page - 1) * itemsPerPage;
				const endIndex = page * itemsPerPage;
				const getNames = await Promise.all(
					adminList.slice(startIndex, endIndex).map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);
				return message.reply(
					"🎓 | Owner: Sakibin Sinha\n•══════════════•\n" +
					getNames.map(({ name }, i) => `👤${startIndex + i + 1} » ${name}`).join("\n") +
					`\n🄿🄰🄶🄴 ${page}/${totalPages} 🄻🄸🅂🅃`
				);
			}
			case "add":
			case "+": {
				if (!allowedUsers.includes(senderID))
					return message.reply(getLang("noPermission"));
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));
				if (!uids.length)
					return message.reply(getLang("missingIdAdd"));
				const notAdminIds = [];
				const adminIds = [];
				for (const uid of uids) {
					if (adminList.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}
				adminList.push(...notAdminIds);
				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(notAdminIds.length > 0
						? `❗ | Added ${notAdminIds.length} new admin.\n` +
							getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `✦ ${name}\n✦ ${uid}\n✦ ${time}`).join("\n")
						: "") +
					(adminIds.length > 0
						? `\n⚠️ | ${adminIds.length} users already have admin role:\n` +
							getNames.filter(({ uid }) => adminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")
						: "")
				);
			}
			case "god": {
				if (!godUsers.includes(senderID))
					return message.reply(getLang("noPermission"));
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));
				if (!uids.length)
					return message.reply(getLang("missingIdAdd"));
				const notAdminIds = [];
				const adminIds = [];
				for (const uid of uids) {
					if (adminList.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}
				adminList.push(...notAdminIds);
				const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(notAdminIds.length > 0
						? `❗ | Added ${notAdminIds.length} new admin.\n` +
							getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `✦ ${name}\n✦ ${uid}\n✦ ${time}`).join("\n")
						: "") +
					(adminIds.length > 0
						? `\n⚠️ | ${adminIds.length} users already have admin role:\n` +
							getNames.filter(({ uid }) => adminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")
						: "")
				);
			}
			case "remove":
			case "rm":
			case "delete":
			case "-": {
				if (!allowedUsers.includes(senderID))
					return message.reply(getLang("noPermission"));
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else
					uids = args.filter(arg => !isNaN(arg));
				if (!uids.length)
					return message.reply(getLang("missingIdRemove"));
				const notAdminIds = [];
				const adminIds = [];
				for (const uid of uids) {
					if (adminList.includes(uid))
						adminIds.push(uid);
					else
						notAdminIds.push(uid);
				}
				for (const uid of adminIds)
					adminList.splice(adminList.indexOf(uid), 1);
				const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(adminIds.length > 0
						? `📛 | Removed ${adminIds.length} Admin Sakibin Bot.\n` +
							getNames.map(({ uid, name }) => `✦ ${name}\n✦ ${uid}\n✦ ${time}`).join("\n")
						: "") +
					(notAdminIds.length > 0
						? `\n⚠️ | ${notAdminIds.length} users don't have admin role:\n` +
							notAdminIds.map(uid => `• ${uid}`).join("\n")
						: "")
				);
			}
			default:
				return message.SyntaxError();
		}
	}
};
