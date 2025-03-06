import { useState, useRef } from 'react';
import type ReactPlayer from 'react-player/youtube';

interface VideoSyncState {
  leftReady: boolean;
  rightReady: boolean;
}

export function useVideoSync() {
  const [syncState, setSyncState] = useState<VideoSyncState>({
    leftReady: false,
    rightReady: false,
  });

  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);

  const handleReady = (player: 'left' | 'right') => {
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));
  };

  const syncPlay = async (shouldPlay: boolean) => {
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer || !rightPlayer) {
      console.log('Players not initialized');
      return;
    }

    try {
      if (shouldPlay) {
        // First pause both videos to ensure clean state
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();

        // Wait a brief moment for pause to take effect
        await new Promise(resolve => setTimeout(resolve, 100));

        // Seek both to start if needed
        leftPlayer.seekTo(0);
        rightPlayer.seekTo(0);

        // Play both videos
        leftPlayer.playVideo();
        rightPlayer.playVideo();
      } else {
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      if (leftPlayer) leftPlayer.pauseVideo();
      if (rightPlayer) rightPlayer.pauseVideo();
    }
  };

  return {
    syncState,
    leftPlayerRef,
    rightPlayerRef,
    handleReady,
    syncPlay,
  };
}