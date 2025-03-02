import { useState, useRef, useEffect } from 'react';
import { X, Search, Link, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseYouTubeStartTime } from '@/lib/youtube';
import type { YouTubeVideo } from '@/lib/youtube';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import RecommendedVideos from './RecommendedVideos';

interface SearchBarProps {
  onVideoSelect: (video: YouTubeVideo) => void;
  videoId: string | null;
  autoFocus?: boolean;
  isPromptMode?: boolean;
  defaultMode?: InputMode;
  side?: 'left' | 'right';
}

type InputMode = 'url' | 'search' | 'prompt';

export default function SearchBar({ 
  onVideoSelect, 
  videoId, 
  autoFocus, 
  isPromptMode = true,
  defaultMode = 'prompt',
  side = 'left'
}: SearchBarProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>(defaultMode);
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

    if (inputMode === 'url') {
      const videoId = extractVideoId(newValue);
      if (videoId) {
        handleVideoIdInput(videoId, newValue);
        lastValidUrlRef.current = newValue;
      }
    }
  };

  const toggleMode = () => {
    const modes: InputMode[] = ['url', 'search', 'prompt'];
    const currentIndex = modes.indexOf(inputMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setInputMode(modes[nextIndex]);
    setDisplayValue('');
    setIsValid(true);
  };

  const handleVideoIdInput = async (videoId: string, originalUrl: string) => {
    try {
      const startTime = parseYouTubeStartTime(originalUrl);
      onVideoSelect({
        id: videoId,
        title: 'Loading...',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        startTime
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

  const getPlaceholderText = () => {
    switch (inputMode) {
      case 'url':
        return "Paste YouTube URL";
      case 'search':
        return "Search YouTube videos";
      case 'prompt':
        return "Describe a video";
    }
  };

  const getToggleIcon = () => {
    switch (inputMode) {
      case 'url':
        return <Link className="h-4 w-4 transition-transform duration-200 hover:scale-110" />;
      case 'search':
        return <Search className="h-4 w-4 transition-transform duration-200 hover:scale-110" />;
      case 'prompt':
        return <Sparkles className="h-4 w-4 transition-transform duration-200 hover:scale-110" />;
    }
  };

  const getTooltipText = () => {
    switch (inputMode) {
      case 'url':
        return "Switch to search mode";
      case 'search':
        return "Switch to prompt mode";
      case 'prompt':
        return "Switch to URL mode";
    }
  };

  return (
    <div className="w-full">
      <div className="relative group p-1">
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholderText()}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={cn(
              "pr-16 font-mono text-sm transition-all",
              !isValid && displayValue && inputMode === 'url' ? 'border-red-500' : '',
              "animate-placeholder"
            )}
          />
          <div className="absolute right-1 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 transition-all duration-300",
                      "hover:bg-accent/50 hover:scale-105",
                      "group/button relative overflow-hidden",
                      "after:absolute after:inset-0 after:translate-x-[-100%]",
                      "after:animate-shimmer after:bg-gradient-to-r",
                      "after:from-transparent after:via-accent/10 after:to-transparent"
                    )}
                    onClick={toggleMode}
                  >
                    {getToggleIcon()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {getTooltipText()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      {!isValid && displayValue && inputMode === 'url' && (
        <p className="text-xs text-red-500 mt-1">
          Please enter a valid YouTube URL or video ID
        </p>
      )}
      {inputMode === 'url' && (
        <div className="mt-4">
          <RecommendedVideos
            videoId={videoId}
            onVideoSelect={onVideoSelect}
            side={side}
          />
        </div>
      )}
    </div>
  );
}