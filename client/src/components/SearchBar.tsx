
import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onVideoSelect: (videoId: string) => void;
  videoId: string | null;
}

export default function SearchBar({ onVideoSelect, videoId }: SearchBarProps) {
  const [url, setUrl] = useState(videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
  const [isValid, setIsValid] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    const videoId = extractVideoId(newUrl);
    if (videoId) {
      onVideoSelect(videoId);
      addToHistory(newUrl);
    }
  };

  const addToHistory = (newUrl: string) => {
    const updatedHistory = [newUrl, ...searchHistory.filter(item => item !== newUrl)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleClear = () => {
    setUrl('');
    setIsValid(true);
    onVideoSelect('');
  };

  return (
    <div className="space-y-2 w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="paste youtube url..."
          value={url}
          onChange={handleUrlChange}
          className={`pr-8 normal-case ${!isValid && url ? 'border-red-500' : ''}`}
        />
        {url && (
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
      {!isValid && url && (
        <p className="text-xs text-red-500 mt-1">Please enter a valid YouTube URL or video ID</p>
      )}
    </div>
  );
}
