import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  app.get('/api/youtube/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const pageToken = req.query.pageToken as string | undefined;

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
        relevanceLanguage: 'en',
        key: YOUTUBE_API_KEY,
        ...(pageToken && { pageToken }),
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({
          error: error.error?.message || 'Failed to fetch videos from YouTube API'
        });
      }

      const data = await response.json();

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
      }));

      res.json({
        videos,
        nextPageToken: data.nextPageToken,
        totalResults: data.pageInfo.totalResults,
      });
    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}