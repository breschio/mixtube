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
    const { leftReady, rightReady } = syncState;
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer || !rightPlayer) return;

    try {
      if (shouldPlay) {
        if (!leftReady || !rightReady) {
          console.log('Waiting for players to be ready');
          return;
        }

        // Ensure both players start at the same time
        const playPromises = [
          new Promise<void>((resolve) => {
            leftPlayer.playVideo();
            const checkPlay = setInterval(() => {
              if (leftPlayer.getPlayerState() === 1) {
                clearInterval(checkPlay);
                resolve();
              }
            }, 10);
          }),
          new Promise<void>((resolve) => {
            rightPlayer.playVideo();
            const checkPlay = setInterval(() => {
              if (rightPlayer.getPlayerState() === 1) {
                clearInterval(checkPlay);
                resolve();
              }
            }, 10);
          })
        ];

        await Promise.all(playPromises);
      } else {
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
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
    syncPlay,
  };
}