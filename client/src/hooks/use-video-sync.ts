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

  const handleReady = (player: 'left' | 'right') => {
    setSyncState(prev => ({
      ...prev,
      [`${player}Ready`]: true
    }));
  };

  // Track if we're on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    // Detect if we're on a mobile device
    const mobileCheck = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobileDevice(mobileCheck());
  }, []);

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
        
        // Check if this is a mobile device which might have autoplay restrictions
        if (isMobileDevice) {
          console.log('Mobile device detected - using special sync strategy');

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

        if (isMobileDevice) {
          // On mobile, we use a different approach - play one video and mute another
          // This works better with mobile autoplay policies
          try {
            // First try to play both with a slight delay between them
            leftPlayer.playVideo();
            
            // Check if the first video started playing
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                if (leftPlayer.getPlayerState() !== 1) {
                  reject(new Error('Left video failed to play'));
                } else {
                  resolve();
                }
              }, 1000);
              
              const checkInterval = setInterval(() => {
                if (leftPlayer.getPlayerState() === 1) {
                  clearTimeout(timeout);
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
            });
            
            // If first video plays, try starting the second
            rightPlayer.playVideo();
            
            console.log('Mobile sync strategy: both videos attempted to play');
          } catch (error) {
            console.warn('Mobile autoplay restriction detected', error);
            // Fallback: mute one video and play the other
            // This is necessary because most mobile browsers only allow one video to play at a time
            leftPlayer.mute();
            rightPlayer.unMute();
            leftPlayer.playVideo();
            rightPlayer.playVideo();
            console.log('Mobile sync fallback: one video muted to allow both to play');
          }
        } else {
          // Desktop strategy - play both videos simultaneously
          await Promise.all([
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
        }
      } else {
        leftPlayer.pauseVideo();
        rightPlayer.pauseVideo();
      }
    } catch (error) {
      console.error('Error during video sync:', error);
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