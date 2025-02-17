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
}

export default function MixedVideoPlayer({ 
  leftVideoId, 
  rightVideoId, 
  crossFaderValue,
  playing: isPlaying,
  onPlayPause,
  preview = false
}: MixedVideoPlayerProps) {
  const {
    leftPlayerRef,
    rightPlayerRef,
    handleStateChange,
    handleReady,
    syncPlay
  } = useVideoSync();

  // Handle case when no videos are loaded
  if (!leftVideoId && !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center relative">
        <p className="text-muted-foreground">Load videos to start mixing</p>
      </Card>
    );
  }

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

  // For single video display
  if (!leftVideoId && rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <ReactPlayer
          ref={rightPlayerRef}
          url={`https://www.youtube.com/watch?v=${rightVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={preview ? 1 : 0}
          muted={!preview}
          onReady={() => handleReady('right')}
          onPlay={() => handleStateChange('right', 1)}
          onPause={() => handleStateChange('right', 2)}
          config={playerConfig}
        />
        <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
      </div>
    );
  }

  if (leftVideoId && !rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <ReactPlayer
          ref={leftPlayerRef}
          url={`https://www.youtube.com/watch?v=${leftVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={preview ? 1 : 0}
          muted={!preview}
          onReady={() => handleReady('left')}
          onPlay={() => handleStateChange('left', 1)}
          onPause={() => handleStateChange('left', 2)}
          config={playerConfig}
        />
        <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
      </div>
    );
  }

  // For mixed view (both videos)
  const leftOpacity = 1 - crossFaderValue;
  const rightOpacity = crossFaderValue;

  const handleMixedPlayPause = async () => {
    await syncPlay(!isPlaying);
    onPlayPause();
  };

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: leftOpacity }}>
        <ReactPlayer
          ref={leftPlayerRef}
          url={`https://www.youtube.com/watch?v=${leftVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={preview ? Math.max(0, 1 - crossFaderValue) : 0}
          muted={!preview || crossFaderValue === 1}
          onReady={() => handleReady('left')}
          onPlay={() => handleStateChange('left', 1)}
          onPause={() => handleStateChange('left', 2)}
          config={playerConfig}
        />
      </div>

      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: rightOpacity }}>
        <ReactPlayer
          ref={rightPlayerRef}
          url={`https://www.youtube.com/watch?v=${rightVideoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={preview ? Math.max(0, crossFaderValue) : 0}
          muted={!preview || crossFaderValue === 0}
          onReady={() => handleReady('right')}
          onPlay={() => handleStateChange('right', 1)}
          onPause={() => handleStateChange('right', 2)}
          config={playerConfig}
        />
      </div>

      <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
    </div>
  );
}