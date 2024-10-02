const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI API with your API key
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Make sure you set the API key in your environment variables
});
const openai = new OpenAIApi(configuration);

// This object will store conversation history per user
const conversationHistory = {};

module.exports = {
    name: "gptchat",
    description: "Chat with GPT-4 continuously, remembers your previous messages.",
    prefixRequired: false, // You can use a prefix or not depending on your structure
    adminOnly: false,
    async execute(api, event, args) {
        try {
            const userId = event.senderID; // Use the senderID to track each user's conversation separately
            const userMessage = args.join(" "); // User's message as input

            // Initialize conversation history if it doesn't exist for the user
            if (!conversationHistory[userId]) {
                conversationHistory[userId] = [];
            }

            // Add user's message to the conversation history
            conversationHistory[userId].push({
                role: "user",
                content: userMessage
            });

            // Make a request to OpenAI with the conversation history
            const response = await openai.createChatCompletion({
                model: "gpt-4", // Or "gpt-3.5-turbo" if you want to use a cheaper option
                messages: conversationHistory[userId]
            });

            const botMessage = response.data.choices[0].message.content;

            // Add bot's reply to the conversation history
            conversationHistory[userId].push({
                role: "assistant",
                content: botMessage
            });

            // Send the reply back to the user
            api.sendMessage(botMessage, event.threadID, event.messageID);

        } catch (err) {
            console.error(err);
            api.sendMessage("Something went wrong while talking to GPT.", event.threadID);
        }
    },
};
