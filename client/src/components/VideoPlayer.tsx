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
  const playerRef = useRef<ReactPlayer>(null);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  if (!videoId) {
    return (
      <Card className="aspect-video bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Select a video to play</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video">
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
      <div className="p-2">
        <VolumeControl value={volume} onChange={handleVolumeChange} />
      </div>
    </div>
  );
}
