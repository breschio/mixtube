import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();
const youtube = google.youtube('v3');

router.get('/youtube/trending', async (req, res) => {
  try {
    const response = await youtube.videos.list({
      part: ['snippet'],
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
    res.status(500).json({ error: 'Failed to fetch trending videos' });
  }
});

router.get('/youtube/related', async (req, res) => {
  const { v: videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      relatedToVideoId: videoId as string,
      type: 'video',
      maxResults: 10,
      key: process.env.YOUTUBE_API_KEY,
    });

    const videos = response.data.items?.map(item => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
    })).filter(video => video.id) || [];

    res.json(videos);
  } catch (error) {
    console.error('Error fetching related videos:', error);
    res.status(500).json({ error: 'Failed to fetch related videos' });
  }
});

export default router;
