const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "miuki",
    aliases: ["gpt"],
    version: "1.0.0",
    author: "dipto",
    countDown: 5,
    role: 0,
    description: "Gemini AI with multiple conversation",
    category: "AI"
  },

  onReply: async function ({ event, api, Reply, args }) {
    if (event.senderID != Reply.author) return;

    const uid = event.senderID;
    const reply = event.body;
    try {
      const response = await axios.get(
        `${await baseApiUrl()}/gemini2?text=${encodeURIComponent(reply)}&senderID=${uid}`
      );
      const answer = response.data.response;

      return api.sendMessage(answer, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID
        });
      }, event.messageID);
    } catch (e) {
      return api.sendMessage("❌ Error: " + e.message, event.threadID, event.messageID);
    }
  },

  onStart: async function ({ event, api, args }) {
    const uid = event.senderID;
    if (!args[0]) {
      return api.sendMessage(
        "Please provide a question.\n\nExample:\nmiuki hello",
        event.threadID,
        event.messageID
      );
    }

    try {
      const text = args.join(" ");
      const response = await axios.get(
        `${await baseApiUrl()}/gemini2?text=${encodeURIComponent(text)}&senderID=${uid}`
      );
      const answer = response.data.response;

      return api.sendMessage(answer, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID
        });
      }, event.messageID);
    } catch (e) {
      return api.sendMessage("❌ Failed: " + e.message, event.threadID, event.messageID);
    }
  }
};