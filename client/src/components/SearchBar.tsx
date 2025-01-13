import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedCallback } from 'use-debounce';

interface SearchBarProps {
  onVideoSelect: (videoId: string) => void;
  videoId: string | null;
}

export default function SearchBar({ onVideoSelect, videoId }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, 500);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/youtube/search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(debouncedSearch)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.json();
    },
    enabled: debouncedSearch.length > 0
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

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

    // Try to extract and submit video ID automatically
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Paste YouTube URL..."
            value={url}
            onChange={handleUrlChange}
            className="pr-8"
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0 shadow-lg shadow-primary/20" 
            align="end"
            sideOffset={4}
          >
            <Command className="rounded-lg border border-primary/10">
              <CommandInput
                placeholder="Search videos..."
                value={search}
                onValueChange={handleSearch}
                className="focus:ring-primary/30"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    'No results found.'
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults?.map((video: any) => (
                    <CommandItem
                      key={video.id}
                      onSelect={() => {
                        onVideoSelect(video.id);
                        setUrl(`https://www.youtube.com/watch?v=${video.id}`);
                        setOpen(false);
                      }}
                      className="transition-colors duration-200 hover:bg-primary/5"
                    >
                      <div className="flex items-center w-full">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-9 object-cover mr-2 rounded"
                        />
                        <span className="truncate">{video.title}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}