import { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';

interface MixedVideoPlayerProps {
  leftVideoId: string | null;
  rightVideoId: string | null;
  crossFaderValue: number;
  playing: boolean;
}

export default function MixedVideoPlayer({ 
  leftVideoId, 
  rightVideoId, 
  crossFaderValue,
  playing
}: MixedVideoPlayerProps) {
  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);
  const [playersReady, setPlayersReady] = useState({ left: false, right: false });

  const handleReady = (player: 'left' | 'right') => {
    setPlayersReady(prev => ({ ...prev, [player]: true }));
    const currentPlayer = player === 'left' ? leftPlayerRef.current?.getInternalPlayer() : rightPlayerRef.current?.getInternalPlayer();
    if (currentPlayer && playing) {
      currentPlayer.playVideo();
    }
  };

  useEffect(() => {
    const syncPlayers = async () => {
      if (playersReady.left && playersReady.right) {
        const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
        const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

        if (leftPlayer && rightPlayer) {
          if (playing) {
            try {
              await Promise.all([
                leftPlayer.playVideo(),
                rightPlayer.playVideo()
              ]);
            } catch (error) {
              console.error('Error syncing videos:', error);
            }
          } else {
            try {
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

  if (!leftVideoId || !rightVideoId) {
    return (
      <Card className="aspect-video flex items-center justify-center">
        <p className="text-muted-foreground">Load videos in both players to start mixing</p>
      </Card>
    );
  }

  const leftOpacity = 1 - crossFaderValue;
  const rightOpacity = crossFaderValue;

  return (
    <div className="aspect-video bg-background rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 transition-opacity duration-100" style={{ opacity: leftOpacity }}>
        <ReactPlayer
          ref={leftPlayerRef}
          url={`https://www.youtube.com/watch?v=${leftVideoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={Math.max(0, 1 - crossFaderValue)}
          muted={crossFaderValue === 1}
          playIcon={false}
          onReady={() => handleReady('left')}
          config={{
            youtube: {
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
          playIcon={false}
          onReady={() => handleReady('right')}
          config={{
            youtube: {
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
            }
          }}
        />
      </div>
    </div>
  );
}