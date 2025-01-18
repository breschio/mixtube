
import type { YouTubeVideo } from './youtube';

const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_API_KEY || ''
);

const videoIndex = algolia.initIndex('youtube_videos');

export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  // Try Redis cache first
  const cachedResults = await redis.get(`search:${query}`);
  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  // Then try Algolia
  try {
    const { hits } = await videoIndex.search(query);
    if (hits.length) {
      await redis.setex(`search:${query}`, 3600, JSON.stringify(hits));
      return hits as YouTubeVideo[];
    }
  } catch (error) {
    console.error('Algolia search failed:', error);
  }

  // Fallback to YouTube API
  const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  const results = await response.json();
  
  // Cache results
  if (results.length) {
    await redis.setex(`search:${query}`, 3600, JSON.stringify(results));
    await videoIndex.saveObjects(results);
  }

  return results;
}
