import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shuffle } from 'lucide-react';
import { useState } from 'react';
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

  const { data: currentVideos, isLoading, error, isError, refetch } = useQuery<YouTubeVideo[]>({
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

  const handleShuffle = async () => {
    await queryClient.invalidateQueries({ queryKey: ['videos', videoId, selectedCategory] });
    refetch();
  };

  if (!videoId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !currentVideos?.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          {error instanceof Error ? error.message : 'No videos available'}
        </p>
      </Card>
    );
  }

  const displayVideos = currentVideos.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2">
          {VIDEO_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Up Next</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShuffle}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      <div className="space-y-2">
        {displayVideos.map((video) => (
          <Card key={video.id} className="p-2">
            <div className="flex gap-3">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-24 aspect-video object-cover rounded"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium line-clamp-2">
                  {video.title}
                </p>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => onVideoSelect(video)}
                >
                  <Plus className="h-4 w-4" />
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