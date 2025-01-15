import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRelatedVideos } from '@/lib/youtube';
import type { YouTubeVideo } from '@/lib/youtube';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

export default function RecommendedVideos({ videoId, onVideoSelect }: RecommendedVideosProps) {
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error, isError, refetch } = useQuery<YouTubeVideo[]>({
    queryKey: [`/api/youtube/related`, videoId],
    queryFn: () => getRelatedVideos(videoId!),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on quota exceeded or other known errors
      if (error.message?.includes('quota exceeded') || error.message?.includes('API key')) {
        return false;
      }
      return failureCount < 1; // Max 1 retry to reduce API calls
    },
  });

  const handleShuffle = async () => {
    // Invalidate the current query to force a refetch
    await queryClient.invalidateQueries({ queryKey: [`/api/youtube/related`, videoId] });
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

  if (isError || !videos?.length) {
    return (
      <div className="mt-4 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'No related videos available'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary/80">UP NEXT</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShuffle}
          className="text-xs"
        >
          <Shuffle className="h-3 w-3 mr-1" />
          Shuffle
        </Button>
      </div>
      <div className="space-y-2">
        {videos.map((video) => (
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
                  variant="ghost"
                  className="w-full mt-1"
                  onClick={() => onVideoSelect(video.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
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