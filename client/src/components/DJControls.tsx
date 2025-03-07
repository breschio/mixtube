import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Video, Volume2 } from "lucide-react";

interface DJControlsProps {
  crossFader: number;
  audioFader: number;
  onCrossFaderChange: (value: number) => void;
  onAudioFaderChange: (value: number) => void;
  leftVideoId?: string | null;
  rightVideoId?: string | null;
  forceShowTooltip?: boolean;
}

export default function DJControls({
  crossFader,
  audioFader,
  onCrossFaderChange,
  onAudioFaderChange,
  leftVideoId,
  rightVideoId,
  forceShowTooltip = false
}: DJControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Calculate percentage for both faders
  const getPercentage = (value: number) => {
    return Math.abs(Math.round((value - 0.5) * 200));
  };

  // Show label and reset timeout
  const showLabel = () => {
    setIsVisible(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  // Handle slider interactions
  const handleSliderChange = (type: 'video' | 'audio', value: number[]) => {
    showLabel();
    if (type === 'video') {
      onCrossFaderChange(value[0]);
    } else {
      onAudioFaderChange(value[0]);
    }

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

  const videoPercentage = getPercentage(crossFader);
  const audioPercentage = getPercentage(audioFader);
  const isRightVideo = crossFader > 0.5;
  const isRightAudio = audioFader > 0.5;

  return (
    <div className="flex-1 grid grid-cols-2 gap-4 bg-background rounded-lg p-4">
      {/* Video Opacity Slider */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 min-w-[80px]">
            <Video className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Video</span>
          </div>
          <div className="flex-1">
            <div className="flex w-full justify-between items-center mb-2">
              <span className="text-sm font-medium text-primary">L</span>
              <div
                className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-md border",
                  "transition-opacity duration-200",
                  {
                    "opacity-100": isVisible || forceShowTooltip,
                    "opacity-0": !(isVisible || forceShowTooltip),
                    "bg-accent/5": isRightVideo,
                    "bg-transparent": !isRightVideo
                  }
                )}
              >
                {videoPercentage}% {isRightVideo ? "R" : "L"}
              </div>
              <span className="text-sm font-medium text-primary">R</span>
            </div>
            <Slider
              value={[crossFader]}
              max={1}
              step={0.01}
              onValueChange={(value) => handleSliderChange('video', value)}
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
        </div>
      </div>

      {/* Audio Level Slider */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 min-w-[80px]">
            <Volume2 className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Audio</span>
          </div>
          <div className="flex-1">
            <div className="flex w-full justify-between items-center mb-2">
              <span className="text-sm font-medium text-primary">L</span>
              <div
                className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-md border",
                  "transition-opacity duration-200",
                  {
                    "opacity-100": isVisible || forceShowTooltip,
                    "opacity-0": !(isVisible || forceShowTooltip),
                    "bg-accent/5": isRightAudio,
                    "bg-transparent": !isRightAudio
                  }
                )}
              >
                {audioPercentage}% {isRightAudio ? "R" : "L"}
              </div>
              <span className="text-sm font-medium text-primary">R</span>
            </div>
            <Slider
              value={[audioFader]}
              max={1}
              step={0.01}
              onValueChange={(value) => handleSliderChange('audio', value)}
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
        </div>
      </div>
    </div>
  );
}