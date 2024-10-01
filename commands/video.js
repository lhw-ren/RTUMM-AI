const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

const _48MB = 48 * 1024 * 1024;  // 48MB size limit

module.exports = {
    name: "video",
    description: "Play a video from YouTube.",
    prefixRequired: true, // Command requires a prefix
    adminOnly: false, // Command is not restricted to admins only
    async execute(api, event, args) {
        const getLang = (key) => langData["en_US"][key];  // Simplified language function
        if (!args[0]) {
            return api.sendMessage(getLang("video.missingArguement"), event.threadID);
        }

        let url = args[0];
        if (!ytdl.validateURL(url)) {
            return api.sendMessage(getLang("video.invalidUrl"), event.threadID);
        }

        const videoInfo = await ytdl.getInfo(url);
        const video = {
            title: videoInfo.videoDetails.title,
            id: videoInfo.videoDetails.videoId
        };

        await playVideo(api, event, video, getLang);
    }
};

const langData = {
    "en_US": {
        "video.missingArguement": "Please provide a keyword or URL.",
        "video.noResult": "No result found.",
        "video.invalidUrl": "Invalid URL.",
        "video.invalidIndex": "Invalid index.",
        "video.tooLarge": "Video is too large, max size is 48MB.",
        "video.error": "An error occurred."
    }
};

async function playVideo(api, event, video, getLang) {
    const { title, id } = video;
    api.sendMessage("⏳ Processing your video...", event.threadID);
    
    const cachePath = path.join(__dirname, `_ytvideo${Date.now()}.mp4`);
    try {
        let stream = ytdl(id, { quality: 'highest' });
        const writeStream = fs.createWriteStream(cachePath);
        stream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        const fileStat = fs.statSync(cachePath);
        if (fileStat.size > _48MB) {
            api.sendMessage(getLang("video.tooLarge"), event.threadID);
        } else {
            api.sendMessage({
                body: `[ ${title} ]`,
                attachment: fs.createReadStream(cachePath)
            }, event.threadID);
        }

    } catch (err) {
        console.error(err);
        api.sendMessage(getLang("video.error"), event.threadID);
    } finally {
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath); // Clean up the temporary file
        }
    }
}
