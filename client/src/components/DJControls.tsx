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

  const percentage = getPercentage();
  const isRightSide = crossFader > 0.5;

  return (
    <div 
      className="flex items-center gap-4 flex-1 pt-1"
      onMouseEnter={showLabel}
      onMouseLeave={() => {
        const newTimeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        setTimeoutId(newTimeoutId);
      }}
    >
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex w-full justify-between items-center mb-2">
          <span className="text-sm text-primary">Left</span>
          <div 
            className={cn(
              "text-sm font-medium text-primary px-4 py-1 rounded-md border border-primary/20",
              isVisible ? "opacity-100" : "opacity-0",
              isRightSide ? "bg-primary/5" : "bg-transparent"
            )}
          >
            {percentage}% {isRightSide ? 'Right' : 'Left'}
          </div>
          <span className="text-sm text-primary">Right</span>
        </div>
        <Slider
          value={[crossFader]}
          max={1}
          step={0.01}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
      </div>
    </div>
  );
}