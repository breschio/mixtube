import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import VideoOverlay from './VideoOverlay';
import { useVideoSync } from '@/hooks/use-video-sync';
import VideoSubtitles from './VideoSubtitles';

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
    handlePiPSwitch
  } = useVideoSync();

  const prevCrossFaderRef = useRef(crossFaderValue);
  const [randomTemplate, setRandomTemplate] = useState('side-by-side');

  // Handle random template changes
  useEffect(() => {
    if (activeTemplate === 'random-mix' && isPlaying) {
      const templates = ['side-by-side', 'fade-through', 'picture-in-picture'];
      const interval = setInterval(() => {
        const currentIndex = templates.indexOf(randomTemplate);
        const nextIndex = (currentIndex + 1) % templates.length;
        setRandomTemplate(templates[nextIndex]);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeTemplate, isPlaying, randomTemplate]);

  // Handle PiP position changes
  useEffect(() => {
    if ((activeTemplate === 'picture-in-picture' || randomTemplate === 'picture-in-picture') &&
      activeTemplate !== 'random-mix') {
      const wasPipRight = prevCrossFaderRef.current > 0.5;
      const isPipRight = crossFaderValue > 0.5;

      if (wasPipRight !== isPipRight) {
        handlePiPSwitch();
      }
    }
    prevCrossFaderRef.current = crossFaderValue;
  }, [crossFaderValue, activeTemplate, randomTemplate, handlePiPSwitch]);

  // Handle case when no videos are loaded
  if (!leftVideoId && !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground">Load videos to start mixing</p>
      </Card>
    );
  }

  const showSubtitles = activeTemplate === 'subtitles';

  // Modify the player config to always load captions when subtitles mode is active
  const playerConfig = {
    playerVars: {
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      origin: window.location.origin,
      enablejsapi: 1,
      ...(showSubtitles && { cc_load_policy: 1 })
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
          volume={mobileView ? 1 : 0}
          muted={!mobileView}
          onReady={() => handleReady('right')}
          onPlay={() => handleStateChange('right', 1)}
          onPause={() => handleStateChange('right', 2)}
          config={playerConfig}
        />
        {showSubtitles && (
          <VideoSubtitles
            rightPlayer={rightPlayerRef.current}
            isVisible={true}
          />
        )}
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
          volume={mobileView ? 1 : 0}
          muted={!mobileView}
          onReady={() => handleReady('left')}
          onPlay={() => handleStateChange('left', 1)}
          onPause={() => handleStateChange('left', 2)}
          config={playerConfig}
        />
        {showSubtitles && rightPlayerRef.current && (
          <VideoSubtitles
            rightPlayer={rightPlayerRef.current}
            isVisible={true}
          />
        )}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={onPlayPause} />
      </div>
    );
  }

  const handleMixedPlayPause = async () => {
    await syncPlay(!isPlaying);
    onPlayPause();
  };

  const effectiveTemplate = activeTemplate;

  // Calculate audio levels based on crossfader and preview state
  const getAudioLevels = () => {
    // For preview players, always mute
    if (preview) {
      return { left: 0, right: 0 };
    }

    // For mobile view, use full audio on the dominant video
    if (mobileView) {
      return crossFaderValue > 0.5
        ? { left: 0, right: 1 }
        : { left: 1, right: 0 };
    }

    // Desktop mix view: Calculate audio levels based on crossfader
    return {
      left: Math.max(0, 1 - crossFaderValue),
      right: Math.max(0, crossFaderValue)
    };
  };

  const audioLevels = getAudioLevels();

  // Subtitles mode
  if (effectiveTemplate === 'subtitles') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {/* Main video (left) */}
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

        {/* Hidden video for subtitles (right) */}
        <div className="hidden">
          <ReactPlayer
            ref={rightPlayerRef}
            url={`https://www.youtube.com/watch?v=${rightVideoId}`}
            playing={isPlaying}
            volume={0}
            muted={true}
            onReady={() => handleReady('right')}
            onPlay={() => handleStateChange('right', 1)}
            onPause={() => handleStateChange('right', 2)}
            config={{
              ...playerConfig,
              playerVars: {
                ...playerConfig.playerVars,
                cc_load_policy: 1
              }
            }}
          />
        </div>

        <VideoSubtitles
          rightPlayer={rightPlayerRef.current}
          isVisible={true}
        />

        <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
      </div>
    );
  }

  // Picture-in-Picture layout
  if (effectiveTemplate === 'picture-in-picture') {
    const isPipRight = crossFaderValue > 0.5;
    const mainVideo = isPipRight ? rightVideoId : leftVideoId;
    const pipVideo = isPipRight ? leftVideoId : rightVideoId;

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {/* Main video */}
        <div className="absolute inset-0">
          <ReactPlayer
            ref={isPipRight ? rightPlayerRef : leftPlayerRef}
            url={`https://www.youtube.com/watch?v=${mainVideo}`}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={isPipRight ? audioLevels.right : audioLevels.left}
            muted={preview}
            onReady={() => handleReady(isPipRight ? 'right' : 'left')}
            onPlay={() => handleStateChange(isPipRight ? 'right' : 'left', 1)}
            onPause={() => handleStateChange(isPipRight ? 'right' : 'left', 2)}
            config={playerConfig}
          />
        </div>

        {/* PiP overlay */}
        <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden shadow-lg border border-white/20">
          <ReactPlayer
            ref={isPipRight ? leftPlayerRef : rightPlayerRef}
            url={`https://www.youtube.com/watch?v=${pipVideo}`}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={isPipRight ? audioLevels.left : audioLevels.right}
            muted={preview}
            onReady={() => handleReady(isPipRight ? 'left' : 'right')}
            onPlay={() => handleStateChange(isPipRight ? 'left' : 'right', 1)}
            onPause={() => handleStateChange(isPipRight ? 'left' : 'right', 2)}
            config={playerConfig}
          />
        </div>
        {showSubtitles && (
          <VideoSubtitles
            rightPlayer={rightPlayerRef.current}
            isVisible={true}
          />
        )}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
      </div>
    );
  }

  // Side-by-side layout
  if (effectiveTemplate === 'side-by-side') {
    const leftWidth = Math.max(20, Math.min(80, (1 - crossFaderValue) * 100));
    const rightWidth = 100 - leftWidth;

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex">
        <div className="h-full transition-[width] duration-200" style={{ width: `${leftWidth}%` }}>
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
        </div>
        <div className="h-full transition-[width] duration-200" style={{ width: `${rightWidth}%` }}>
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
        </div>
        {showSubtitles && (
          <VideoSubtitles
            rightPlayer={rightPlayerRef.current}
            isVisible={true}
          />
        )}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
      </div>
    );
  }

  // Default fade-through layout
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: 1 - crossFaderValue }}>
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
      </div>

      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: crossFaderValue }}>
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
      </div>
      {showSubtitles && (
          <VideoSubtitles
            rightPlayer={rightPlayerRef.current}
            isVisible={true}
          />
        )}
      <VideoOverlay isPlaying={isPlaying} onPlayPause={preview ? onPlayPause : handleMixedPlayPause} />
    </div>
  );
}