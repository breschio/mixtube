import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  app.get('/api/youtube/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
      }

      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '25',
        videoEmbeddable: 'true',
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      res.json({ videos });
    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  app.get('/api/youtube/related', async (req, res) => {
    try {
      const videoId = req.query.v as string;
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID required' });
      }

      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
      }

      // Simple search using the video ID as reference
      const searchParams = new URLSearchParams({
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: '4',
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch related videos');
      }

      const data = await response.json();
      const videos = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      })) || [];

      res.json({ videos });
    } catch (error) {
      console.error('YouTube related videos error:', error);
      res.status(500).json({ error: 'Failed to fetch related videos' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}