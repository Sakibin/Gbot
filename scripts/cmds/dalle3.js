const axios = require('axios');
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
}; 
module.exports = {
  config: {
    name: "dalle",
    aliases: ["bing", "d3", "imagine"],
    version: "1.0",
    author: "Dipto",
    countDown: 15,
    role: 0,
    description: "Generate images by Unofficial Dalle3",
    category: "download",
    guide: { en: "{pn} prompt" }
  }, 
  onStart: async({ api, event, args }) => {
    const prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    if (!prompt) return api.sendMessage("❌| Wrong Format. ✅ | Use: 17/18 years old boy/girl watching football match on TV with 'Dipto' and '69' written on the back of their dress, 4k", event.threadID, event.messageID);
    try {
       //const cookies = "cookies here (_U value)";
const cookies = ["1JTzKQ22yAC3JaI_61XrakaxXZJZbXE6ZbX1UIn3w7vT_IfruCyBGBwSgFv67kIICgUg-Wwi1XoWSU_TQCngGqNsBNICc7M50sax2BgXiu_s2EKMPlOI_N1C1Bqs43A5M8V7bWUe4drKmg8KI9RSuo_mLHzsiq9-2w6y0YswooGdVlNv0wqeFpysQ0CDKchPQoW_GPwPvempsKuRWXpB2Zg"];
const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];
      const wait = api.sendMessage("creating image....", event.threadID);
      const response = await axios.get(`${await baseApiUrl()}/dalle?prompt=${prompt}&key=dipto008&cookies=${randomCookie}`);
const imageUrls = response.data.imgUrls || [];
      if (!imageUrls.length) return api.sendMessage("Empty response or no images generated.", event.threadID, event.messageID);
      const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'stream' }).then(res => res.data)));
    api.unsendMessage(wait.messageID);
   api.sendMessage({ body: `✅ | Here's Your Generated Photo.`, attachment: images }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID, event.messageID);
    }
  }
}