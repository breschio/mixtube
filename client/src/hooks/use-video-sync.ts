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
  const initialPlayAttemptRef = useRef<boolean>(false);

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
    // but only if we're not in the initial play attempt
    if (!initialPlayAttemptRef.current) {
      const currentTime = syncState.currentTime;
      if (currentTime > 0) {
        const playerRef = player === 'left' ? leftPlayerRef.current : rightPlayerRef.current;
        if (playerRef?.seekTo) {
          playerRef.seekTo(currentTime, 'seconds');
        }
      }
    }
  };

  const seekAllPlayers = async (time: number) => {
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();
    const now = Date.now();

    // Prevent rapid re-seeks
    if (now - lastSyncTime.current < 250) {
      // Schedule a sync attempt for later
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        seekAllPlayers(time);
      }, 250);
      return;
    }
    lastSyncTime.current = now;

    console.log('Syncing all players to time:', time);

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
        }

        // Wait for both players to be ready if they exist
        const readyPromises = [];
        if (leftPlayer && !leftReady) {
          readyPromises.push(new Promise(resolve => {
            const checkReady = () => {
              if (syncState.leftReady) resolve(true);
              else setTimeout(checkReady, 100);
            };
            checkReady();
          }));
        }
        if (rightPlayer && !rightReady) {
          readyPromises.push(new Promise(resolve => {
            const checkReady = () => {
              if (syncState.rightReady) resolve(true);
              else setTimeout(checkReady, 100);
            };
            checkReady();
          }));
        }

        await Promise.all(readyPromises);

        // Sync all players to the same time before playing
        await seekAllPlayers(syncState.currentTime);

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
        initialPlayAttemptRef.current = false;
        if (leftPlayer) leftPlayer.pauseVideo();
        if (rightPlayer) rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
    }
  };

  // Handle PiP position changes with forced sync
  const handlePiPSwitch = async () => {
    // Clear any pending sync timeouts
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const currentTime = syncState.currentTime;
    if (currentTime > 0) {
      // Force immediate sync regardless of the time threshold
      lastSyncTime.current = 0;
      await seekAllPlayers(currentTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

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