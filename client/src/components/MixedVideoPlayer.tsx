import { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import VideoOverlay from './VideoOverlay';

interface MixedVideoPlayerProps {
  leftVideoId: string | null;
  rightVideoId: string | null;
  crossFaderValue: number;
  playing: boolean;
  onPlayPause: () => void;  
}

export default function MixedVideoPlayer({ 
  leftVideoId, 
  rightVideoId, 
  crossFaderValue,
  playing: isPlaying,
  onPlayPause
}: MixedVideoPlayerProps) {
  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);
  const [playersReady, setPlayersReady] = useState({ left: false, right: false });
  const [playing, setPlaying] = useState(isPlaying);

  const handleReady = (player: 'left' | 'right') => {
    setPlayersReady(prev => ({ ...prev, [player]: true }));
  };

  // Sync players when play state changes
  useEffect(() => {
    const syncPlayers = async () => {
      if (playersReady.left && playersReady.right) {
        const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
        const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

        if (leftPlayer && rightPlayer) {
          if (playing) {
            try {
              // Start both videos simultaneously
              await Promise.all([
                leftPlayer.playVideo(),
                rightPlayer.playVideo()
              ]);
            } catch (error) {
              console.error('Error playing videos:', error);
            }
          } else {
            try {
              // Pause both videos simultaneously
              await Promise.all([
                leftPlayer.pauseVideo(),
                rightPlayer.pauseVideo()
              ]);
            } catch (error) {
              console.error('Error pausing videos:', error);
            }
          }
        }
      }
    };

    syncPlayers();
  }, [playing, playersReady]);

  // Update local playing state when prop changes
  useEffect(() => {
    setPlaying(isPlaying);
  }, [isPlaying]);

  if (!leftVideoId || !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center relative">
        <p className="text-muted-foreground">Load videos in both players to start mixing</p>
      </Card>
    );
  }

  const leftOpacity = 1 - crossFaderValue;
  const rightOpacity = crossFaderValue;

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: leftOpacity }}>
        <ReactPlayer
          ref={leftPlayerRef}
          url={`https://www.youtube.com/watch?v=${leftVideoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={Math.max(0, 1 - crossFaderValue)}
          muted={crossFaderValue === 1}
          playIcon={<div />}
          onReady={() => handleReady('left')}
          config={{
            playerVars: {
              controls: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              origin: window.location.origin,
              enablejsapi: 1
            }
          }}
        />
      </div>

      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: rightOpacity }}>
        <ReactPlayer
          ref={rightPlayerRef}
          url={`https://www.youtube.com/watch?v=${rightVideoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={Math.max(0, crossFaderValue)}
          muted={crossFaderValue === 0}
          playIcon={<div />}
          onReady={() => handleReady('right')}
          config={{
            playerVars: {
              controls: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              origin: window.location.origin,
              enablejsapi: 1
            }
          }}
        />
      </div>

      <VideoOverlay isPlaying={playing} onPlayPause={onPlayPause} />
    </div>
  );
}