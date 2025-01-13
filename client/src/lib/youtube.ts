export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search videos');
  }
  return response.json();
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/related?v=${videoId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch related videos');
  }
  const data = await response.json();
  return data.videos || [];
}