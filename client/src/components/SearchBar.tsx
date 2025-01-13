import { useState, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchBarProps {
  onVideoSelect: (videoId: string) => void;
  videoId: string | null;
}

interface SearchResponse {
  videos: Array<{
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    channelTitle: string;
  }>;
  nextPageToken?: string;
  totalResults: number;
}

export default function SearchBar({ onVideoSelect, videoId }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, 500);

  const {
    data,
    isLoading,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['youtube-search', debouncedSearch],
    queryFn: async ({ pageParam = '' }) => {
      if (!debouncedSearch) return { videos: [], nextPageToken: undefined, totalResults: 0 };

      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(debouncedSearch)}${pageParam ? `&pageToken=${pageParam}` : ''}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch search results');
      }

      return response.json() as Promise<SearchResponse>;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: debouncedSearch.length > 0,
  });

  useEffect(() => {
    if (!lastItemRef.current || !hasNextPage || isFetching) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    observerRef.current.observe(lastItemRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetching, fetchNextPage]);

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

    const videoId = extractVideoId(newUrl);
    if (videoId) {
      onVideoSelect(videoId);
    }
  };

  const handleClear = () => {
    setUrl('');
    onVideoSelect('');
  };

  const allVideos = data?.pages.flatMap(page => page.videos) ?? [];

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
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
            className="w-[400px] p-0 shadow-lg shadow-primary/20" 
            align="start"
            sideOffset={4}
          >
            <Command className="rounded-lg border border-primary/10">
              <CommandInput
                placeholder="search videos..."
                value={search}
                onValueChange={handleSearch}
                className="focus:ring-primary/30 normal-case"
              />
              <CommandList>
                <ScrollArea className="h-[300px]">
                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  )}

                  {error && (
                    <CommandEmpty className="py-6 text-center text-sm text-destructive">
                      {error instanceof Error ? error.message : 'Failed to search videos'}
                    </CommandEmpty>
                  )}

                  {!isLoading && !error && allVideos.length === 0 && (
                    <CommandEmpty className="py-6 text-center text-sm">
                      No videos found. Try a different search term.
                    </CommandEmpty>
                  )}

                  <CommandGroup>
                    {allVideos.map((video, index) => (
                      <CommandItem
                        key={`${video.id}-${index}`}
                        onSelect={() => {
                          onVideoSelect(video.id);
                          setUrl(`https://www.youtube.com/watch?v=${video.id}`);
                          setOpen(false);
                        }}
                        className="transition-colors duration-200 hover:bg-primary/5 p-2"
                      >
                        <div className="flex gap-3 w-full">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium normal-case">
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate normal-case">
                              {video.channelTitle}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                    {hasNextPage && (
                      <div ref={lastItemRef} className="py-2 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    )}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="relative flex-1">
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
    </div>
  );
}