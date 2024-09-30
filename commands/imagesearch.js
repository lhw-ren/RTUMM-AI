const axios = require('axios');

module.exports = {
    name: "imageSearch",
    description: "Searches for an image based on user input.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        // Check if there are search terms
        if (!args.length) {
            return api.sendMessage("Please provide a search term!", event.threadID);
        }

        const query = args.join(" ");
        const apiKey = "AIzaSyAF7x3awPHxpPWkWOVNuL-7u1koRpJXOX8"; // Replace with your API key
        const cx = "30e0a0a9d4a554f25"; // Replace with your search engine ID

        try {
            const response = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&key=${apiKey}&searchType=image`);
            const imageUrl = response.data.items[0].link;

            // Send the image URL to the chat
            api.sendMessage({ body: "Here's an image I found:", attachment: imageUrl }, event.threadID);
        } catch (error) {
            console.error(error);
            api.sendMessage("Sorry, I couldn't find an image.", event.threadID);
        }
    },
};
