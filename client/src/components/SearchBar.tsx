import { useState, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { YouTubeVideo } from '@/lib/youtube';
import { getRelatedVideos, searchVideos } from '@/lib/youtube';

interface SearchBarProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  videoId: string | null;
  isRightColumn?: boolean;
}

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

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_MS = 800;

export default function SearchBar({ onVideoSelect, videoId, isRightColumn = false }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  const extractVideoId = (input: string): string | null => {
    const trimmedInput = input.trim();

    for (const pattern of patterns) {
      const match = trimmedInput.match(pattern);
      if (match) {
        setIsValid(true);
        return match[1];
      }
    }

    setIsValid(false);
    return null;
  };

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['youtube-search', input],
    queryFn: async () => {
      if (input.length < MIN_SEARCH_LENGTH) return [];

      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(input)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const results = await response.json();
        return results;
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
    enabled: input.length >= MIN_SEARCH_LENGTH && !extractVideoId(input),
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    const videoId = extractVideoId(newInput);
    if (videoId) {
      handleVideoIdInput(videoId);
      return;
    }
  };

  const handleVideoIdInput = async (videoId: string) => {
    try {
      const response = await fetch(`/api/youtube/videos/${videoId}`);
      if (!response.ok) throw new Error('Failed to fetch video details');
      const videoDetails = await response.json();
      onVideoSelect(videoDetails);
    } catch (error) {
      console.error('Error fetching video details:', error);
      onVideoSelect({
        id: videoId,
        title: 'Video Title Unavailable',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: 'Channel Unavailable'
      });
      toast({
        title: "Limited Video Details",
        description: "Some video details couldn't be loaded. Basic playback will still work.",
        variant: "default"
      });
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setInput('');
    onVideoSelect(video);
  };

  const handleClear = () => {
    setInput('');
    setIsValid(true);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="relative group">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search YouTube or paste a URL"
            value={input}
            onChange={handleInputChange}
            className={`pl-9 normal-case transition-all ${!isValid && input ? 'border-red-500' : ''}`}
          />
          {input && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className={`absolute z-50 mt-1 w-full bg-background/95 backdrop-blur border rounded-md shadow-lg transition-all duration-200 ${searchResults.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          {searchResults.map((video) => (
            <button
              key={video.id}
              className="w-full p-2 hover:bg-accent flex items-center gap-2 text-left"
              onClick={() => handleVideoSelect(video)}
            >
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-16 aspect-video object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs line-clamp-2 normal-case font-medium">
                  {video.title}
                </p>
                <span className="text-xs text-muted-foreground">{video.channelTitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {!isValid && input && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid YouTube URL or video ID</p>
      )}
    </div>
  );
}