import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { YouTubeVideo } from '@/lib/youtube';

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    channelTitle: "Rick Astley"
  },
  {
    id: "jNQXAC9IVRw",
    title: "Me at the zoo",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    channelTitle: "jawed"
  },
  {
    id: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE(강남스타일)",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg",
    channelTitle: "PSY"
  }
];

export function useYoutubeSearch(searchTerm: string, isUrlMode: boolean = false) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['youtube-search', searchTerm],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        return data as YouTubeVideo[];
      } catch (error) {
        console.error('Search failed:', error);
        toast({
          title: "YouTube API Limit Reached",
          description: "Showing popular videos instead. Please try again later.",
          variant: "default"
        });
        return FALLBACK_VIDEOS;
      }
    },
    enabled: !isUrlMode && searchTerm.length >= 2,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
}