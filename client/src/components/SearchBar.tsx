import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
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

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:border-primary/50 bg-background/80 backdrop-blur-sm"
          >
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-primary/80" />
              Search YouTube videos...
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg shadow-primary/20" 
          align="start"
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
  );
}