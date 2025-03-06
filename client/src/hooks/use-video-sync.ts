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

  const handlePlayPause = async (shouldPlay: boolean) => {
    const { leftReady, rightReady } = syncState;
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer && !rightPlayer) return;

    try {
      if (shouldPlay) {
        // Ensure both players are ready
        if (!leftReady || !rightReady) {
          console.log('Waiting for players to be ready');
          return;
        }

        // Start both players simultaneously
        const promises = [];
        if (leftPlayer) promises.push(leftPlayer.playVideo());
        if (rightPlayer) promises.push(rightPlayer.playVideo());
        await Promise.all(promises);
      } else {
        if (leftPlayer) leftPlayer.pauseVideo();
        if (rightPlayer) rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      if (leftPlayer) leftPlayer.pauseVideo();
      if (rightPlayer) rightPlayer.pauseVideo();
      throw error;
    }
  };

  return {
    syncState,
    leftPlayerRef,
    rightPlayerRef,
    handleReady,
    handlePlayPause,
  };
}