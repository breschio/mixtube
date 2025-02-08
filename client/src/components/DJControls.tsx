import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface DJControlsProps {
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
  leftVideoId?: string | null;
  rightVideoId?: string | null;
  playing: boolean;
  onPlayPause: () => void;
}

export default function DJControls({
  crossFader,
  onCrossFaderChange,
  leftVideoId,
  rightVideoId,
  playing,
  onPlayPause,
}: DJControlsProps) {
  return (
    <div className="bg-card/90 p-4 sm:p-6 rounded-lg shadow-xl border border-primary/20 flex-1">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="min-w-[80px]"
          onClick={onPlayPause}
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </Button>
        <div className="text-sm font-medium text-primary min-w-[40px]">Left</div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="flex-1"
        />
        <div className="text-sm font-medium text-primary min-w-[40px]">Right</div>
      </div>
    </div>
  );
}