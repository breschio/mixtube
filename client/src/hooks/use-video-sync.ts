import { useState, useEffect, useRef } from 'react';
import type ReactPlayer from 'react-player/youtube';
import { useMobile } from './use-mobile';

interface VideoSyncState {
  leftReady: boolean;
  rightReady: boolean;
  leftState: number;
  rightState: number;
  currentTime: number;
}

export function useVideoSync() {
  const isMobile = useMobile();
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
  const syncRetryCountRef = useRef<number>(0);
  const MAX_SYNC_RETRIES = 3;
  const MOBILE_PLAY_DELAY = 250; // Reduced from 500ms to 250ms for better sync

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

      syncRetryCountRef.current = 0;
    } catch (error) {
      console.error('Error seeking players:', error);
      if (syncRetryCountRef.current < MAX_SYNC_RETRIES) {
        syncRetryCountRef.current++;
        setTimeout(() => seekAllPlayers(time), 500);
      }
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

        // Handle both mobile and desktop playback similarly
        if (leftReady && rightReady) {
          // Start both players with a minimal delay
          const playPromises = [];

          if (leftPlayer) {
            playPromises.push(new Promise<void>((resolve) => {
              leftPlayer.playVideo();
              resolve();
            }));
          }

          if (rightPlayer) {
            playPromises.push(new Promise<void>((resolve) => {
              rightPlayer.playVideo();
              resolve();
            }));
          }

          await Promise.all(playPromises);

          // Additional sync check after delay
          setTimeout(() => {
            if (leftPlayer) {
              const leftState = leftPlayer.getPlayerState();
              if (leftState !== 1) { // 1 is playing
                console.log('Re-syncing left player');
                leftPlayer.playVideo();
              }
            }
            if (rightPlayer) {
              const rightState = rightPlayer.getPlayerState();
              if (rightState !== 1) {
                console.log('Re-syncing right player');
                rightPlayer.playVideo();
              }
            }
          }, isMobile ? MOBILE_PLAY_DELAY : 100);
        } else {
          console.log('Waiting for both players to be ready');
          return;
        }
      } else {
        console.log('Pausing all videos');
        initialPlayAttemptRef.current = false;
        if (leftPlayer) leftPlayer.pauseVideo();
        if (rightPlayer) rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      // Reset play state on error
      if (leftPlayer) leftPlayer.pauseVideo();
      if (rightPlayer) rightPlayer.pauseVideo();
      throw error;
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
  };
}