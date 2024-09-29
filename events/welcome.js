module.exports = {
    config: {
        name: "welcome",
        version: "1.0",
        author: "Math Major",
        category: "events"
    },

    langs: {
        en: {
            welcomeMessage: "Hello, everyone! I'm RTUMM, an AI Messenger ChatBot created by Math Major. I'm excited to be part of your group and ready to assist with anything math-related or beyond! Just type my prefix (#) to ask me anything. 🤗🎀",
            defaultWelcomeMessage: `Annyeonggg {userName}! Welcome to the group.🤗 Hope you will enjoy your time here in {boxName} 😍🎀.`
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe") {
            return async function () {
                const { threadID } = event;
                const { nickNameBot } = global.GoatBot.config;
                const prefix = global.utils.getPrefix(threadID);
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // If new member is the bot
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                    if (nickNameBot)
                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                    return message.send(getLang("welcomeMessage", prefix));
                }

                // Handle new members
                const threadData = await threadsData.get(threadID);
                const threadName = threadData.threadName;
                const userName = [];
                const mentions = [];

                for (const user of dataAddedParticipants) {
                    userName.push(user.fullName);
                    mentions.push({
                        tag: user.fullName,
                        id: user.userFbId
                    });
                }

                // {userName}: name of the new member
                // {boxName}: name of the group
                let welcomeMessage = getLang("defaultWelcomeMessage");
                welcomeMessage = welcomeMessage
                    .replace("{userName}", userName.join(", "))
                    .replace("{boxName}", threadName);

                const form = {
                    body: welcomeMessage,
                    mentions: mentions
                };

                message.send(form);
            };
        }
    }
};
