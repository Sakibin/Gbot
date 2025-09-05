const config = {
    name: "tag",
    version: "1.1.0",
    author: "sakibin",
    credits: "sakibin",
    countDown: 0,
    role: 0,
    hasPermission: 0,
    description: "Mention users based on keyword, or mention all users with 'all' or '-a'.",
    category: "utility",
    commandCategory: "utility",
    guide: "{pn} [keyword|all|-a]",
    usages: "[keyword|all|-a]",
    cooldowns: 5,
};

// Add a robust name resolver that falls back to api.getUserInfo when Users is missing
async function resolveName(id, api, Users) {
    try {
        if (Users && typeof Users.getNameUser === "function") {
            const name = await Users.getNameUser(id);
            if (name) return name;
        }
    } catch (err) {
        // ignore and fallback
    }
    try {
        const info = await api.getUserInfo(id);
        // api.getUserInfo may return { id: { name: '...' } } or { name: '...' }
        if (info) {
            if (info[id] && info[id].name) return info[id].name;
            if (info.name) return info.name;
        }
    } catch (err) {
        // ignore
    }
    return String(id); // fallback to id string
}

async function tagAll({ api, event, args, Users }) {
    try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const all = (threadInfo.participantIDs || []).slice();

        // Exclude bot itself if possible
        const selfId = typeof api.getCurrentUserID === "function" ? api.getCurrentUserID() : null;
        if (selfId) {
            const idx = all.indexOf(selfId);
            if (idx !== -1) all.splice(idx, 1);
        }

        // Exclude message sender
        const senderIdx = all.indexOf(event.senderID);
        if (senderIdx !== -1) all.splice(senderIdx, 1);

        // Fetch display names using resolver
        const names = await Promise.all(all.map(id => resolveName(id, api, Users).catch(() => null)));

        // If user provided a prefix message, keep it before the mentions
        const prefix = args.length ? args.join(" ") : "";
        // Build body and mentions with correct fromIndex values
        const mentions = [];
        let bodyParts = [];
        if (prefix) bodyParts.push(prefix);

        for (let i = 0; i < all.length; i++) {
            const name = names[i] || "Unknown";
            // add separator (space) between parts
            bodyParts.push(name);
        }

        const body = bodyParts.join(" ").trim();
        // compute fromIndex for each mention (skip prefix if present)
        let cursor = 0;
        if (prefix) {
            cursor = prefix.length + 1; // one space after prefix
        }
        for (let i = 0; i < all.length; i++) {
            const name = names[i] || "Unknown";
            const fromIndex = body.indexOf(name, cursor);
            if (fromIndex === -1) {
                // fallback: approximate using cursor
                mentions.push({ tag: name, id: all[i], fromIndex: cursor });
                cursor += name.length + 1;
            } else {
                mentions.push({ tag: name, id: all[i], fromIndex });
                cursor = fromIndex + name.length + 1;
            }
        }

        return api.sendMessage({ body: body || "@everyone", mentions }, event.threadID, event.messageID);
    } catch (err) {
        console.error("Error tagging all users:", err);
        return api.sendMessage("An error occurred while tagging all users.", event.threadID);
    }
}

const onStart = async function ({ api, event, args, Users }) {
    const { threadID, messageReply } = event;

    // If replying to a message, mention the sender of the replied message
    if (messageReply && messageReply.senderID) {
        const senderID = messageReply.senderID;
        try {
            const userName = await resolveName(senderID, api, Users);
            const body = userName;
            const mentions = [{ tag: userName, id: senderID, fromIndex: 0 }];
            return api.sendMessage(
                { body: `Mentioning ${body}`, mentions },
                threadID,
                event.messageID
            );
        } catch (err) {
            console.error(`Error fetching user name for ID ${senderID}:`, err);
            return api.sendMessage("An error occurred while mentioning the user.", threadID);
        }
    }

    // Handle "all" or "-a" argument to mention all users
    if (args[0]?.toLowerCase() === "all" || args[0]?.toLowerCase() === "-a") {
        return tagAll({ api, event, args, Users });
    }

    // Handle keyword-based search functionality
    const keyword = args[0]?.toLowerCase();
    if (!keyword) {
        return api.sendMessage("Please provide a keyword to search for or use 'all'/'-a' to mention everyone.", threadID);
    }

    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const participants = threadInfo.participantIDs || [];
        const mentions = [];
        const matchedNames = [];
        const matchedIds = [];

        for (let userID of participants) {
            try {
                const userName = await resolveName(userID, api, Users);
                if (userName && userName.toLowerCase().includes(keyword)) {
                    matchedNames.push(userName);
                    matchedIds.push(userID);
                }
            } catch (err) {
                console.error(`Error fetching user name for ID ${userID}:`, err);
            }
        }

        if (matchedNames.length === 0) {
            return api.sendMessage(`No users found with names containing "${keyword}".`, threadID);
        }

        // Build message body and mentions with proper indices
        const header = "Matching users:";
        const bodyParts = [header, ...matchedNames];
        const messageBody = bodyParts.join(" ");
        let cursor = header.length + 1; // position where first name starts

        for (let i = 0; i < matchedNames.length; i++) {
            const name = matchedNames[i];
            const id = matchedIds[i];
            const fromIndex = messageBody.indexOf(name, cursor);
            if (fromIndex === -1) {
                mentions.push({ tag: name, id, fromIndex: cursor });
                cursor += name.length + 1;
            } else {
                mentions.push({ tag: name, id, fromIndex });
                cursor = fromIndex + name.length + 1;
            }
        }

        return api.sendMessage({ body: messageBody, mentions }, threadID, event.messageID);
    } catch (err) {
        console.error("Error fetching thread info or sending message:", err);
        return api.sendMessage("An error occurred while processing the tag command.", threadID);
    }
};

module.exports = {
    config,
    onStart,
    run: onStart
};