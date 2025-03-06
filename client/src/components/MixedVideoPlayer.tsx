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
    youtube: {
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
        disablekb: 1
      }
    }
  };

  // Calculate audio levels based on crossfader
  const audioLevels = preview ? { left: 0, right: 0 } : {
    left: Math.max(0, 1 - crossFaderValue),
    right: Math.max(0, crossFaderValue)
  };

  const handleVideoPlayPause = async () => {
    try {
      await syncPlay(!isPlaying);
      onPlayPause();
    } catch (error) {
      console.error('Error in handleVideoPlayPause:', error);
    }
  };

  // Handle empty state
  if (!leftVideoId && !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Load videos to play</p>
      </Card>
    );
  }

  // Handle single video states
  if (!leftVideoId || !rightVideoId) {
    const videoId = leftVideoId || rightVideoId;
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <ReactPlayer
          ref={leftVideoId ? leftPlayerRef : rightPlayerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={leftVideoId ? audioLevels.left : audioLevels.right}
          muted={preview}
          config={playerConfig}
          playsinline
          onReady={() => handleReady(leftVideoId ? 'left' : 'right')}
        />
        <VideoOverlay isPlaying={isPlaying} onPlayPause={handleVideoPlayPause} />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0">
        <ReactPlayer
          ref={leftPlayerRef}
          url={`https://www.youtube.com/watch?v=${leftVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={audioLevels.left}
          muted={preview}
          config={playerConfig}
          playsinline
          onReady={() => handleReady('left')}
        />
      </div>
      <div className="absolute inset-0">
        <ReactPlayer
          ref={rightPlayerRef}
          url={`https://www.youtube.com/watch?v=${rightVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={audioLevels.right}
          muted={preview}
          config={playerConfig}
          playsinline
          onReady={() => handleReady('right')}
        />
      </div>
      <VideoOverlay isPlaying={isPlaying} onPlayPause={handleVideoPlayPause} />
    </div>
  );
}