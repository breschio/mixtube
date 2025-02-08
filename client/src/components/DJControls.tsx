import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-primary/20 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Slider
              value={[crossFader]}
              max={1}
              step={0.01}
              onValueChange={([value]) => onCrossFaderChange(value)}
              className="w-full h-4"
            />
          </div>
        </div>
      </div>
    );
  }

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