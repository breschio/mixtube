import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getRelatedVideos, searchVideos } from '@/lib/youtube';
import type { YouTubeVideo } from '@/lib/youtube';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (video: YouTubeVideo) => void;
}

const VIDEO_CATEGORIES = [
  'For You',
  'Music',
  'Gaming',
  'Entertainment',
  'Education',
  'Sports'
];

export default function RecommendedVideos({ videoId, onVideoSelect }: RecommendedVideosProps) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const saved = localStorage.getItem(`filter-${videoId}`);
    return saved || 'For You';
  });

  const { data: currentVideos, isLoading, error, isError } = useQuery<YouTubeVideo[]>({
    queryKey: ['videos', videoId, selectedCategory],
    queryFn: () => {
      if (!videoId) return [];
      return selectedCategory === 'For You' ? 
        getRelatedVideos(videoId).then(videos => videos.slice(0, 3)) : 
        searchVideos(`${selectedCategory} music`).then(videos => videos.slice(0, 3));
    },
    enabled: !!videoId,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  if (!videoId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError || !currentVideos?.length) {
    return (
      <div className="flex-1 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'No videos available'}
        </p>
      </div>
    );
  }

  const displayVideos = currentVideos.slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-1">
          {VIDEO_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="text-xs px-3 whitespace-nowrap"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 grid grid-rows-3 gap-3 mt-2">
        {displayVideos.map((video) => (
          <Card 
            key={video.id}
            className={cn(
              "w-full",
              "overflow-hidden transition-all duration-300",
              "hover:ring-1 hover:ring-primary/50"
            )}
          >
            <div className="flex gap-2 p-1.5 h-full">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-24 aspect-video object-cover rounded"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <p className="text-xs line-clamp-2 normal-case font-medium">
                  {video.title}
                </p>
                <Button
                  size="sm"
                  variant="default"
                  className="mt-1 ml-auto bg-primary/80 hover:bg-primary transition-colors"
                  onClick={() => onVideoSelect(video)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}