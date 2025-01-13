import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface DJControlsProps {
  onPlayAll: () => void;
  onPauseAll: () => void;
  isPlaying: boolean;
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
}

export default function DJControls({
  onPlayAll,
  onPauseAll,
  isPlaying,
  crossFader,
  onCrossFaderChange,
}: DJControlsProps) {
  return (
    <div className="bg-card/90 p-8 rounded-lg shadow-xl border border-primary/20 flex-1 flex flex-col justify-between">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary tracking-tighter">
          mixtube
        </h1>
      </div>

      {/* Cross-fader Section */}
      <div className="relative flex-1 flex flex-col justify-center">
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

      {/* Play/Pause Button */}
      <Button
        size="lg"
        variant="default"
        onClick={isPlaying ? onPauseAll : onPlayAll}
        className={cn(
          "w-full h-16 text-lg font-bold transition-all duration-300 hover:scale-[1.02] mt-8",
          !isPlaying && "animate-slow-pulse",
          isPlaying && "bg-primary/90 hover:bg-primary"
        )}
      >
        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
      </Button>
    </div>
  );
}