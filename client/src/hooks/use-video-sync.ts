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
  const syncRetryCountRef = useRef<number>(0);
  const MAX_SYNC_RETRIES = 3;

  const handleStateChange = (player: 'left' | 'right', state: number) => {
    setSyncState(prev => ({
      ...prev,
      [`${player}State`]: state,
      currentTime: player === 'left' ? 
        leftPlayerRef.current?.getCurrentTime() || 0 :
        rightPlayerRef.current?.getCurrentTime() || 0
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

    if (Date.now() - lastSyncTime.current < 250) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => seekAllPlayers(time), 250);
      return;
    }
    lastSyncTime.current = Date.now();

    try {
      if (leftPlayer?.seekTo) await leftPlayer.seekTo(time);
      if (rightPlayer?.seekTo) await rightPlayer.seekTo(time);
      setSyncState(prev => ({ ...prev, currentTime: time }));
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

    if (!leftPlayer && !rightPlayer) return;

    try {
      if (shouldPlay) {
        // Ensure both players are ready
        if (!leftReady || !rightReady) {
          console.log('Waiting for players to be ready');
          return;
        }

        // Force seek to start for initial playback
        if (!syncState.currentTime) {
          await seekAllPlayers(0);
        }

        // Start both players simultaneously
        const promises = [];
        if (leftPlayer) promises.push(leftPlayer.playVideo());
        if (rightPlayer) promises.push(rightPlayer.playVideo());

        await Promise.all(promises);

        // Quick verification of play state
        setTimeout(() => {
          if (leftPlayer && leftPlayer.getPlayerState() !== 1) leftPlayer.playVideo();
          if (rightPlayer && rightPlayer.getPlayerState() !== 1) rightPlayer.playVideo();
        }, 100);
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