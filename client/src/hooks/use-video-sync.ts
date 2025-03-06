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
  const retryCount = useRef(0);
  const maxRetries = 3;

  const handleReady = (player: 'left' | 'right') => {
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));
  };

  const attemptPlayback = async (player: any): Promise<void> => {
    try {
      await player.playVideo();
      let attempts = 0;
      // Wait for playback to actually start
      while (attempts < 50 && player.getPlayerState() !== 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (player.getPlayerState() !== 1) {
        throw new Error('Failed to start playback');
      }
    } catch (error) {
      console.error('Playback attempt failed:', error);
      throw error;
    }
  };

  const syncPlay = async (shouldPlay: boolean) => {
    const { leftReady, rightReady } = syncState;
    const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
    const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

    if (!leftPlayer || !rightPlayer) {
      console.error('Players not initialized');
      return;
    }

    if (shouldPlay && (!leftReady || !rightReady)) {
      console.error('Players not ready');
      return;
    }

    try {
      if (shouldPlay) {
        // Reset retry count on new play attempt
        retryCount.current = 0;

        // Ensure both videos are at the same timestamp
        const currentTime = Math.min(
          leftPlayer.getCurrentTime(), 
          rightPlayer.getCurrentTime()
        );

        // Seek both to the same position
        leftPlayer.seekTo(currentTime);
        rightPlayer.seekTo(currentTime);

        // Small delay to ensure seek is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        while (retryCount.current < maxRetries) {
          try {
            // Start both videos simultaneously
            await Promise.all([
              attemptPlayback(leftPlayer),
              attemptPlayback(rightPlayer)
            ]);

            // If successful, unmute the videos
            leftPlayer.unMute();
            rightPlayer.unMute();

            // Successfully started both videos
            return;
          } catch (error) {
            console.error(`Playback attempt ${retryCount.current + 1} failed:`, error);
            retryCount.current++;

            // Pause both before retry
            leftPlayer.pauseVideo();
            rightPlayer.pauseVideo();

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        throw new Error('Failed to start videos after maximum retries');
      } else {
        // For pause, just pause both immediately
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
      // Ensure both are paused on error
      leftPlayer.pauseVideo();
      rightPlayer.pauseVideo();
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