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
        const apiKey = "AIzaSyB1UaUgsALZtuwmnuDtRyDuiHs7SmAYcIU"; // Your API key
        const cx = "d47f1bce51ca24ca5"; // Your Custom Search Engine ID (string, not HTML)

        try {
            const response = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&key=${apiKey}&searchType=image`);
            
            // Check if there are any images returned
            if (response.data.items && response.data.items.length > 0) {
                const imageUrl = response.data.items[0].link;
                // Send the image URL to the chat
                api.sendMessage({ body: "Here's an image I found:", attachment: imageUrl }, event.threadID);
            } else {
                api.sendMessage("Sorry, no images found for that search term.", event.threadID);
            }
        } catch (error) {
            console.error("Error fetching image:", error.response?.data || error.message);
            api.sendMessage("Sorry, I couldn't find an image.", event.threadID);
        }
    },
};
