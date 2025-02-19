import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import VideoOverlay from './VideoOverlay';
import { useVideoSync } from '@/hooks/use-video-sync';

interface MixedVideoPlayerProps {
  leftVideoId: string | null;
  rightVideoId: string | null;
  crossFaderValue: number;
  playing: boolean;
  onPlayPause: () => void;
  preview?: boolean;
  activeTemplate?: string;
  mobileView?: boolean;
}

export default function MixedVideoPlayer({
  leftVideoId,
  rightVideoId,
  crossFaderValue,
  playing: isPlaying,
  onPlayPause,
  preview = false,
  activeTemplate = 'side-by-side',
  mobileView = false
}: MixedVideoPlayerProps) {
  const {
    leftPlayerRef,
    rightPlayerRef,
    handleStateChange,
    handleReady,
    syncPlay,
  } = useVideoSync();

  // Common player config
  const playerConfig = {
    playerVars: {
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      origin: window.location.origin,
      enablejsapi: 1
    }
  };

  // Calculate audio levels based on crossfader and preview state
  const getAudioLevels = () => {
    if (preview) return { left: 0, right: 0 };
    if (mobileView) {
      return crossFaderValue > 0.5
        ? { left: 0, right: 1 }
        : { left: 1, right: 0 };
    }
    return {
      left: Math.max(0, 1 - crossFaderValue),
      right: Math.max(0, crossFaderValue)
    };
  };

  const audioLevels = getAudioLevels();

  // Base player components that stay mounted
  const leftPlayer = (
    <ReactPlayer
      ref={leftPlayerRef}
      url={`https://www.youtube.com/watch?v=${leftVideoId}`}
      width="100%"
      height="100%"
      playing={isPlaying}
      volume={audioLevels.left}
      muted={preview}
      onReady={() => handleReady('left')}
      onPlay={() => handleStateChange('left', 1)}
      onPause={() => handleStateChange('left', 2)}
      config={playerConfig}
    />
  );

  const rightPlayer = (
    <ReactPlayer
      ref={rightPlayerRef}
      url={`https://www.youtube.com/watch?v=${rightVideoId}`}
      width="100%"
      height="100%"
      playing={isPlaying}
      volume={audioLevels.right}
      muted={preview}
      onReady={() => handleReady('right')}
      onPlay={() => handleStateChange('right', 1)}
      onPause={() => handleStateChange('right', 2)}
      config={playerConfig}
    />
  );

  // Handle different layout templates
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

    // Default to fade-through
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

  // Handle case when no videos are loaded
  if (!leftVideoId && !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Load videos to start mixing</p>
      </Card>
    );
  }

  // For single video display
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

  const handleMixedPlayPause = async () => {
    await syncPlay(!isPlaying);
    onPlayPause();
  };

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex">
      {renderTemplate()}
      <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
    </div>
  );
}