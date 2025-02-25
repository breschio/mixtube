import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { YouTubeVideo } from '@/lib/youtube';

interface SearchBarProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  videoId: string | null;
  autoFocus?: boolean;
}

export default function SearchBar({ onVideoSelect, videoId, autoFocus }: SearchBarProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const lastValidUrlRef = useRef<string | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
    setIsValid(false);
    return null;
  };

  const startUrlRestorationTimer = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    if (lastValidUrlRef.current && !isTypingRef.current) {
      blurTimeoutRef.current = setTimeout(() => {
        if (!displayValue || displayValue !== lastValidUrlRef.current) {
          setDisplayValue(lastValidUrlRef.current || '');
        }
      }, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    isTypingRef.current = true;

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    setTimeout(() => {
      isTypingRef.current = false;
      if (!newValue) {
        startUrlRestorationTimer();
      }
    }, 1000);

    const videoId = extractVideoId(newValue);
    if (videoId) {
      handleVideoIdInput(videoId);
      lastValidUrlRef.current = newValue;
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

  const handleBlur = () => {
    isTypingRef.current = false;
    if (!displayValue) {
      startUrlRestorationTimer();
    }
  };

  const handleClear = () => {
    setDisplayValue('');
    setIsValid(true);
    lastValidUrlRef.current = null;
  };

  useEffect(() => {
    if (autoFocus && !videoId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, videoId]);

  useEffect(() => {
    if (videoId) {
      const newUrl = `https://youtube.com/watch?v=${videoId}`;
      setDisplayValue(newUrl);
      lastValidUrlRef.current = newUrl;
    } else {
      setDisplayValue('');
      lastValidUrlRef.current = null;
    }
  }, [videoId]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative group p-0.5">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Paste YouTube URL"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`pr-9 font-mono text-sm transition-all ${
              !isValid && displayValue ? 'border-red-500' : ''
            } animate-placeholder`}
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
          Please enter a valid YouTube URL or video ID
        </p>
      )}
    </div>
  );
}