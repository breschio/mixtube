
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DJControlsProps {
  playing: boolean;
  onPlayPause: () => void;
  crossFaderValue: number;
  onCrossFaderChange: (value: number[]) => void;
}

export default function DJControls({ playing, onPlayPause, crossFaderValue, onCrossFaderChange }: DJControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onPlayPause}
        className="w-12 h-12"
      >
        {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
      <Slider
        defaultValue={[0.5]}
        max={1}
        step={0.01}
        value={[crossFaderValue]}
        onValueChange={onCrossFaderChange}
        className="flex-1"
      />
    </div>
  );
}

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-primary/20 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" className="shrink-0">
            <Music className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Slider
              value={[crossFader]}
              max={1}
              step={0.01}
              onValueChange={([value]) => onCrossFaderChange(value)}
              className="w-full h-4"
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={isPlaying ? onPauseAll : onPlayAll}
            className={cn(
              "shrink-0 transition-colors",
              !isPlaying && "text-primary",
              isPlaying && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/90 p-4 sm:p-6 rounded-lg shadow-xl border border-primary/20 flex-1 flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="flex justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-bold text-primary">LEFT</span>
          <span className="text-xs sm:text-sm font-bold text-primary">RIGHT</span>
        </div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="w-full h-6 sm:h-8"
        />
      </div>
    </div>
  );
}
