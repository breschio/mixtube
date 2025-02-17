import { useState, useEffect, useRef } from 'react';
import type ReactPlayer from 'react-player/youtube';

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

  const seekAllPlayers = async (time: number) => {
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (leftPlayer) {
      await leftPlayer.seekTo(time);
    }
    if (rightPlayer) {
      await rightPlayer.seekTo(time);
    }
  };

  const syncPlay = async (shouldPlay: boolean) => {
    const { leftReady, rightReady } = syncState;
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer && !rightPlayer) {
      console.log('No players initialized');
      return;
    }

    try {
      if (shouldPlay) {
        console.log('Starting synchronized playback');
        // Get current time from any active player
        const currentTime = leftPlayer?.getCurrentTime() || rightPlayer?.getCurrentTime() || 0;

        // Sync all players to the same time before playing
        await seekAllPlayers(currentTime);

        // Play all available players
        if (leftPlayer && leftReady) {
          await new Promise<void>((resolve) => {
            leftPlayer.playVideo();
            resolve();
          });
        }
        if (rightPlayer && rightReady) {
          await new Promise<void>((resolve) => {
            rightPlayer.playVideo();
            resolve();
          });
        }
      } else {
        console.log('Pausing all videos');
        if (leftPlayer) leftPlayer.pauseVideo();
        if (rightPlayer) rightPlayer.pauseVideo();
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