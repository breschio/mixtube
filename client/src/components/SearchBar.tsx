import { useState, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const debouncedSetInput = useCallback(
    debounce((value: string) => {
      setInput(value);
    }, 500),
    []
  );

  const { data: searchResults = [], isLoading } = useYoutubeSearch(input);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;

    const videoId = extractVideoId(newInput);
    if (videoId) {
      handleVideoIdInput(videoId);
      return;
    }

    debouncedSetInput(newInput);
    e.target.value = newInput;
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
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search YouTube or paste a URL"
            value={input}
            onChange={handleInputChange}
            className={`pl-9 ${!isValid && input ? 'border-destructive' : ''}`}
          />
          {input && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchResults.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 divide-y divide-border">
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
                  <p className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                </div>
              </button>
            ))}
          </Card>
        )}
      </div>
      {!isValid && input && (
        <p className="text-sm text-destructive">Please enter a valid YouTube URL or video ID</p>
      )}
    </div>
  );
}