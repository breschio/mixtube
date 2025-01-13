import { useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  videoId: string | null;
  side: 'left' | 'right';
  volume: number;
  playing: boolean;
}

export default function VideoPlayer({ 
  videoId, 
  side,
  volume,
  playing,
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);

  if (!videoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center transition-colors hover:bg-muted">
        <p className="text-muted-foreground">Select a video to play</p>
      </Card>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={`https://www.youtube.com/watch?v=${videoId}`}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        controls={true}
      />
    </div>
  );
}