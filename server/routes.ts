import type { Express } from "express";
import { createServer, type Server } from "http";

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // Extended to 24 hours
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10; // Reduced limit

// Simple rate limiter
const rateLimiter = new Map<string, number[]>();

// Fallback data for when API quota is exceeded
const FALLBACK_VIDEOS = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: 'y6120QOlsfU',
    title: 'Darude - Sandstorm',
    thumbnail: 'https://img.youtube.com/vi/y6120QOlsfU/mqdefault.jpg',
  },
  {
    id: 'L_jWHffIx5E',
    title: 'Smash Mouth - All Star',
    thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
  }
];

function isRateLimited(videoId: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(videoId) || [];
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

      // Check cache first
      const cacheKey = `related:${videoId}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        // Return only 3 videos from cache
        return res.json(cachedData.data.slice(0, 3));
      }

      // Check rate limit
      if (isRateLimited(videoId)) {
        // Return only 3 fallback videos
        return res.json(FALLBACK_VIDEOS.slice(0, 3));
      }

      // Add to rate limiter
      const requests = rateLimiter.get(videoId) || [];
      requests.push(Date.now());
      rateLimiter.set(videoId, requests);

      // Make API request
      const searchParams = new URLSearchParams({
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        maxResults: '3', // Reduced to 3 to minimize quota usage
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 403) {
          console.log('YouTube API quota exceeded, using fallback data');
          return res.json(FALLBACK_VIDEOS.slice(0, 3));
        }
        throw new Error(data.error?.message || 'Failed to fetch related videos');
      }

      if (!data.items) {
        return res.json(FALLBACK_VIDEOS.slice(0, 3));
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      // Cache the successful response
      cache.set(cacheKey, { data: videos, timestamp: Date.now() });

      res.json(videos);
    } catch (error) {
      console.error('YouTube related videos error:', error);
      // Return fallback data on any error, limited to 3
      res.json(FALLBACK_VIDEOS.slice(0, 3));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}