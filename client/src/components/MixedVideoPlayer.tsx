import { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';

interface MixedVideoPlayerProps {
  leftVideo: { id: string } | null;
  rightVideo: { id: string } | null;
  crossFader: number;
  playing: boolean;
  volumes: { left: number; right: number };
}

export default function MixedVideoPlayer({ 
  leftVideo, 
  rightVideo, 
  crossFader,
  playing,
  volumes
}: MixedVideoPlayerProps) {
  const leftPlayerRef = useRef<ReactPlayer>(null);
  const rightPlayerRef = useRef<ReactPlayer>(null);
  const [playersReady, setPlayersReady] = useState({ left: false, right: false });

  const handleReady = (player: 'left' | 'right') => {
    setPlayersReady(prev => ({ ...prev, [player]: true }));
  };

  const leftVolume = volumes.left * (1 - crossFader);
  const rightVolume = volumes.right * crossFader;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        {leftVideo && (
          <ReactPlayer
            ref={leftPlayerRef}
            url={`https://www.youtube.com/watch?v=${leftVideo.id}`}
            width="100%"
            height="100%"
            playing={playing}
            volume={leftVolume}
            onReady={() => handleReady('left')}
            config={{
              youtube: {
                playerVars: {
                  controls: 0,
                  modestbranding: 1,
                  playsinline: 1
                }
              }
            }}
          />
        )}
      </div>
      <div className="absolute inset-0">
        {rightVideo && (
          <ReactPlayer
            ref={rightPlayerRef}
            url={`https://www.youtube.com/watch?v=${rightVideo.id}`}
            width="100%"
            height="100%"
            playing={playing}
            volume={rightVolume}
            onReady={() => handleReady('right')}
            config={{
              youtube: {
                playerVars: {
                  controls: 0,
                  modestbranding: 1,
                  playsinline: 1
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}