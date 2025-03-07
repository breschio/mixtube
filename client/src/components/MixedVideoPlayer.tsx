import { useRef } from 'react';
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
  leftStartTime?: number;
  rightStartTime?: number;
}

interface PlayerConfig {
  playerVars: {
    controls: number;
    modestbranding: number;
    playsinline: number;
    rel: number;
    showinfo: number;
    iv_load_policy: number;
    cc_load_policy: number;
    cc_lang_pref: string;
    origin: string;
    enablejsapi: number;
    fs: number;
    disablekb: number;
  };
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
  const {
    leftPlayerRef,
    rightPlayerRef,
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
      cc_load_policy: 3,
      cc_lang_pref: 'none',
      origin: window.location.origin,
      enablejsapi: 1,
      fs: 0,
      disablekb: 1,
    }
  } as { youtube: PlayerConfig };

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

  const handleVideoPlayPause = async () => {
    try {
      await syncPlay(!isPlaying);
      onPlayPause();
    } catch (error) {
      console.error('Error in handleVideoPlayPause:', error);
    }
  };

  // Base player components with playsinline enabled for mobile
  const leftPlayer = (
    <ReactPlayer
      ref={leftPlayerRef}
      url={getVideoUrl(leftVideoId, leftStartTime)}
      width="100%"
      height="100%"
      playing={isPlaying}
      volume={audioLevels.left}
      muted={true} // Start muted to bypass mobile autoplay restrictions
      onReady={() => handleReady('left')}
      config={playerConfig}
      playsinline={true}
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
      muted={true} // Start muted to bypass mobile autoplay restrictions
      onReady={() => handleReady('right')}
      config={playerConfig}
      playsinline={true}
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
        <VideoOverlay isPlaying={isPlaying} onPlayPause={handleVideoPlayPause} />
      </div>
    );
  }

  if (leftVideoId && !rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {leftPlayer}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={handleVideoPlayPause} />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex">
      {activeTemplate === 'side-by-side' ? (
        <>
          <div className="h-full transition-[width] duration-200" style={{ width: `${Math.max(20, Math.min(80, (1 - crossFaderValue) * 100))}%` }}>
            {leftPlayer}
          </div>
          <div className="h-full transition-[width] duration-200" style={{ width: `${Math.max(20, Math.min(80, crossFaderValue * 100))}%` }}>
            {rightPlayer}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: 1 - crossFaderValue }}>
            {leftPlayer}
          </div>
          <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: crossFaderValue }}>
            {rightPlayer}
          </div>
        </>
      )}
      <VideoOverlay isPlaying={isPlaying} onPlayPause={handleVideoPlayPause} />
    </div>
  );
}