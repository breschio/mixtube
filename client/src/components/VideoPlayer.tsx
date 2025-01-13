import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import VolumeControl from './VolumeControl';
import { Card, CardContent } from '@/components/ui/card';

interface VideoPlayerProps {
  videoId: string | null;
  side: 'left' | 'right';
}

export default function VideoPlayer({ videoId, side }: VideoPlayerProps) {
  const [volume, setVolume] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setShowControls(true);
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!videoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center transition-colors hover:bg-muted">
        <p className="text-muted-foreground">Select a video to play</p>
      </Card>
    );
  }

  return (
    <div 
      className="space-y-2 relative group"
      onMouseMove={() => {
        setShowControls(true);
        resetControlsTimeout();
      }}
    >
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          controls={true}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
      <div 
        className={`p-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } group-hover:opacity-100`}
      >
        <VolumeControl value={volume} onChange={handleVolumeChange} />
      </div>
    </div>
  );
}