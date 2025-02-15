import { useState, useEffect, useRef } from 'react';
import type { ReactPlayer } from 'react-player/youtube';

interface VideoSyncState {
  leftReady: boolean;
  rightReady: boolean;
  leftState: number;
  rightState: number;
}

export function useVideoSync() {
  const [syncState, setSyncState] = useState<VideoSyncState>({
    leftReady: false,
    rightReady: false,
    leftState: -1,
    rightState: -1
  });

  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);

  const handleStateChange = (player: 'left' | 'right', state: number) => {
    console.log(`${player} player state changed to:`, state);
    setSyncState(prev => ({
      ...prev,
      [`${player}State`]: state
    }));
  };

  const handleReady = (player: 'left' | 'right') => {
    console.log(`${player} player ready`);
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));
  };

  const syncPlay = async (shouldPlay: boolean) => {
    const { leftReady, rightReady } = syncState;
    if (!leftReady || !rightReady) {
      console.log('Both players not ready yet');
      return;
    }

    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer || !rightPlayer) {
      console.log('Players not initialized');
      return;
    }

    try {
      if (shouldPlay) {
        console.log('Starting synchronized playback');
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
      } else {
        console.log('Pausing both videos');
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
    }
  };

  return {
    syncState,
    leftPlayerRef,
    rightPlayerRef,
    handleStateChange,
    handleReady,
    syncPlay
  };
}
