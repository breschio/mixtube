import type { Express } from "express";
import { createServer, type Server } from "http";

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Simple rate limiter
const rateLimiter = new Map<string, number[]>();

function isRateLimited(videoId: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(videoId) || [];

  // Clean up old requests
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  rateLimiter.set(videoId, recentRequests);

  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}

export function registerRoutes(app: Express): Server {
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

      // Check rate limit
      if (isRateLimited(videoId)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }

      // Check cache
      const cacheKey = `related:${videoId}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return res.json(cachedData.data);
      }

      // Add to rate limiter
      const requests = rateLimiter.get(videoId) || [];
      requests.push(Date.now());
      rateLimiter.set(videoId, requests);

      // Use the search endpoint with relatedToVideoId parameter
      const searchParams = new URLSearchParams({
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: '5',
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('YouTube API error:', data);
        throw new Error(data.error?.message || 'Failed to fetch related videos');
      }

      if (!data.items) {
        return res.json([]);
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      // Cache the response
      cache.set(cacheKey, { data: videos, timestamp: Date.now() });

      res.json(videos);
    } catch (error) {
      console.error('YouTube related videos error:', error);
      res.status(500).json({ error: 'Failed to fetch related videos' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}