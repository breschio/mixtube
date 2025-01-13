import { useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Card } from '@/components/ui/card';
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  side: 'left' | 'right';
  volume: number;
  playing: boolean;
  onVolumeChange: (value: number) => void;
}

export default function VideoPlayer({ 
  videoId, 
  side,
  volume,
  playing,
  onVolumeChange,
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
    <div className="space-y-4">
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
      <div className="flex items-center gap-4 px-2 pb-8">
        <Volume2 className="h-4 w-4 text-primary/80" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onVolumeChange(value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}