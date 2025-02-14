import { useState, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/lib/utils';
import type { YouTubeVideo } from '@/lib/youtube';
import { useYoutubeSearch } from '@/hooks/use-youtube-search';

interface SearchBarProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  videoId: string | null;
  isRightColumn?: boolean;
}

export default function SearchBar({ onVideoSelect, videoId, isRightColumn = false }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();

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

  // Debounce the actual search query
  const debouncedSetInput = useCallback(
    debounce((value: string) => {
      setInput(value);
    }, 800),
    []
  );

  const { data: searchResults = [], isLoading } = useYoutubeSearch(input);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue); // Update display immediately for smooth typing

    const videoId = extractVideoId(newValue);
    if (videoId) {
      handleVideoIdInput(videoId);
      return;
    }

    debouncedSetInput(newValue);
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
      });
      toast({
        title: "Limited Video Details",
        description: "Some video details couldn't be loaded. Basic playback will still work.",
        variant: "default"
      });
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setDisplayValue('');
    setInput('');
    onVideoSelect(video);
  };

  const handleClear = () => {
    setDisplayValue('');
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
            placeholder="Search YouTube"
            value={displayValue}
            onChange={handleInputChange}
            className={`pl-9 normal-case transition-all ${!isValid && displayValue ? 'border-red-500' : ''}`}
          />
          {displayValue && (
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
        {/* Results dropdown with improved positioning */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-background/95 backdrop-blur border rounded-md shadow-lg">
            {searchResults.map((video: YouTubeVideo) => (
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
        )}
      </div>
      {!isValid && displayValue && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid YouTube URL or video ID</p>
      )}
    </div>
  );
}