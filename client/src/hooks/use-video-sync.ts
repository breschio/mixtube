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
  const playerCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const handleReady = (player: 'left' | 'right') => {
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));
  };

  const ensurePlayersReady = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkPlayers = () => {
        const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
        const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

        if (leftPlayer && rightPlayer) {
          const leftState = leftPlayer.getPlayerState();
          const rightState = rightPlayer.getPlayerState();

          // Check if both players are in a valid state (-1 = unstarted, 5 = video cued)
          if ((leftState === -1 || leftState === 5) && (rightState === -1 || rightState === 5)) {
            if (playerCheckInterval.current) {
              clearInterval(playerCheckInterval.current);
            }
            resolve(true);
            return;
          }
        }
      };

      // Check immediately
      checkPlayers();

      // Also set up an interval to check repeatedly
      if (playerCheckInterval.current) {
        clearInterval(playerCheckInterval.current);
      }
      playerCheckInterval.current = setInterval(checkPlayers, 100);

      // Timeout after 2 seconds
      setTimeout(() => {
        if (playerCheckInterval.current) {
          clearInterval(playerCheckInterval.current);
        }
        resolve(false);
      }, 2000);
    });
  };

  const handlePlayPause = async (shouldPlay: boolean) => {
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

        // Ensure both players are truly ready
        const playersReady = await ensurePlayersReady();
        if (!playersReady) {
          console.log('Players not ready after timeout');
          return;
        }

        // Play left video first
        await leftPlayer.playVideo();

        // Then immediately play right video
        await rightPlayer.playVideo();

        // Double check both are playing
        setTimeout(() => {
          if (leftPlayer.getPlayerState() !== 1) leftPlayer.playVideo();
          if (rightPlayer.getPlayerState() !== 1) rightPlayer.playVideo();
        }, 100);
      } else {
        // Pause both videos
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      // On error, try to pause both
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