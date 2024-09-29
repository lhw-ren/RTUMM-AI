const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const { shortenURL, randomString } = global.utils;  // Retain only the necessary utilities

module.exports = {
    name: "video",
    description: "Play video from YouTube, supports audio recognition.",
    prefixRequired: true, // Command requires a prefix
    adminOnly: false, // Not restricted to admins
    async execute(api, event, args) {
        console.log("Executing video command...");

        api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

        try {
            let title = '';
            let shortUrl = '';

            // Handle replies with attachments (audio/video)
            const extractShortUrl = async () => {
                console.log("Extracting attachment URL...");
                const attachment = event.messageReply.attachments[0];
                if (attachment.type === "video" || attachment.type === "audio") {
                    return attachment.url;
                } else {
                    throw new Error("Invalid attachment type.");
                }
            };

            let videoId = '';
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                console.log("Reply has attachments...");
                shortUrl = await extractShortUrl();
                
                console.log(`Attachment URL: ${shortUrl}`);
                const musicRecognitionResponse = await axios.get(`https://youtube-music-sooty.vercel.app/kshitiz?url=${encodeURIComponent(shortUrl)}`);
                
                title = musicRecognitionResponse.data.title;
                const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}`);
                
                if (searchResponse.data.length > 0) {
                    videoId = searchResponse.data[0].videoId;
                }
                
                shortUrl = await shortenURL(shortUrl);
            } else if (args.length === 0) {
                api.sendMessage("Please provide a video name or reply to a video or audio attachment.", event.threadID);
                return;
            } else {
                console.log("Searching by title...");
                title = args.join(" ");
                const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}`);
                
                if (searchResponse.data.length > 0) {
                    videoId = searchResponse.data[0].videoId;
                }

                const videoUrl = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
                
                if (videoUrl.data.length > 0) {
                    shortUrl = await shortenURL(videoUrl.data[0]);
                }
            }

            if (!videoId) {
                api.sendMessage("No video found for the given query.", event.threadID);
                return;
            }

            console.log(`Video ID found: ${videoId}`);
            const downloadResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
            
            if (downloadResponse.data.length === 0) {
                api.sendMessage("Failed to retrieve download link for the video.", event.threadID);
                return;
            }

            const videoUrl = downloadResponse.data[0];
            console.log(`Downloading video from: ${videoUrl}`);
            const writer = fs.createWriteStream(path.join(__dirname, "cache", `${videoId}.mp4`));
            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            writer.on('finish', () => {
                const videoStream = fs.createReadStream(path.join(__dirname, "cache", `${videoId}.mp4`)); 
                api.sendMessage({ body: `📹 Playing: ${title}\nDownload Link: ${shortUrl}`, attachment: videoStream }, event.threadID);
                api.setMessageReaction("✅", event.messageID, () => {}, true);
            });

            writer.on('error', (error) => {
                console.error("Error during download:", error);
                api.sendMessage("An error occurred while fetching the video.", event.threadID);
            });
        } catch (error) {
            console.error("Error:", error);
            api.sendMessage("An error occurred while fetching the video.", event.threadID);
        }
    },
};
