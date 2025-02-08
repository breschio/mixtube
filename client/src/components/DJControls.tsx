import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
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
    <Card className={cn(
      "p-4 sm:p-6",
      "transition-all duration-200",
      "border border-border/50"
    )}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Left</div>
          <div>Right</div>
        </div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={([value]) => onCrossFaderChange(value)}
          className="w-full h-6 sm:h-8"
        />
      </div>
    </Card>
  );
}