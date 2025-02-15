import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  PauseCircle,
  FastForward,
  Rewind,
  Music2,
  Music4
} from "lucide-react";

interface MixControlsProps {
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
  onSpeedChange: (player: 'left' | 'right', speed: number) => void;
  leftSpeed: number;
  rightSpeed: number;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function MixControls({
  crossFader,
  onCrossFaderChange,
  onSpeedChange,
  leftSpeed,
  rightSpeed,
  isPlaying,
  onPlayPause
}: MixControlsProps) {
  const leftOpacity = 1 - crossFader;
  const rightOpacity = crossFader;

  return (
    <div className="space-y-8 p-4 bg-background/80 backdrop-blur-sm rounded-lg border">
      {/* Crossfader visualization */}
      <div className="relative h-24 bg-muted rounded-lg overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-200 border-r-2 border-primary"
          style={{ width: `${(1 - crossFader) * 100}%` }}
        >
          <div className="flex items-center justify-center h-full">
            <Music2 
              className="w-8 h-8 text-primary animate-pulse"
              style={{ opacity: leftOpacity }}
            />
          </div>
        </div>
        <div 
          className="absolute inset-y-0 right-0 bg-primary/20 transition-all duration-200 border-l-2 border-primary"
          style={{ width: `${crossFader * 100}%` }}
        >
          <div className="flex items-center justify-center h-full">
            <Music4 
              className="w-8 h-8 text-primary animate-pulse"
              style={{ opacity: rightOpacity }}
            />
          </div>
        </div>
        
        {/* Crossfader control */}
        <div className="absolute bottom-4 left-4 right-4">
          <Slider
            value={[crossFader]}
            max={1}
            step={0.01}
            onValueChange={([value]) => onCrossFaderChange(value)}
            className="z-10"
          />
        </div>
      </div>

      {/* Speed controls */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Left Speed</span>
            <span className="text-sm text-muted-foreground">{leftSpeed}x</span>
          </div>
          <Slider
            value={[leftSpeed]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => onSpeedChange('left', value)}
          />
          <div className="flex justify-between mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange('left', Math.max(0.5, leftSpeed - 0.1))}
            >
              <Rewind className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange('left', Math.min(2, leftSpeed + 0.1))}
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Right Speed</span>
            <span className="text-sm text-muted-foreground">{rightSpeed}x</span>
          </div>
          <Slider
            value={[rightSpeed]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => onSpeedChange('right', value)}
          />
          <div className="flex justify-between mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange('right', Math.max(0.5, rightSpeed - 0.1))}
            >
              <Rewind className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange('right', Math.min(2, rightSpeed + 0.1))}
            >
              <FastForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Play/Pause control */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="lg"
          className="w-24"
          onClick={onPlayPause}
        >
          {isPlaying ? (
            <PauseCircle className="w-6 h-6" />
          ) : (
            <PlayCircle className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
