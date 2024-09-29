const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: 'YOUR_YOUTUBE_API_KEY' // Replace this with your actual YouTube API key
});

module.exports = {
  name: "video",
  description: "Search and fetch a YouTube video based on input.",
  prefixRequired: false,
  adminOnly: false,      // This can be changed to true if only admins should use this command
  async execute(api, event, args) {
    try {
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return api.sendMessage("Please provide a search query for YouTube.", event.threadID);
      }

      const res = await youtube.search.list({
        part: 'snippet',
        q: searchQuery,
        maxResults: 1,
        type: 'video'
      });

      const video = res.data.items[0];
      if (video) {
        const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        const videoTitle = video.snippet.title;
        await api.sendMessage(`Here's a YouTube video: ${videoTitle} \n${videoUrl}`, event.threadID);
      } else {
        await api.sendMessage("No videos found.", event.threadID);
      }
    } catch (err) {
      console.error(err);
      await api.sendMessage("An error occurred while fetching the video.", event.threadID);
    }
  },
};
