import type { Express } from "express";
import { createServer, type Server } from "http";
import { cache } from './cache';
import { spawn } from 'child_process';
import { promisify } from 'util';

const CACHE_DURATION = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

// Simple rate limiter
const rateLimiter = new Map<string, number[]>();

async function getVideoInfo(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytdl = spawn('yt-dlp', [
      '--dump-single-json',
      '--no-playlist',
      '--flat-playlist',
      '--extract-flat',
      '--no-warnings',
      url
    ]);

    let output = '';
    let error = '';

    ytdl.stdout.on('data', (data) => {
      output += data;
    });

    ytdl.stderr.on('data', (data) => {
      error += data;
    });

    ytdl.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}: ${error}`));
        return;
      }
      try {
        const info = JSON.parse(output);
        resolve(info);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export function registerRoutes(app: Express): Server {
  app.get('/api/youtube/debug-related', async (req, res) => {
    try {
      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
      }

      const testVideoId = 'dQw4w9WgXcQ'; 

      const testCases = [
        {
          params: {
            part: 'snippet',
            relatedToVideoId: testVideoId,
            type: 'video',
            maxResults: '50', 
            key: YOUTUBE_API_KEY
          },
          name: 'Basic params'
        },
        {
          params: {
            part: 'snippet,id',
            relatedToVideoId: testVideoId,
            type: 'video',
            maxResults: '50', 
            key: YOUTUBE_API_KEY
          },
          name: 'With ID part'
        },
        {
          params: {
            part: 'snippet',
            relatedToVideoId: testVideoId,
            type: 'video',
            maxResults: '50', 
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

  app.get('/api/youtube/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
      }

      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: '50', 
        key: YOUTUBE_API_KEY
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to search videos');
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      res.json(videos);
    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({ error: 'Failed to search videos' });
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
      const cachedData = await cache.get(cacheKey);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        return res.json(cachedData.data.slice(0,50)); 
      }

      // Add to rate limiter
      const requests = rateLimiter.get(videoId) || [];
      requests.push(now);
      rateLimiter.set(videoId, requests);

      // First get video details
      const videoParams = new URLSearchParams({
        part: 'snippet',
        id: videoId,
        key: YOUTUBE_API_KEY
      });

      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${videoParams.toString()}`
      );

      const videoData = await videoResponse.json();

      if (!videoResponse.ok) {
        throw new Error(videoData.error?.message || 'Failed to fetch video details');
      }

      // Get channel videos from the same channel
      const channelId = videoData.items?.[0]?.snippet?.channelId;
      const searchParams = new URLSearchParams({
        part: 'snippet',
        channelId: channelId,
        type: 'video',
        maxResults: '50', 
        key: YOUTUBE_API_KEY
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('YouTube API error:', data.error);
        if (data.error?.code === 403) {
          console.log('YouTube API quota exceeded, using fallback data');
          return res.json(FALLBACK_VIDEOS.slice(0, 50)); 
        }
        throw new Error(data.error?.message || 'Failed to fetch related videos');
      }

      if (!data.items?.length) {
        console.log('No related videos found for:', videoId);
        return res.json(FALLBACK_VIDEOS.slice(0, 50)); 
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      // Cache the successful response with new shorter duration
      await cache.set(cacheKey, {data: videos, timestamp: now});

      res.json(videos);
    } catch (error) {
      console.error('YouTube related videos error:', error);
      res.json(FALLBACK_VIDEOS.slice(0, 50)); 
    }
  });

  app.get('/api/youtube/related-ytdl', async (req, res) => {
    try {
      const videoId = req.query.v as string;
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID required' });
      }

      // Check rate limit
      if (isRateLimited(videoId)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }

      // Check cache
      const cacheKey = `related-ytdl:${videoId}`;
      const cachedData = await cache.get(cacheKey);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        return res.json(cachedData.data);
      }

      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const videoInfo = await getVideoInfo(url);

      // Extract recommended videos from the video info
      const recommendedVideos = videoInfo.recommended_videos || [];
      const formattedVideos = recommendedVideos
        .filter((video: any) => video && video.id && video.title)
        .map((video: any) => ({
          id: video.id,
          title: video.title,
          thumbnail: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
          channelTitle: video.channel || video.uploader || 'Unknown Channel'
        }))
        .slice(0, 10);

      // Cache the successful response
      await cache.set(cacheKey, { data: formattedVideos, timestamp: now });

      res.json(formattedVideos);
    } catch (error) {
      console.error('yt-dlp error:', error);
      res.status(500).json({ error: 'Failed to fetch related videos' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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