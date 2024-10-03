require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  name: "gptchat",
  description: "Chat continuously with AI using GPT-4.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    try {
      const userInput = args.join(" ");
      if (!userInput) {
        return api.sendMessage("Please provide input for the AI.", event.threadID);
      }

      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: userInput }],
      });

      const aiResponse = response.data.choices[0].message.content;
      await api.sendMessage(aiResponse, event.threadID);
    } catch (err) {
      console.error(err);
      await api.sendMessage("An error occurred while communicating with the AI.", event.threadID);
    }
  },
};
