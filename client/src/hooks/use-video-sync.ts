import { useState, useRef, useEffect } from 'react';
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

    if (!leftPlayer || !rightPlayer) {
      console.log('Players not initialized');
      return;
    }

    try {
      if (shouldPlay) {
        if (!leftReady || !rightReady) {
          console.log('Waiting for players to be ready');
          return;
        }

        // Ensure both players are at the same timestamp
        const leftTime = leftPlayer.getCurrentTime();
        const rightTime = rightPlayer.getCurrentTime();
        const targetTime = Math.min(leftTime, rightTime);

        // Seek both players to the same timestamp
        await Promise.all([
          new Promise<void>((resolve) => {
            leftPlayer.seekTo(targetTime);
            resolve();
          }),
          new Promise<void>((resolve) => {
            rightPlayer.seekTo(targetTime);
            resolve();
          })
        ]);

        // Play both videos simultaneously
        const playPromises = await Promise.all([
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
        ]);

      } else {
        // Pause both videos
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      // Ensure both videos are paused on error
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