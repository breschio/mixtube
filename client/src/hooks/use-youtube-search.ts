import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
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

export function useYoutubeSearch(searchTerm: string, options: { 
  enabled?: boolean;
  isUrlMode?: boolean;
  debounceMs?: number;
} = {}) {
  const { 
    enabled = true,
    isUrlMode = false,
    debounceMs = 500 
  } = options;

  const { toast } = useToast();
  const [debouncedSearchTerm] = useDebounce(searchTerm, debounceMs);

  return useQuery({
    queryKey: ['youtube-search', debouncedSearchTerm],
    queryFn: async () => {
      try {
        // Don't make API call if search term is too short
        if (debouncedSearchTerm.length < 2) {
          return [];
        }

        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) {
          if (response.status === 429) {
            toast({
              title: "Rate limit exceeded",
              description: "Please wait a moment before searching again.",
              variant: "destructive"
            });
            return FALLBACK_VIDEOS;
          }
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
    enabled: enabled && !isUrlMode && debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in garbage collection for 10 minutes
  });
}