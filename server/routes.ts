import type { Express } from "express";
import { createServer, type Server } from "http";
import { cache } from './cache';
import { spawn } from 'child_process';
import { db } from "@db/index";
import { mixes } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

// Simple rate limiter
const rateLimiter = new Map<string, number[]>();

async function getVideoInfo(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytdl = spawn('yt-dlp', [
      '--dump-single-json',
      '--no-playlist',
      '--skip-download',
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
        console.error('yt-dlp error:', error);
        reject(new Error(`yt-dlp exited with code ${code}: ${error}`));
        return;
      }
      try {
        const info = JSON.parse(output);
        resolve(info);
      } catch (e) {
        console.error('Error parsing yt-dlp output:', e);
        reject(e);
      }
    });
  });
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

      // Check rate limit first
      if (isRateLimited(videoId)) {
        console.log('Rate limit exceeded for video:', videoId);
        return res.status(429).json({ error: { code: 429, message: 'Rate limit exceeded' } });
      }

      // Check cache
      const cacheKey = `related:${videoId}`;
      const cachedData = await cache.get(cacheKey);
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        return res.json(cachedData.data);
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
          return res.json(FALLBACK_VIDEOS);
        }
        throw new Error(data.error?.message || 'Failed to fetch related videos');
      }

      if (!data.items?.length) {
        console.log('No related videos found for:', videoId);
        return res.json(FALLBACK_VIDEOS);
      }

      const videos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      // Cache the successful response
      await cache.set(cacheKey, {data: videos, timestamp: now});

      res.json(videos);
    } catch (error) {
      console.error('YouTube related videos error:', error);
      res.json(FALLBACK_VIDEOS);
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
      let recommendedVideos = [];

      if (videoInfo.related_videos) {
        recommendedVideos = videoInfo.related_videos;
      } else if (videoInfo.entries?.[0]?.entries) {
        recommendedVideos = videoInfo.entries[0].entries;
      } else {
        console.log('No recommended videos found in yt-dlp output');
        // Fallback to using the YouTube API endpoint
        return res.redirect(`/api/youtube/related?v=${videoId}`);
      }

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
      // Fallback to using the YouTube API endpoint
      return res.redirect(`/api/youtube/related?v=${videoId}`);
    }
  });

  app.post('/api/mixes', async (req, res) => {
    try {
      const { title, leftVideoId, rightVideoId, crossFaderValue, template } = req.body;

      // For testing: Using default user id instead of requiring authentication
      const defaultUserId = 1; // This matches our default user

      // Validate required fields
      if (!title || !leftVideoId || !rightVideoId || crossFaderValue === undefined || !template) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Insert new mix
      const [newMix] = await db.insert(mixes).values({
        title,
        userId: defaultUserId, // Using default user id
        leftVideoId,
        rightVideoId,
        crossFaderValue,
        template,
        views: 0, // Initialize views to 0
      }).returning();

      res.json(newMix);
    } catch (error) {
      console.error('Error saving mix:', error);
      res.status(500).json({ error: 'Failed to save mix' });
    }
  });

  app.get('/api/mixes', async (req, res) => {
    try {
      const recentMixes = await db.select().from(mixes).orderBy(desc(mixes.createdAt)).limit(10);
      res.json(recentMixes);
    } catch (error) {
      console.error('Error fetching mixes:', error);
      res.status(500).json({ error: 'Failed to fetch mixes' });
    }
  });

  // Add new endpoint to increment views
  app.post('/api/mixes/:id/view', async (req, res) => {
    try {
      const mixId = parseInt(req.params.id);
      await db.update(mixes)
        .set({ views: sql`${mixes.views} + 1` })
        .where(eq(mixes.id, mixId));
      res.sendStatus(200);
    } catch (error) {
      console.error('Error incrementing views:', error);
      res.status(500).json({ error: 'Failed to increment views' });
    }
  });

  app.get('/api/mixes/:id', async (req, res) => {
    try {
      const mixId = parseInt(req.params.id);
      if (isNaN(mixId)) {
        console.error('Invalid mix ID received:', req.params.id);
        return res.status(400).json({ error: 'Invalid mix ID' });
      }

      console.log('Fetching mix with ID:', mixId);
      const [mix] = await db.select().from(mixes).where(eq(mixes.id, mixId)).limit(1);

      if (!mix) {
        console.log('No mix found with ID:', mixId);
        return res.status(404).json({ error: 'Mix not found' });
      }

      console.log('Successfully retrieved mix:', mix);
      res.json(mix);
    } catch (error) {
      console.error('Error fetching mix:', error);
      res.status(500).json({ error: 'Failed to fetch mix' });
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

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(key) || [];
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  rateLimiter.set(key, recentRequests);
  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}