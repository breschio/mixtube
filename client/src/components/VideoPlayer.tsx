import { Card } from '@/components/ui/card';
import { Music2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface VideoPlayerProps {
  videoId: string | null;
  videoTitle?: string;
  channelTitle?: string;
  side: 'left' | 'right';
  onVideoEnd?: () => void;
}

export default function VideoPlayer({ 
  videoId, 
  videoTitle = '',
  channelTitle = '',
  side,
  onVideoEnd
}: VideoPlayerProps) {
  // Fetch related videos when a video is loaded
  const { data: relatedVideos } = useQuery({
    queryKey: ['related-videos', videoId],
    queryFn: async () => {
      if (!videoId) return [];
      return fetch(`/api/youtube/related?v=${videoId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch related videos');
          return res.json();
        })
        .catch(err => {
          console.error('Error fetching related videos:', err);
          return [];
        });
    },
    enabled: !!videoId,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (!videoId) return;

    // Initialize YouTube player
    const player = new YT.Player(`youtube-player-${side}`, {
      videoId,
      events: {
        onStateChange: (event) => {
          // Video has ended
          if (event.data === YT.PlayerState.ENDED) {
            if (onVideoEnd && relatedVideos?.length > 0) {
              onVideoEnd();
            }
          }
        }
      }
    });

    return () => {
      player.destroy();
    };
  }, [videoId, side, onVideoEnd, relatedVideos]);

  if (!videoId) {
    return (
      <Card className="bg-muted/50 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Select a video to play</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="flex gap-2 p-1.5">
        <img 
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={videoTitle}
          className="w-24 aspect-video object-cover rounded"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="space-y-1">
            <h3 className="font-medium leading-none line-clamp-2 text-sm">
              {videoTitle || 'Untitled Video'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {channelTitle || 'Unknown Channel'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="shrink-0 rounded-full bg-muted p-1.5">
              <Music2 className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground capitalize">{side} deck</span>
          </div>
        </div>
      </div>
    </Card>
  );
}