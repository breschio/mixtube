import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface DJControlsProps {
  crossFader: number;
  onCrossFaderChange: (value: number) => void;
  leftVideoId?: string | null;
  rightVideoId?: string | null;
  forceShowTooltip?: boolean;
}

export default function DJControls({
  crossFader,
  onCrossFaderChange,
  leftVideoId,
  rightVideoId,
  forceShowTooltip = false
}: DJControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Calculate percentage and labels
  const getPercentage = () => {
    return Math.abs(Math.round((crossFader - 0.5) * 200));
  };

  // Show label and reset timeout
  const showLabel = () => {
    setIsVisible(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  // Handle slider interaction
  const handleSliderChange = (value: number[]) => {
    showLabel();
    onCrossFaderChange(value[0]);

    // Set timeout to hide label after 3 seconds
    const newTimeoutId = setTimeout(() => {
      if (!forceShowTooltip) {
        setIsVisible(false);
      }
    }, 3000);
    setTimeoutId(newTimeoutId);
  };

  // Effect to handle forceShowTooltip prop
  useEffect(() => {
    if (forceShowTooltip) {
      showLabel();
    } else {
      setIsVisible(false);
    }
  }, [forceShowTooltip]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const percentage = getPercentage();
  const isRightSide = crossFader > 0.5;

  return (
    <div className="flex-1 flex flex-col items-center gap-2 bg-background rounded-lg p-4">
      <div className="flex w-full justify-between items-center mb-2">
        <span className="text-sm font-medium text-primary">Left</span>
        <div
          className={cn(
            "text-sm font-medium px-4 py-1 rounded-md border",
            "transition-opacity duration-200",
            {
              "opacity-100": isVisible || forceShowTooltip,
              "opacity-0": !(isVisible || forceShowTooltip),
              "bg-accent/5": isRightSide,
              "bg-transparent": !isRightSide
            }
          )}
        >
          {percentage}% {isRightSide ? "Right" : "Left"}
        </div>
        <span className="text-sm font-medium text-primary">Right</span>
      </div>
      <Slider
        value={[crossFader]}
        max={1}
        step={0.01}
        onValueChange={handleSliderChange}
        className={cn(
          "flex-1",
          "data-[state=active]:cursor-grabbing",
          "transition-all duration-200"
        )}
        onMouseEnter={showLabel}
        onMouseLeave={() => {
          if (!forceShowTooltip) {
            setIsVisible(false);
          }
        }}
      />
    </div>
  );
}