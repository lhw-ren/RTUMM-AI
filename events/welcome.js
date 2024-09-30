module.exports = {
    name: 'welcome',
    description: 'Handles the event when a new member joins the group and changes the bot nickname if it is added.',

    async handle(api, event) {
        console.log("Event triggered: log:subscribe");  // Log that event was triggered

        // Check if the event is a "log:subscribe" (new members joining)
        if (event.logMessageType === "log:subscribe") {
            const { threadID } = event;
            const prefix = global.prefix;  // Assuming global.prefix is defined in your config
            const dataAddedParticipants = event.logMessageData.addedParticipants;

            console.log("New members or bot added to the group:", dataAddedParticipants);

            // Auto-change the bot's nickname if the bot is added to the group
            const botID = api.getCurrentUserID();
            if (dataAddedParticipants.some(participant => participant.userFbId === botID)) {
                const botNickname = "RTUMM"; // Set the bot's nickname here
                console.log(`Changing bot nickname to: ${botNickname}`);
                
                await api.changeNickname(botNickname, threadID, botID)
                    .then(() => console.log(`Bot nickname changed to ${botNickname}`))
                    .catch(err => console.error("Failed to change bot nickname:", err));

                return api.sendMessage(`Hello, everyone! I'm ${botNickname}, an AI Messenger ChatBot created by Math Major. I'm excited to be part of your group and ready to assist with anything math-related or beyond! Just type my prefix (${prefix}) to ask me anything. 🤗🎀`, threadID)
                    .then(() => console.log("Bot introduction message sent"))
                    .catch(err => console.error("Failed to send bot introduction message:", err));
            }

            // Handle welcome message for other new members
            const newMembers = dataAddedParticipants.filter(participant => participant.userFbId !== botID);
            if (newMembers.length > 0) {
                const memberNames = newMembers.map(member => member.fullName).join(", ");
                const threadInfo = await api.getThreadInfo(threadID);
                const groupName = threadInfo.threadName || 'the group';

                const welcomeMessage = `Annyeonggg ${memberNames}! Welcome to the group.🤗\nHope you will enjoy your time here in ${groupName} 😍🎀.`;

                console.log(`Sending welcome message to new members: ${welcomeMessage}`);
                
                return api.sendMessage(welcomeMessage, threadID)
                    .then(() => console.log("Welcome message sent"))
                    .catch(err => console.error("Failed to send welcome message:", err));
            }
        }
    }
};
