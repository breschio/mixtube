import { useRef, useEffect, useState, useCallback } from 'react';
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
  mobileView?: boolean;
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
  mobileView = false,
  leftStartTime,
  rightStartTime
}: MixedVideoPlayerProps) {
  const [ytApiReady, setYtApiReady] = useState(false);
  const [playersReady, setPlayersReady] = useState({ left: false, right: false });
  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);

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

  // Calculate audio levels based on crossfader and preview state
  const getAudioLevels = () => {
    if (preview) return { left: 0, right: 0 };
    return {
      left: Math.max(0, 1 - crossFaderValue),
      right: Math.max(0, crossFaderValue)
    };
  };

  const audioLevels = getAudioLevels();

  // Create URLs with start times if provided
  const getVideoUrl = (videoId: string | null, startTime?: number) => {
    if (!videoId) return '';
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return startTime ? `${url}&start=${startTime}` : url;
  };

  // Initialize YouTube IFrame API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT) {
        setYtApiReady(true);
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Add the callback expected by YouTube
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        setYtApiReady(true);
      };
    };

    loadYouTubeAPI();

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const handleReady = useCallback((player: 'left' | 'right') => {
    console.log(`${player} player ready`);
    setPlayersReady(prev => ({ ...prev, [player]: true }));
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!ytApiReady) {
      console.log('YouTube API not ready');
      return;
    }

    if (!playersReady.left || !playersReady.right) {
      console.log('Players not ready', playersReady);
      return;
    }

    try {
      const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
      const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

      if (!leftPlayer || !rightPlayer) {
        console.log('Players not initialized');
        return;
      }

      if (!isPlaying) {
        // Start both players synchronously
        console.log('Starting both players');
        await Promise.all([
          new Promise<void>((resolve) => {
            leftPlayer.playVideo();
            resolve();
          }),
          new Promise<void>((resolve) => {
            rightPlayer.playVideo();
            resolve();
          })
        ]);

        // Verify both are playing
        setTimeout(() => {
          const leftState = leftPlayer.getPlayerState();
          const rightState = rightPlayer.getPlayerState();
          console.log('Player states after play:', { left: leftState, right: rightState });

          if (leftState !== 1) leftPlayer.playVideo();
          if (rightState !== 1) rightPlayer.playVideo();
        }, 100);
      } else {
        console.log('Pausing both players');
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }

      onPlayPause();
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
    }
  }, [ytApiReady, playersReady, isPlaying, onPlayPause]);

  // Base player components that stay mounted
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
        <VideoOverlay isPlaying={isPlaying} onPlayPause={handlePlayPause} />
      </div>
    );
  }

  if (leftVideoId && !rightVideoId) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        {leftPlayer}
        <VideoOverlay isPlaying={isPlaying} onPlayPause={handlePlayPause} />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex">
      {renderTemplate()}
      <VideoOverlay 
        isPlaying={isPlaying} 
        onPlayPause={handlePlayPause}
      />
    </div>
  );
}