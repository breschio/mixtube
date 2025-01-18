import { useRef, useCallback } from 'react';
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
      <Card className="w-full h-full bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Select a video to play</p>
      </Card>
    );
  }

  return (
    <>
      <div className="w-full h-full bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          controls={false}
          onReady={handlePlayerReady}
          onEnded={handleEnded}
          config={{
            youtube: {
              playerVars: {
                rel: 0,
                showinfo: 1,
                iv_load_policy: 3,
                modestbranding: 1,
                enablejsapi: 1,
                origin: window.location.origin,
                playsinline: 1,
              }
            }
          }}
        />
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 px-2 bg-black/50 rounded-lg p-2 z-30">
        <Volume2 className="h-4 w-4 text-white opacity-80" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onVolumeChange(value)}
          className="flex-1"
        />
      </div>
    </>
  );
}