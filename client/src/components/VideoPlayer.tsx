import { useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  side: 'left' | 'right';
  volume: number;
  playing: boolean;
  onVolumeChange: (value: number) => void;
  onVideoSelect: (videoId: string) => void;
  videoTitle?: string;
  channelTitle?: string;
}

export default function VideoPlayer({ 
  videoId, 
  side,
  volume,
  playing,
  onVolumeChange,
  onVideoSelect,
  videoTitle = '',
  channelTitle = '',
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
      <div className="flex gap-4 items-start">
        <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden">
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            width="100%"
            height="100%"
            playing={playing}
            volume={0} // Always mute source videos
            muted={true} // Ensure source videos are muted
            controls={false}
            playIcon={false}
            onReady={handlePlayerReady}
            onEnded={handleEnded}
            config={{
              youtube: {
                playerVars: {
                  controls: 0,
                  modestbranding: 1,
                  showinfo: 0,
                  rel: 0,
                  playsinline: 1,
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3,
                  origin: window.location.origin,
                }
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium line-clamp-2">
            {videoTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {channelTitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
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