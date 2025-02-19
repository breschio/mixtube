import { useState, useCallback } from 'react';
import { X, Search, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/lib/utils';
import type { YouTubeVideo } from '@/lib/youtube';

interface SearchBarProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  onSearch: (query: string) => void;
  videoId: string | null;
  isRightColumn?: boolean;
}

export default function SearchBar({ onVideoSelect, onSearch, videoId, isRightColumn = false }: SearchBarProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isUrlMode, setIsUrlMode] = useState(true);
  const { toast } = useToast();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  const extractVideoId = (input: string): string | null => {
    const trimmedInput = input.trim();
    if (trimmedInput.includes('youtube.com') || trimmedInput.includes('youtu.be') || trimmedInput.length === 11) {
      for (const pattern of patterns) {
        const match = trimmedInput.match(pattern);
        if (match) {
          setIsValid(true);
          return match[1];
        }
      }
      setIsValid(false);
      return null;
    }
    setIsValid(true);
    return null;
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 800),
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);

    if (isUrlMode) {
      const videoId = extractVideoId(newValue);
      if (videoId) {
        handleVideoIdInput(videoId);
        return;
      }
    } else {
      debouncedSearch(newValue);
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
      });
      toast({
        title: "Limited Video Details",
        description: "Some video details couldn't be loaded. Basic playback will still work.",
        variant: "default"
      });
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    onSearch('');
    setIsValid(true);
  };

  const handleModeToggle = () => {
    setIsUrlMode(!isUrlMode);
    setDisplayValue('');
    setIsValid(true);
    onSearch('');
  };

  return (
    <div className="w-full">
      <div className="relative group">
        <div className="relative flex items-center">
          <Toggle
            pressed={!isUrlMode}
            onPressedChange={() => handleModeToggle()}
            className={`absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-accent/50`}
          >
            <Search className={`h-5 w-5 ${!isUrlMode ? 'text-primary' : 'text-muted-foreground'}`} />
          </Toggle>
          <Input
            type="text"
            placeholder={isUrlMode ? "Paste YouTube URL" : "Search YouTube"}
            value={displayValue}
            onChange={handleInputChange}
            className={`pl-9 pr-16 normal-case transition-all ${
              !isValid && displayValue ? 'border-red-500' : ''
            } ${isUrlMode ? 'font-mono text-sm' : ''} animate-placeholder`}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {displayValue && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-accent/50"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {!isValid && displayValue && (
        <p className="text-xs text-red-500 mt-1">
          Please enter a valid YouTube {isUrlMode ? 'URL or video ID' : 'search term'}
        </p>
      )}
    </div>
  );
}