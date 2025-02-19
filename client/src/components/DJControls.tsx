import { useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Calculate percentage and label
  const getPercentageLabel = () => {
    const percentage = Math.abs(Math.round((crossFader - 0.5) * 200));
    if (percentage === 0) return "Center";
    return crossFader < 0.5 
      ? `${percentage}% Left` 
      : `${percentage}% Right`;
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
      setIsVisible(false);
    }, 3000);
    setTimeoutId(newTimeoutId);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div 
      className="flex items-center gap-4 flex-1 pt-1"
      onMouseEnter={showLabel}
      onMouseLeave={() => {
        // Set timeout to hide label after 3 seconds
        const newTimeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        setTimeoutId(newTimeoutId);
      }}
    >
      <div className="text-sm font-medium text-primary min-w-[40px]">Left</div>
      <div className="flex-1 flex flex-col items-center gap-2">
        <div 
          className={cn(
            "text-sm font-medium text-primary transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {getPercentageLabel()}
        </div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
      </div>
      <div className="text-sm font-medium text-primary min-w-[40px]">Right</div>
    </div>
  );
}