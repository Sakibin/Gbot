const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { getStreamFromURL } = global.utils;

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`,
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "sing",
    version: "1.14",
    aliases: ["song", "music", "play"],
    author: "xnil6x",
    countDown: 5,
    role: 0,
    description: {
      en: "Download audio from YouTube"
    },
    category: "media",
    guide: {
      en: "{pn} [<song name>|<song link>]: Use this command to download audio from YouTube.\n   Example:\n{pn} chipi chipi chapa chapa"
    }
  },
  langs: {
    en: {
      error: "❌ An error occurred: %1",
      noResult: "⭕ No search results match the keyword %1. Please try again.",
      choose: "✅ | Reply with number.↩ \n\n%1",
      audio: "Audio: ",
      noAudio: "⭕ Sorry, no audio was found with a size less than 26MB.",
      playing: "🎧 Now playing: %1",
      selectSong: "Reply with number.↩",
      invalidChoice: "❌ Invalid choice. Please enter a number between 1 and 6."
    }
  },

  onStart: async function({ args, message, event, commandName, getLang, api }) {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    let videoID;
    const urlYtb = checkurl.test(args[0]);

    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
      const { data: { title, downloadLink } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );
      await message.reply(title);

      // Download to cache
      const cachePath = path.join(__dirname, "cache", `${videoID}.mp3`);
      const writer = fs.createWriteStream(cachePath);
      const response = await axios.get(downloadLink, { responseType: "stream" });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send audio
      await api.sendMessage(
        { attachment: fs.createReadStream(cachePath) },
        event.threadID,
        () => fs.unlinkSync(cachePath)
      );
      return;
    }

    let keyWord = args.join(" ");
    keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
    const maxResults = 6;
    let result;
    
    try {
      result = ((await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data).slice(0, maxResults);
    } catch (err) {
      return message.reply(getLang("error", err.message));
    }

    if (result.length === 0)
      return message.reply(getLang("noResult", keyWord));

    let msg = "";
    let i = 1;
    const thumbnails = [];
    
    for (const info of result) {
      thumbnails.push(getStreamFromURL(info.thumbnail));
      msg += `${i++}. ${info.title} ${info.time}\n\n`;
    }

    message.reply({
      body: getLang("choose", msg),
      attachment: await Promise.all(thumbnails)
    }, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        result
      });
    });
  },

  onReply: async ({ event, api, Reply, message, getLang }) => {
    try {
      const { result } = Reply;
      const choice = parseInt(event.body);
      
      if (!isNaN(choice) && choice <= result.length && choice > 0) {
        const infoChoice = result[choice - 1];
        const idvideo = infoChoice.id;
        
        const { data: { title, downloadLink, quality } } = await axios.get(
          `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
        );
        
        await message.unsend(Reply.messageID);
        await message.reply(`• Title: ${title}\n• Quality: ${quality}\n\n🛸 Fixed by @Sakibin Sinha`);

        // Download to cache
        const cachePath = path.join(__dirname, "cache", `${idvideo}.mp3`);
        const writer = fs.createWriteStream(cachePath);
        const response = await axios.get(downloadLink, { responseType: "stream" });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        // Send audio
        await api.sendMessage(
          { attachment: fs.createReadStream(cachePath) },
          event.threadID,
          () => fs.unlinkSync(cachePath)
        );
      } else {
        message.reply(getLang("invalidChoice"));
      }
    } catch (error) {
      console.log(error);
      message.reply(getLang("noAudio"));
    }
  }
};
