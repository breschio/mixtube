import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRelatedVideos, searchVideos } from '@/lib/youtube';
import type { YouTubeVideo } from '@/lib/youtube';
import { useEffect, useState } from 'react';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (videoId: string) => void;
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
  const [selectedCategory, setSelectedCategory] = useState('For You');

  const { data: currentVideos, isLoading, error, isError, refetch } = useQuery<YouTubeVideo[]>({
    queryKey: ['videos', videoId, selectedCategory],
    queryFn: () => {
      if (!videoId) return [];
      return selectedCategory === 'For You' ? 
        getRelatedVideos(videoId) : 
        searchVideos(`${selectedCategory} music`);
    },
    enabled: !!videoId,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message?.includes('quota exceeded') || 
          error.message?.includes('API key') ||
          error.message?.includes('Rate limit exceeded')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (videoId) {
      queryClient.invalidateQueries({ queryKey: ['videos', videoId, selectedCategory] });
      refetch();
    }
  }, [videoId, selectedCategory, queryClient, refetch]);

  const handleShuffle = async () => {
    await queryClient.invalidateQueries({ queryKey: ['videos', videoId, selectedCategory] });
    refetch();
  };

  if (!videoId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError || !currentVideos?.length) {
    return (
      <div className="mt-4 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'No videos available'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1 pb-2">
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
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-xs font-bold text-primary/80">UP NEXT</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShuffle}
          className="text-xs hover:bg-primary/10"
        >
          <Shuffle className="h-3 w-3" />
          Shuffle
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-2">
        {currentVideos.map((video) => (
          <Card 
            key={video.id}
            className={cn(
              "overflow-hidden transition-all duration-300",
              "hover:ring-1 hover:ring-primary/50"
            )}
          >
            <div className="flex gap-3 p-2">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-32 aspect-video object-cover rounded"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <p className="text-xs line-clamp-2 normal-case font-medium">
                  {video.title}
                </p>
                <Button
                  size="sm"
                  variant="default"
                  className="mt-1 ml-auto bg-primary/80 hover:bg-primary transition-colors"
                  onClick={() => onVideoSelect(video.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
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