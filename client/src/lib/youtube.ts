export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  startTime?: number;
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
  };
}

export function parseYouTubeStartTime(url: string): number | undefined {
  try {
    const urlObj = new URL(url);
    // Handle both t= and start= parameters (YouTube uses both)
    const timeParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
    if (!timeParam) return undefined;

    // Convert various formats to seconds
    if (timeParam.includes('h') || timeParam.includes('m') || timeParam.includes('s')) {
      let seconds = 0;
      const hours = timeParam.match(/(\d+)h/);
      const minutes = timeParam.match(/(\d+)m/);
      const secs = timeParam.match(/(\d+)s/);

      if (hours) seconds += parseInt(hours[1]) * 3600;
      if (minutes) seconds += parseInt(minutes[1]) * 60;
      if (secs) seconds += parseInt(secs[1]);

      return seconds;
    }

    // If it's just a number, assume it's seconds
    return parseInt(timeParam);
  } catch (e) {
    console.error('Error parsing YouTube start time:', e);
    return undefined;
  }
}

export async function searchVideos(query: string): Promise<YouTubeVideo[]> {
  const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search videos');
  }
  return response.json();
}