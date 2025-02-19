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
  // Calculate percentage: -100 to 100, with 0 at center (0.5)
  const percentage = Math.round((crossFader - 0.5) * 200);

  return (
    <div className="flex items-center gap-4 flex-1 pt-1">
      <div className="text-sm font-medium text-primary min-w-[40px]">Left</div>
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-primary">{percentage}%</div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="flex-1"
        />
      </div>
      <div className="text-sm font-medium text-primary min-w-[40px]">Right</div>
    </div>
  );
}