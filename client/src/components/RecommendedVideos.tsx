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
  const { data: videos, isLoading } = useQuery({
    queryKey: [`/api/youtube/related?v=${videoId}`],
    queryFn: () => getRelatedVideos(videoId!),
    enabled: !!videoId,
  });

  if (!videoId || isLoading || !videos?.length) {
    return null;
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