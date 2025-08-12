module.exports = {
  config: {
    name: "add",
    aliases: [],
    version: "1.2",
    author: "ᴀɴɪᴋ_🐢",
    countDown: 2,
    role: 0,  // role changed to 0 so everyone can use
    shortDescription: {
      en: "ᴀᴅᴅ ᴀɴʏᴏɴᴇ ɪɴ ɢʀᴏᴜᴘ"
    },
    longDescription: {
      en: "ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴜɪᴅ ᴛᴏ ᴀᴅᴅ ᴛʜᴇᴍ ɪɴ ɢʀᴏᴜᴘ"
    },
    category: "ɢʀᴏᴜᴘ",
    guide: {
      en: "🧩 | ᴜsᴀɢᴇ:\n» {pn} [ᴜɪᴅ] ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    let targetUID;

    if (args[0]) {
      targetUID = args[0];
    } else if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else {
      return api.sendMessage("⚠️ | ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴜɪᴅ ʙᴏss!", threadID);
    }

    try {
      await api.addUserToGroup(targetUID, threadID);

      // ইউজারের নাম ও মেনশন ফরম্যাট তৈরি
      const userInfo = await api.getUserInfo(targetUID);
      let userName = `@user`;
      if (userInfo && userInfo[targetUID] && userInfo[targetUID].name) {
        userName = userInfo[targetUID].name;
      }

      // মেনশন সহ মেসেজ
      api.sendMessage({
        body: `✅ | ${userName} ᴀᴅᴅᴇᴅ ɪɴ ɢʀᴏᴜᴘ!`,
        mentions: [{ tag: userName, id: targetUID }]
      }, threadID);

    } catch (err) {
      api.sendMessage(`❌ | ᴄᴀɴ'ᴛ ᴀᴅᴅ ᴛʜᴇ ᴘᴇʀsᴏɴ ʙᴏꜱꜱ 😢:\n${err.message}`, threadID);
    }
  }
};
