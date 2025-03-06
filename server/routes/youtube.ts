import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();
const youtube = google.youtube('v3');

router.get('/youtube/trending', async (req, res) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return res.json([]);
    }

    const response = await youtube.videos.list({
      part: 'snippet',
      chart: 'mostPopular',
      maxResults: 10,
      regionCode: 'US',
      videoCategoryId: '10', // Music category
      key: process.env.YOUTUBE_API_KEY,
    });

    const videos = response.data.items?.map(item => ({
      id: item.id,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
    })) || [];

    res.json(videos);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    res.json([]);
  }
});

router.get('/youtube/related', async (req, res) => {
  const { v: videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.json([]);
  }

  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return res.json([]);
    }

    const response = await youtube.search.list({
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults: 10,
      key: process.env.YOUTUBE_API_KEY,
    });

    if (!response.data.items) {
      return res.json([]);
    }

    const videos = response.data.items
      .filter(item => item.id?.videoId)
      .map(item => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        channelTitle: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.medium?.url,
      }));

    res.json(videos);
  } catch (error) {
    console.error('Error fetching related videos:', error);
    res.json([]);
  }
});

export default router;