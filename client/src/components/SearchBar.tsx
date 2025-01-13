import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
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

interface SearchBarProps {
  onVideoSelect: (videoId: string) => void;
}

export default function SearchBar({ onVideoSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/youtube/search', search],
    queryFn: async () => {
      if (!search) return [];
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(search)}`);
      return response.json();
    },
    enabled: search.length > 0
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <Search className="mr-2 h-4 w-4" />
          Search YouTube videos...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search videos..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {searchResults?.map((video: any) => (
                <CommandItem
                  key={video.id}
                  onSelect={() => {
                    onVideoSelect(video.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-9 object-cover mr-2"
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
  );
}
