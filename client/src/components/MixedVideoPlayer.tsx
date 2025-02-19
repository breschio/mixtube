import { useEffect, useRef, useState } from 'react';
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

  // Auto-mix state
  const [autoMixValue, setAutoMixValue] = useState(0.5);
  const autoMixTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-mix transitions
  useEffect(() => {
    if (activeTemplate === 'auto-mix' && isPlaying) {
      const startAutoMix = () => {
        // Clear any existing timer
        if (autoMixTimerRef.current) {
          clearTimeout(autoMixTimerRef.current);
        }

        // Generate random values within the 36% range (0.36 to 0.64)
        const targetValue = 0.36 + Math.random() * 0.28; // 0.28 is the range (0.64 - 0.36)
        setAutoMixValue(targetValue);

        // Set random interval between 2 and 5 seconds
        const interval = 2000 + Math.random() * 3000;
        autoMixTimerRef.current = setTimeout(startAutoMix, interval);
      };

      startAutoMix();
      return () => {
        if (autoMixTimerRef.current) {
          clearTimeout(autoMixTimerRef.current);
        }
      };
    }
  }, [activeTemplate, isPlaying]);

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
    const effectiveCrossfader = activeTemplate === 'auto-mix' ? autoMixValue : crossFaderValue;
    return {
      left: Math.max(0, 1 - effectiveCrossfader),
      right: Math.max(0, effectiveCrossfader)
    };
  };

  const audioLevels = getAudioLevels();
  const effectiveCrossfader = activeTemplate === 'auto-mix' ? autoMixValue : crossFaderValue;
  const isPipRight = effectiveCrossfader > 0.5;

  // Create persistent player elements
  const leftPlayer = leftVideoId ? (
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
  ) : null;

  const rightPlayer = rightVideoId ? (
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
  ) : null;

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
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      {activeTemplate === 'picture-in-picture' ? (
        <>
          <div className="absolute inset-0 transition-transform duration-300">
            {isPipRight ? rightPlayer : leftPlayer}
          </div>
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden shadow-lg border border-white/20 transition-transform duration-300">
            {isPipRight ? leftPlayer : rightPlayer}
          </div>
        </>
      ) : activeTemplate === 'side-by-side' || activeTemplate === 'auto-mix' ? (
        <div className="flex h-full">
          <div 
            className="h-full transition-[width] duration-200" 
            style={{ width: `${Math.max(20, Math.min(80, (1 - effectiveCrossfader) * 100))}%` }}
          >
            {leftPlayer}
          </div>
          <div 
            className="h-full transition-[width] duration-200" 
            style={{ width: `${Math.max(20, Math.min(80, effectiveCrossfader * 100))}%` }}
          >
            {rightPlayer}
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: 1 - effectiveCrossfader }}>
            {leftPlayer}
          </div>
          <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: effectiveCrossfader }}>
            {rightPlayer}
          </div>
        </>
      )}
      <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
    </div>
  );
}