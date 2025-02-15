import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { YouTubeVideo } from '@/lib/youtube';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (video: YouTubeVideo) => void;
  searchResults?: YouTubeVideo[];
  isSearching?: boolean;
}

export default function RecommendedVideos({ 
  videoId, 
  onVideoSelect, 
  searchResults,
  isSearching = false 
}: RecommendedVideosProps) {
  const { data: recommendedVideos, isLoading } = useQuery({
    queryKey: ['videos', videoId],
    queryFn: async () => {
      if (!videoId) return [];
      const response = await fetch(`/api/youtube/related/${videoId}`);
      if (!response.ok) throw new Error('Failed to fetch related videos');
      return response.json();
    },
    enabled: !!videoId && !isSearching,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  if (!videoId) {
    return null;
  }

  const displayVideos = searchResults || recommendedVideos;
  const showLoading = isSearching || isLoading;

  if (showLoading) {
    return (
      <div className="flex-1 space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full overflow-hidden animate-pulse">
            <div className="flex gap-2 p-1.5">
              <div className="w-24 aspect-video bg-muted rounded" />
              <div className="flex-1 py-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!displayVideos?.length) {
    return (
      <div className="flex-1 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No videos available
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3">
      {displayVideos.slice(0, 3).map((video) => (
        <Card 
          key={video.id}
          className="overflow-hidden border border-border/50"
        >
          <div className="flex gap-2 p-1.5">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-24 aspect-video object-cover rounded"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div className="space-y-1">
                <h3 className="font-medium leading-none line-clamp-2 text-sm">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {video.channelTitle || 'Unknown Channel'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 rounded-full bg-muted p-1.5">
                    <Music2 className="h-3 w-3" />
                  </div>
                  <span className="text-xs text-muted-foreground">Recommended</span>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  className="ml-auto bg-primary/80 hover:bg-primary transition-colors"
                  onClick={() => onVideoSelect(video)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}