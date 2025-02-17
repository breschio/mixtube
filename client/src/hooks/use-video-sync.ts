import { useState, useEffect, useRef } from 'react';
import type ReactPlayer from 'react-player/youtube';

interface VideoSyncState {
  leftReady: boolean;
  rightReady: boolean;
  leftState: number;
  rightState: number;
  currentTime: number;
}

export function useVideoSync() {
  const [syncState, setSyncState] = useState<VideoSyncState>({
    leftReady: false,
    rightReady: false,
    leftState: -1,
    rightState: -1,
    currentTime: 0
  });

  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);
  const lastSyncTime = useRef<number>(0);

  const handleStateChange = (player: 'left' | 'right', state: number) => {
    console.log(`${player} player state changed to:`, state);
    setSyncState(prev => ({
      ...prev,
      [`${player}State`]: state
    }));

    // Update current time when either player changes state
    const currentPlayer = player === 'left' ? leftPlayerRef.current : rightPlayerRef.current;
    if (currentPlayer) {
      const time = currentPlayer.getCurrentTime();
      if (time !== undefined) {
        setSyncState(prev => ({
          ...prev,
          currentTime: time
        }));
      }
    }
  };

  const handleReady = (player: 'left' | 'right') => {
    console.log(`${player} player ready`);
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));

    // When a player becomes ready, sync it to the current time
    const currentTime = syncState.currentTime;
    if (currentTime > 0) {
      const playerRef = player === 'left' ? leftPlayerRef.current : rightPlayerRef.current;
      if (playerRef?.seekTo) {
        playerRef.seekTo(currentTime, 'seconds');
      }
    }
  };

  const seekAllPlayers = async (time: number) => {
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();
    const now = Date.now();

    // Prevent rapid re-seeks
    if (now - lastSyncTime.current < 500) {
      return;
    }
    lastSyncTime.current = now;

    console.log('Syncing all players to time:', time);

    try {
      if (leftPlayer?.seekTo) {
        await leftPlayer.seekTo(time);
      }
      if (rightPlayer?.seekTo) {
        await rightPlayer.seekTo(time);
      }

      setSyncState(prev => ({
        ...prev,
        currentTime: time
      }));
    } catch (error) {
      console.error('Error seeking players:', error);
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
        const currentTime = syncState.currentTime || leftPlayer?.getCurrentTime() || rightPlayer?.getCurrentTime() || 0;

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

  // Add a function to handle PiP position changes
  const handlePiPSwitch = async () => {
    const currentTime = syncState.currentTime;
    if (currentTime > 0) {
      await seekAllPlayers(currentTime);
    }
  };

  return {
    syncState,
    leftPlayerRef,
    rightPlayerRef,
    handleStateChange,
    handleReady,
    syncPlay,
    handlePiPSwitch
  };
}