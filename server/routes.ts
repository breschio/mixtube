import type { Express } from "express";
import { createServer, type Server } from "http";

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // Reduced to 5 minutes
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
  app.get('/api/youtube/debug-related', async (req, res) => {
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const testVideoId = 'dQw4w9WgXcQ'; // Test with a known video ID
    
    // Test different parameter combinations
    const testCases = [
      {
        params: {
          part: 'snippet',
          relatedToVideoId: testVideoId,
          type: 'video',
          maxResults: '3',
          key: YOUTUBE_API_KEY
        },
        name: 'Basic params'
      },
      {
        params: {
          part: 'snippet,id',
          relatedToVideoId: testVideoId,
          type: 'video',
          maxResults: '3',
          key: YOUTUBE_API_KEY
        },
        name: 'With ID part'
      },
      {
        params: {
          part: 'snippet',
          relatedToVideoId: testVideoId,
          type: 'video',
          maxResults: '3',
          key: YOUTUBE_API_KEY,
          safeSearch: 'moderate'
        },
        name: 'With safe search'
      }
    ];

    const results = [];
    
    for (const testCase of testCases) {
      const searchParams = new URLSearchParams(testCase.params);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );
      const data = await response.json();
      
      results.push({
        name: testCase.name,
        success: response.ok,
        status: response.status,
        data: data
      });
    }

    return res.json(results);
  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({ error: 'Failed to run debug tests' });
  }
});

app.get('/api/youtube/test', async (req, res) => {
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({ success: true, message: 'API key is valid' });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ error: 'Failed to test API key' });
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

      // Check rate limit first
      if (isRateLimited(videoId)) {
        console.log('Rate limit exceeded for video:', videoId);
        return res.status(429).json({ error: { code: 429, message: 'Rate limit exceeded' } });
      }

      // Check cache with shorter duration
      const cacheKey = `related:${videoId}`;
      const cachedData = cache.get(cacheKey);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        return res.json(cachedData.data.slice(0, 3));
      }

      // Add to rate limiter
      const requests = rateLimiter.get(videoId) || [];
      requests.push(now);
      rateLimiter.set(videoId, requests);

      // Make API request using search endpoint
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: videoId,
        type: 'video',
        maxResults: '3',
        key: YOUTUBE_API_KEY,
        order: 'relevance'
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('YouTube API error:', data.error);
        if (data.error?.code === 403) {
          console.log('YouTube API quota exceeded, using fallback data');
          return res.json(FALLBACK_VIDEOS.slice(0, 3));
        }
        throw new Error(data.error?.message || 'Failed to fetch related videos');
      }

      if (!data.items?.length) {
        console.log('No related videos found for:', videoId);
        return res.json(FALLBACK_VIDEOS.slice(0, 3));
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      // Cache the successful response with new shorter duration
      cache.set(cacheKey, { data: videos, timestamp: now });

      res.json(videos);
    } catch (error) {
      console.error('YouTube related videos error:', error);
      res.json(FALLBACK_VIDEOS.slice(0, 3));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}