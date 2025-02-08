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
    <div className="flex items-center gap-4 flex-1 pt-1.5">
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
  );
}