import { useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoId: string | null;
  side: 'primary' | 'left' | 'right';
  volume: number;
  playing: boolean;
  onVolumeChange: (value: number) => void;
  onVideoSelect: (videoId: string) => void;
}

export default function VideoPlayer({ 
  videoId, 
  side,
  volume,
  playing,
  onVolumeChange,
  onVideoSelect,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);

  const handlePlayerReady = useCallback(() => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player?.loadModule) {
        player.loadModule('captions');
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    const player = playerRef.current?.getInternalPlayer();
    if (player?.getVideoData) {
      const videoData = player.getVideoData();
      if (videoData?.video_id) {
        onVideoSelect(videoData.video_id);
      }
    }
  }, [onVideoSelect]);

  if (!videoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center transition-colors hover:bg-muted">
        <p className="text-muted-foreground">Select a video to play</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn(
        "aspect-video bg-black rounded-lg overflow-hidden",
        side === 'primary' ? 'mb-6' : 'mb-4'
      )}>
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          controls={true}
          onReady={handlePlayerReady}
          onEnded={handleEnded}
          config={{
            playerVars: {
              rel: 0,
              showinfo: 1,
              iv_load_policy: 3,
              modestbranding: 1,
              enablejsapi: 1,
              origin: window.location.origin,
              playsinline: 1,
            }
          }}
        />
      </div>
      <div className="flex items-center gap-4 px-2 pb-2">
        <Volume2 className="h-4 w-4 text-primary/80" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onVolumeChange(value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}