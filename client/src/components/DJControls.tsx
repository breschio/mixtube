import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface DJControlsProps {
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
  leftVideoId?: string | null;
  rightVideoId?: string | null;
}

export default function DJControls({
  crossFader,
  onCrossFaderChange,
  leftVideoId,
  rightVideoId,
}: DJControlsProps) {
  return (
    <div className="bg-card/90 p-4 sm:p-6 rounded-lg shadow-xl border border-primary/20 flex-1 flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="flex justify-between mb-1 sm:mb-2">
          <div className="text-sm font-medium text-primary">Left</div>
          <div className="text-sm font-medium text-primary">Right</div>
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