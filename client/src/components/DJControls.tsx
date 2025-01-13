import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

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
    <div className="bg-card/90 p-8 rounded-lg shadow-xl border border-primary/20">
      {/* Volume Controls at the top */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Volume */}
        <div className="space-y-2">
          <Slider
            orientation="vertical"
            value={[leftVolume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => onLeftVolumeChange(value)}
            className="h-40"
          />
        </div>

        {/* Right Volume */}
        <div className="space-y-2">
          <Slider
            orientation="vertical"
            value={[rightVolume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => onRightVolumeChange(value)}
            className="h-40"
          />
        </div>
      </div>

      {/* Play/Pause Button */}
      <Button
        size="lg"
        variant={isPlaying ? "destructive" : "default"}
        onClick={isPlaying ? onPauseAll : onPlayAll}
        className="w-full mb-8 h-16 text-lg font-bold transition-all duration-300 hover:scale-[1.02]"
      >
        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
      </Button>

      {/* Cross-fader Section */}
      <div className="relative pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold text-primary">LEFT</span>
          <span className="text-sm font-bold text-primary">RIGHT</span>
        </div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="w-full h-8"
        />
      </div>
    </div>
  );
}