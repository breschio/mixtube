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
    <div className="bg-card/90 px-4 py-2 rounded-lg shadow-xl border border-primary/20 flex-1">
      <div className="flex items-center gap-4 h-10">
        <div className="text-sm font-medium text-primary min-w-[40px]">Left</div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="flex-1 h-full"
        />
        <div className="text-sm font-medium text-primary min-w-[40px]">Right</div>
      </div>
    </div>
  );
}