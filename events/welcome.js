module.exports = {
    name: 'welcome',
    description: 'Handles the event when a new member joins the group and changes the bot nickname if it is added.',

    async handle(api, event) {
        // Check if the event is a "log:subscribe" (new members joining)
        if (event.logMessageType === "log:subscribe") {
            const { threadID } = event;
            const prefix = global.prefix;  // Assuming global.prefix is defined in your config
            const dataAddedParticipants = event.logMessageData.addedParticipants;

            // Auto-change the bot's nickname if the bot is added to the group
            const botID = api.getCurrentUserID();
            if (dataAddedParticipants.some(participant => participant.userFbId === botID)) {
                const botNickname = "RTUMM"; // Set the bot's nickname here
                await api.changeNickname(botNickname, threadID, botID);
                return api.sendMessage(`Hello, everyone! I'm ${botNickname}, an AI Messenger ChatBot created by Math Major. I'm excited to be part of your group and ready to assist with anything math-related or beyond! Just type my prefix (${prefix}) to ask me anything. 🤗🎀`, threadID);
            }

            // Handle welcome message for other new members
            const newMembers = dataAddedParticipants.filter(participant => participant.userFbId !== botID);
            if (newMembers.length > 0) {
                const memberNames = newMembers.map(member => member.fullName).join(", ");
                const groupName = (await api.getThreadInfo(threadID)).threadName;
                const welcomeMessage = `Annyeonggg ${memberNames}! Welcome to the group.🤗 Hope you will enjoy your time here in ${groupName} 😍🎀.`;
                
                return api.sendMessage(welcomeMessage, threadID);
            }
        }
    }
};
