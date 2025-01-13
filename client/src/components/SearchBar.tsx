import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Link } from 'lucide-react';
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
}

export default function SearchBar({ onVideoSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
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

  const handleUrlSubmit = () => {
    const videoId = extractVideoId(url);
    if (videoId) {
      onVideoSelect(videoId);
      setUrl('');
    }
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

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Paste YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUrlSubmit();
          }}
        />
        <Button 
          variant="outline"
          onClick={handleUrlSubmit}
          className="shrink-0"
        >
          <Link className="h-4 w-4" />
        </Button>
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