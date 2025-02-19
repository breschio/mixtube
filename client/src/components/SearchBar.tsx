import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Search, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  const lastValidUrlRef = useRef<string | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
        lastValidUrlRef.current = newValue;
      }
    } else {
      debouncedSearch(newValue);
    }
  };

  const handleVideoIdInput = async (videoId: string) => {
    try {
      onVideoSelect({
        id: videoId,
        title: 'Loading...',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });
    } catch (error) {
      console.error('Error handling video ID:', error);
      toast({
        title: "Invalid Video URL",
        description: "Please check the URL and try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (videoId) {
      const newUrl = `https://youtube.com/watch?v=${videoId}`;
      setDisplayValue(newUrl);
      lastValidUrlRef.current = newUrl;
      setIsUrlMode(true);
    }
  }, [videoId]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleBlur = () => {
    if (isUrlMode && lastValidUrlRef.current) {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      blurTimeoutRef.current = setTimeout(() => {
        if (!displayValue || displayValue !== lastValidUrlRef.current) {
          setDisplayValue(lastValidUrlRef.current);
        }
      }, 5000);
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    if (!isUrlMode) {
      onSearch('');
    }
    setIsValid(true);
  };

  const handleModeToggle = (value: string) => {
    const newIsUrlMode = value === 'url';
    setIsUrlMode(newIsUrlMode);
    setDisplayValue('');
    setIsValid(true);
  };

  return (
    <div className="w-full">
      <div className="relative group">
        <div className="relative flex items-center">
          <ToggleGroup
            type="single"
            value={isUrlMode ? 'url' : 'search'}
            onValueChange={handleModeToggle}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 flex gap-0.5"
          >
            <ToggleGroupItem
              value="url"
              size="sm"
              className={`h-7 w-7 p-0 ${isUrlMode ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]' : ''}`}
            >
              <Link2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="search"
              size="sm"
              className={`h-7 w-7 p-0 ${!isUrlMode ? 'bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]' : ''}`}
            >
              <Search className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Input
            type="text"
            placeholder={isUrlMode ? "Paste YouTube URL" : "Search YouTube"}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`pl-16 pr-9 normal-case transition-all ${
              !isValid && displayValue ? 'border-red-500' : ''
            } ${isUrlMode ? 'font-mono text-sm' : ''} animate-placeholder`}
          />
          {displayValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-accent/50"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
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