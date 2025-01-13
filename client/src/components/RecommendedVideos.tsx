import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import type { YouTubeVideo } from '@/lib/youtube';
import { cn } from '@/lib/utils';
import { getRelatedVideos } from '@/lib/youtube';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

export default function RecommendedVideos({ videoId, onVideoSelect }: RecommendedVideosProps) {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: [`/api/youtube/related?v=${videoId}`],
    queryFn: () => getRelatedVideos(videoId!),
    enabled: !!videoId,
    retry: false,
  });

  // Don't render anything if there's no video selected
  if (!videoId) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-primary/80">Loading recommendations...</h3>
      </div>
    );
  }

  // Show error state if any
  if (error) {
    console.error('Failed to load recommendations:', error);
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-destructive">Failed to load recommendations</h3>
      </div>
    );
  }

  // Show empty state if no videos
  if (!videos?.length) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-primary/80">No recommendations available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-primary/80">Related Videos</h3>
      <div className="grid grid-cols-2 gap-2">
        {videos.slice(0, 4).map((video: YouTubeVideo) => (
          <Card 
            key={video.id}
            className={cn(
              "overflow-hidden cursor-pointer transition-all duration-300",
              "hover:ring-1 hover:ring-primary/50 hover:scale-[1.02]"
            )}
            onClick={() => onVideoSelect(video.id)}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-2">
              <p className="text-xs line-clamp-2 normal-case">
                {video.title}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}