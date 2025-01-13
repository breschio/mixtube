import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface DJControlsProps {
  onPlayAll: () => void;
  onPauseAll: () => void;
  isPlaying: boolean;
  leftVolume: number;
  rightVolume: number;
  onLeftVolumeChange: (value: number) => void;
  onRightVolumeChange: (value: number) => void;
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
}

export default function DJControls({
  onPlayAll,
  onPauseAll,
  isPlaying,
  leftVolume,
  rightVolume,
  onLeftVolumeChange,
  onRightVolumeChange,
  crossFader,
  onCrossFaderChange,
}: DJControlsProps) {
  return (
    <div className="bg-card/90 p-6 rounded-lg shadow-xl border border-primary/20">
      <div className="grid grid-cols-3 gap-8">
        {/* Left Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">LEFT</span>
          </div>
          <Slider
            orientation="vertical"
            value={[leftVolume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => onLeftVolumeChange(value)}
            className="h-32"
          />
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center justify-between">
          <Button
            size="lg"
            variant={isPlaying ? "destructive" : "default"}
            onClick={isPlaying ? onPauseAll : onPlayAll}
            className="w-full mb-4 h-12 transition-all duration-300 hover:scale-[1.02]"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          {/* Cross-fader */}
          <div className="w-full space-y-2">
            <Slider
              value={[crossFader]}
              max={1}
              step={0.01}
              onValueChange={([value]) => onCrossFaderChange(value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-medium text-primary">
              <span>A</span>
              <span>B</span>
            </div>
          </div>
        </div>

        {/* Right Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">RIGHT</span>
          </div>
          <Slider
            orientation="vertical"
            value={[rightVolume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => onRightVolumeChange(value)}
            className="h-32"
          />
        </div>
      </div>
    </div>
  );
}