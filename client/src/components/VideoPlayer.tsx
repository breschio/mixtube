import { useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import { Volume2, X } from "lucide-react";

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
      <Card className="aspect-video bg-muted/50 flex items-center justify-center transition-colors hover:bg-muted relative">
        <p className="text-muted-foreground text-sm">Select a video to play</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-primary/80 hover:bg-primary text-white rounded-full p-1.5 transition-colors">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={0}
          muted={true}
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
                iv_load_policy: 3,
                origin: window.location.origin,
                disablekb: 1,
                fs: 0
              }
            }
          }}
        />
      </div>
    </div>
  );
}