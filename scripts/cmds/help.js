const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "3.3",
    author: "NTKhang // Modified by Sakibin",
    countDown: 5,
    role: 0,
    description: "Show available commands or specific command usage",
    category: "info",
    guide: {
      en: "{pn} [command] - View command details\n{pn} all - View all commands\n{pn} c [category] - View commands in category"
    },
    envConfig: {
      autoUnsend: true,
      delayUnsend: 60
    }
  },

  langs: {
    en: {
      helpHeader: "╔═─── HELP ──═╗",
      categoryHeader: "\n╟─ 📂 Category: {category}",
      commandItem: "║ • {name}",
      helpFooter: "╚═───────═╝",
      commandInfo:
        "╔═─ COMMAND INFO ─═╗\n" +
        "║ 🏷️ Name: {name}\n" +
        "║ 📝 Description: {description}\n" +
        "║ 📂 Category: {category}\n" +
        "║ 🔤 Aliases: {aliases}\n" +
        "║ 🧩 Version: {version}\n" +
        "║ 🔒 Role: {role}\n" +
        "║ ⏱️ Cooldown: {countDown}s\n" +
        "║ 🧭 Use Prefix: {usePrefix}\n" +
        "║ 👤 Author: Sakibin\n" +
        "╠═──── GUIDE ───═╣",
      usageBody: "║ {usage}",
      usageFooter: "╚═────────═╝",
      commandNotFound: "⚠️ Command '{command}' not found!",
      doNotHave: "None",
      roleText0: "👥 All Users",
      roleText1: "👑 Group Admins",
      roleText2: "⚡ Bot Admins",
      totalCommands: "\n📊 Total Commands: {total} — by Sakibin"
    }
  },

  onStart: async function({ message, args, event, role, api }) {
    const prefix = getPrefix(event.threadID);
    const commandName = args[0]?.toLowerCase();
    const lang = this.langs.en;
   //const config = require("../../sakibin.json"); // owner info

    // Category help
    if (commandName === 'c' && args[1]) {
      const categoryArg = args[1].toUpperCase();
      const commandsInCategory = [];
      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (category === categoryArg) {
          commandsInCategory.push({ name });
        }
      }
      if (commandsInCategory.length === 0) {
        return message.reply(`❌ No commands found in category: ${categoryArg}`);
      }
      let replyMsg = lang.helpHeader;
      replyMsg += lang.categoryHeader.replace(/{category}/g, categoryArg);
      commandsInCategory
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(cmd => {
          replyMsg += `\n${lang.commandItem.replace(/{name}/g, cmd.name)}`;
        });
      replyMsg += `\n${lang.helpFooter}`;
      replyMsg += lang.totalCommands.replace(/{total}/g, commandsInCategory.length);
      const msgg = `‣ Bot Owner Sakibin\n${replyMsg}`;
      const sentMessage = await api.shareContact(msgg, "100065445284007", event.threadID);
      if (this.config.envConfig.autoUnsend) {
        setTimeout(() => {
          api.unsendMessage(sentMessage.messageID);
        }, this.config.envConfig.delayUnsend * 1000);
      }
      return;
    }

    // All commands help
    if (!commandName || commandName === 'all') {
      const categories = new Map();
      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category).push({ name });
      }
      const sortedCategories = [...categories.keys()].sort();
      let replyMsg = lang.helpHeader;
      let totalCommands = 0;
      for (const category of sortedCategories) {
        const commandsInCategory = categories.get(category).sort((a, b) => a.name.localeCompare(b.name));
        totalCommands += commandsInCategory.length;
        replyMsg += lang.categoryHeader.replace(/{category}/g, category);
        commandsInCategory.forEach(cmd => {
          replyMsg += `\n${lang.commandItem.replace(/{name}/g, cmd.name)}`;
        });
      }
      replyMsg += `\n${lang.helpFooter}`;
      replyMsg += lang.totalCommands.replace(/{total}/g, totalCommands);
      const msgg = `‣ Bot Owner: Sakibin\n${replyMsg}`;
      const sentMessage = await api.shareContact(msgg, "100065445284007", event.threadID);
      if (this.config.envConfig.autoUnsend) {
        setTimeout(() => {
          api.unsendMessage(sentMessage.messageID);
        }, this.config.envConfig.delayUnsend * 1000);
      }
      return;
    }

    // Command info help
    let cmd = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!cmd) {
      return message.reply(lang.commandNotFound.replace(/{command}/g, commandName));
    }
    const configCmd = cmd.config;
    const description = configCmd.description?.en || configCmd.description || "No description";
    const aliasesList = configCmd.aliases?.join(", ") || lang.doNotHave;
    const category = configCmd.category?.toUpperCase() || "GENERAL";
    let roleText;
    switch(configCmd.role) {
      case 1: roleText = lang.roleText1; break;
      case 2: roleText = lang.roleText2; break;
      default: roleText = lang.roleText0;
    }
    let guide = configCmd.guide?.en || configCmd.usage || configCmd.guide || "No usage guide available";
    if (typeof guide === "object") guide = guide.body;
    guide = guide.replace(/\{prefix\}/g, prefix).replace(/\{name\}/g, configCmd.name).replace(/\{pn\}/g, prefix + configCmd.name);
    let replyMsg = lang.commandInfo
      .replace(/{name}/g, configCmd.name)
      .replace(/{description}/g, description)
      .replace(/{category}/g, category)
      .replace(/{aliases}/g, aliasesList)
      .replace(/{version}/g, configCmd.version)
      .replace(/{role}/g, roleText)
      .replace(/{countDown}/g, configCmd.countDown || 1)
      .replace(/{usePrefix}/g, typeof configCmd.usePrefix === "boolean" ? (configCmd.usePrefix ? "✅ Yes" : "❌ No") : "❓ Unknown")
      .replace(/{author}/g, configCmd.author || "Unknown");
    replyMsg += `\n${lang.usageBody.replace(/{usage}/g, guide)}\n${lang.usageFooter}`;
    const msgg = `‣ Bot Owner:  Sskibin\n${replyMsg}`;
    const sentMessage = await api.shareContact(msgg, "100065445284007", event.threadID);
    if (this.config.envConfig.autoUnsend) {
      setTimeout(() => {
        api.unsendMessage(sentMessage.messageID);
      }, this.config.envConfig.delayUnsend * 1000);
    }
  }
};