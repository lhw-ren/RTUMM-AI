module.exports = {
    name: 'welcome',
    description: 'Welcomes new members to the group.',
    async handle(api, event) {
        const { getTime, drive } = global.utils;
        if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};
        
        if (event.logMessageType == "log:subscribe") {
            const hours = getTime("HH");
            const { threadID } = event;
            const { nickNameBot } = global.GoatBot.config;
            const prefix = global.utils.getPrefix(threadID);
            const dataAddedParticipants = event.logMessageData.addedParticipants;

            // if new member is bot
            if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                if (nickNameBot)
                    api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                return api.sendMessage(
                    `Hello, everyone! I'm RTUMM, an AI Messenger ChatBot created by Math Major. I'm excited to be part of your group and ready to assist with anything math-related or beyond! Just type my prefix (#) to ask me anything. 🤗🎀`, 
                    threadID
                );
            }

            if (!global.temp.welcomeEvent[threadID])
                global.temp.welcomeEvent[threadID] = {
                    joinTimeout: null,
                    dataAddedParticipants: []
                };

            global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
            clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

            global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                const threadData = await threadsData.get(threadID);
                if (threadData.settings.sendWelcomeMessage === false) return;

                const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                const dataBanned = threadData.data.banned_ban || [];
                const threadName = threadData.threadName;
                const userName = [];
                const mentions = [];
                let multiple = false;

                if (dataAddedParticipants.length > 1) multiple = true;

                for (const user of dataAddedParticipants) {
                    if (dataBanned.some((item) => item.id == user.userFbId)) continue;
                    userName.push(user.fullName);
                    mentions.push({
                        tag: user.fullName,
                        id: user.userFbId
                    });
                }

                if (userName.length == 0) return;
                let { welcomeMessage = `Annyeonggg {userName}! welcome to the group.🤗 hope you will enjoy your time here in {boxName} 😍🎀.` } = threadData.data;
                
                const form = {
                    mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
                };

                welcomeMessage = welcomeMessage
                    .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
                    .replace(/\{boxName\}|\{threadName\}/g, threadName)
                    .replace(
                        /\{multiple\}/g,
                        multiple ? "you guys" : "you"
                    )
                    .replace(
                        /\{session\}/g,
                        hours <= 10
                            ? "morning"
                            : hours <= 12
                                ? "noon"
                                : hours <= 18
                                    ? "afternoon"
                                    : "evening"
                    );

                form.body = welcomeMessage;

                if (threadData.data.welcomeAttachment) {
                    const files = threadData.data.welcomeAttachment;
                    const attachments = files.reduce((acc, file) => {
                        acc.push(drive.getFile(file, "stream"));
                        return acc;
                    }, []);
                    form.attachment = (await Promise.allSettled(attachments))
                        .filter(({ status }) => status == "fulfilled")
                        .map(({ value }) => value);
                }
                api.sendMessage(form, threadID);
                delete global.temp.welcomeEvent[threadID];
            }, 1500);
        }
    },
};
