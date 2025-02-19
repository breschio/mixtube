export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
  };
}

export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search videos');
  }
  return response.json();
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(`/api/youtube/related-ytdl?v=${videoId}`);
    const data = await response.json();

    if (!response.ok) {
      const error = data as YouTubeError;
      throw new Error(error.error?.message || 'Failed to fetch related videos');
    }

    return data;
  } catch (error) {
    console.error('Error fetching related videos:', error);
    throw error;
  }
}