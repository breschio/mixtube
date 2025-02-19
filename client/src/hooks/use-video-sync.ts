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
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialPlayAttemptRef = useRef<boolean>(false);

  // Stricter sync tolerance for better audio sync
  const syncToleranceMs = 50;

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

  const checkSyncDeviation = () => {
    const leftTime = leftPlayerRef.current?.getCurrentTime() || 0;
    const rightTime = rightPlayerRef.current?.getCurrentTime() || 0;
    return Math.abs(leftTime - rightTime) * 1000 > syncToleranceMs;
  };

  const seekAllPlayers = async (time: number) => {
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();
    const now = Date.now();

    // Prevent rapid re-seeks
    if (now - lastSyncTime.current < syncToleranceMs) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        seekAllPlayers(time);
      }, syncToleranceMs);
      return;
    }
    lastSyncTime.current = now;

    try {
      const seekPromises = [];

      if (leftPlayer?.seekTo) {
        seekPromises.push(leftPlayer.seekTo(time));
      }
      if (rightPlayer?.seekTo) {
        seekPromises.push(rightPlayer.seekTo(time));
      }

      await Promise.all(seekPromises);

      setSyncState(prev => ({
        ...prev,
        currentTime: time
      }));
    } catch (error) {
      console.error('Error seeking players:', error);
    }
  };

  const startSyncInterval = () => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Start a new sync check interval
    syncIntervalRef.current = setInterval(() => {
      if (checkSyncDeviation()) {
        const leftTime = leftPlayerRef.current?.getCurrentTime() || 0;
        seekAllPlayers(leftTime);
      }
    }, 1000);
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
        initialPlayAttemptRef.current = true;

        // Force seek to start for initial playback
        if (!syncState.currentTime) {
          await seekAllPlayers(0);
        } else if (checkSyncDeviation()) {
          await seekAllPlayers(syncState.currentTime);
        }

        // Wait for both players to be ready if they exist
        if (leftPlayer && rightPlayer) {
          await Promise.all([
            new Promise<void>(resolve => {
              const checkReady = () => {
                if (syncState.leftReady) resolve();
                else setTimeout(checkReady, syncToleranceMs);
              };
              checkReady();
            }),
            new Promise<void>(resolve => {
              const checkReady = () => {
                if (syncState.rightReady) resolve();
                else setTimeout(checkReady, syncToleranceMs);
              };
              checkReady();
            })
          ]);
        }

        // Play all available players
        const playPromises = [];
        if (leftPlayer && leftReady) {
          playPromises.push(new Promise<void>((resolve) => {
            leftPlayer.playVideo();
            resolve();
          }));
        }
        if (rightPlayer && rightReady) {
          playPromises.push(new Promise<void>((resolve) => {
            rightPlayer.playVideo();
            resolve();
          }));
        }

        await Promise.all(playPromises);
        startSyncInterval();
      } else {
        console.log('Pausing all videos');
        initialPlayAttemptRef.current = false;

        // Clear sync interval when pausing
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }

        if (leftPlayer) leftPlayer.pauseVideo();
        if (rightPlayer) rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    syncState,
    leftPlayerRef,
    rightPlayerRef,
    handleStateChange,
    handleReady,
    syncPlay
  };
}