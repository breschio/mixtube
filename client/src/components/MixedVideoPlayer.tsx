import { useRef, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import VideoOverlay from './VideoOverlay';

interface MixedVideoPlayerProps {
  leftVideoId: string | null;
  rightVideoId: string | null;
  crossFaderValue: number;
  playing: boolean;
  onPlayPause: () => void;
  preview?: boolean;
  activeTemplate?: string;
  leftStartTime?: number;
  rightStartTime?: number;
}

export default function MixedVideoPlayer({
  leftVideoId,
  rightVideoId,
  crossFaderValue,
  playing: isPlaying,
  onPlayPause,
  preview = false,
  activeTemplate = 'side-by-side',
  leftStartTime,
  rightStartTime
}: MixedVideoPlayerProps) {
  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState({ left: false, right: false });

  // Common player config
  const playerConfig = {
    playerVars: {
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      cc_load_policy: 3,
      cc_lang_pref: 'none',
      origin: window.location.origin,
      enablejsapi: 1,
      fs: 0,
      disablekb: 1,
    }
  };

  // Calculate audio levels based on crossfader
  const audioLevels = preview ? { left: 0, right: 0 } : {
    left: Math.max(0, 1 - crossFaderValue),
    right: Math.max(0, crossFaderValue)
  };

  // Create URLs with start times if provided
  const getVideoUrl = (videoId: string | null, startTime?: number) => {
    if (!videoId) return '';
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return startTime ? `${url}&start=${startTime}` : url;
  };

  const handleReady = (side: 'left' | 'right') => {
    setIsReady(prev => ({ ...prev, [side]: true }));
  };

  // Base player components
  const leftPlayer = (
    <ReactPlayer
      ref={leftPlayerRef}
      url={getVideoUrl(leftVideoId, leftStartTime)}
      width="100%"
      height="100%"
      playing={isPlaying}
      volume={audioLevels.left}
      muted={preview}
      onReady={() => handleReady('left')}
      config={playerConfig}
    />
  );

  const rightPlayer = (
    <ReactPlayer
      ref={rightPlayerRef}
      url={getVideoUrl(rightVideoId, rightStartTime)}
      width="100%"
      height="100%"
      playing={isPlaying}
      volume={audioLevels.right}
      muted={preview}
      onReady={() => handleReady('right')}
      config={playerConfig}
    />
  );

  // Handle empty state
  if (!leftVideoId && !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Load videos to start mixing</p>
      </Card>
    );
  }

  // Handle single video states
  if (!leftVideoId && rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {rightPlayer}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
      </div>
    );
  }

  if (leftVideoId && !rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {leftPlayer}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
      </div>
    );
  }

  // Handle layout templates
  const renderTemplate = () => {
    if (activeTemplate === 'side-by-side') {
      const leftWidth = Math.max(20, Math.min(80, (1 - crossFaderValue) * 100));
      const rightWidth = 100 - leftWidth;
      return (
        <>
          <div className="h-full transition-[width] duration-200" style={{ width: `${leftWidth}%` }}>
            {leftPlayer}
          </div>
          <div className="h-full transition-[width] duration-200" style={{ width: `${rightWidth}%` }}>
            {rightPlayer}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: 1 - crossFaderValue }}>
          {leftPlayer}
        </div>
        <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: crossFaderValue }}>
          {rightPlayer}
        </div>
      </>
    );
  };

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex">
      {renderTemplate()}
      <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
    </div>
  );
}