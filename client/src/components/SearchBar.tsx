import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onVideoSelect: (videoId: string) => void;
  videoId: string | null;
}

export default function SearchBar({ onVideoSelect, videoId }: SearchBarProps) {
  const [url, setUrl] = useState(videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    const videoId = extractVideoId(newUrl);
    if (videoId) {
      onVideoSelect(videoId);
    }
  };

  const handleClear = () => {
    setUrl('');
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
          className="pr-8 normal-case"
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
    </div>
  );
}