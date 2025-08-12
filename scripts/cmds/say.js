module.exports = {
  config: {
    name: "say",
    aliases: ["x", "h"],
    version: "1.0.0",
    role: 0,
    author: "sakibin",
    premium: false,
    description: "text to voice speech messages",
    prefix: true,
    category: "with prefix",
    guide: {
      en: "Use: {pn} <text>"
    },
    countDown: 5,
    dependencies: {
      "path": "",
      "fs-extra": ""
    }
  },

  onStart: async function({ message, event, args }) {
    try {
      const { createReadStream, unlinkSync } = require("fs");
      const { resolve } = require("path");
      var content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
      // Use "bn" as default language, and detect if user wants another supported language
      var languageToSay = (["ru", "en", "ko", "ja", "tl"].some(item => content.indexOf(item) == 0)) ? content.slice(0, content.indexOf(" ")) : "bn";
      var msg = (languageToSay != "bn") ? content.slice(3, content.length) : content;
      const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
      await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`, path);
      await message.reply({
        attachment: createReadStream(path)
      });
      unlinkSync(path);
    } catch (e) {
      return message.reply("Error: " + e.message);
    }
  }
};



