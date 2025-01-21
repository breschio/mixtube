
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
  const [playbackState, setPlaybackState] = useState({ left: false, right: false });

  const handleReady = (player: 'left' | 'right') => {
    setPlayersReady(prev => ({ ...prev, [player]: true }));
  };

  const handleStateChange = (player: 'left' | 'right', state: { playing: boolean }) => {
    setPlaybackState(prev => ({ ...prev, [player]: state.playing }));
  };

  useEffect(() => {
    if (playersReady.left && playersReady.right) {
      if (playing) {
        leftPlayerRef.current?.getInternalPlayer()?.playVideo();
        rightPlayerRef.current?.getInternalPlayer()?.playVideo();
      } else {
        leftPlayerRef.current?.getInternalPlayer()?.pauseVideo();
        rightPlayerRef.current?.getInternalPlayer()?.pauseVideo();
      }
    }
  }, [playing, playersReady]);

  // If either video is missing, show placeholder
  if (!leftVideoId || !rightVideoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center relative">
        <p className="text-muted-foreground">Load videos in both players to start mixing</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-primary/80 hover:bg-primary text-white rounded-full p-2 transition-colors">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </Card>
    );
  }

  // Calculate opacity based on cross-fader
  const leftOpacity = 1 - crossFaderValue;
  const rightOpacity = crossFaderValue;

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      {/* Left Video Layer */}
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
          onPlay={() => handleStateChange('left', { playing: true })}
          onPause={() => handleStateChange('left', { playing: false })}
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

      {/* Right Video Layer */}
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
          onPlay={() => handleStateChange('right', { playing: true })}
          onPause={() => handleStateChange('right', { playing: false })}
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
