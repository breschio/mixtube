import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Video, Volume2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DJControlsProps {
  crossFader: number;
  audioFader: number;
  onCrossFaderChange: (value: number) => void;
  onAudioFaderChange: (value: number) => void;
  leftVideoId?: string | null;
  rightVideoId?: string | null;
  leftVideoTitle?: string;
  rightVideoTitle?: string;
  leftChannelTitle?: string;
  rightChannelTitle?: string;
  forceShowTooltip?: boolean;
  mixTemplates?: React.ReactNode;
}

export default function DJControls({
  crossFader,
  audioFader,
  onCrossFaderChange,
  onAudioFaderChange,
  leftVideoId,
  rightVideoId,
  leftVideoTitle,
  rightVideoTitle,
  leftChannelTitle,
  rightChannelTitle,
  forceShowTooltip = false,
  mixTemplates
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

  const renderVideoThumbnail = (videoId: string | null | undefined, title?: string, channelTitle?: string) => {
    if (!videoId) return null;
    return (
      <div className="flex flex-col gap-2">
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative w-24 aspect-video rounded-md overflow-hidden group"
        >
          <img 
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
        </a>
        {title && (
          <div className="flex flex-col gap-0.5">
            <a 
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground hover:text-primary line-clamp-2 max-w-[12rem] transition-colors font-medium"
              title={title}
            >
              {title}
            </a>
            {channelTitle && (
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(channelTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                {channelTitle}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Mix Templates at the top */}
      {mixTemplates}

      {/* Main controls container with three columns */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-8 bg-background rounded-lg p-4">
        {/* Left video */}
        <div className="hidden md:flex items-start"> {/* Added hidden class for mobile */}
          {renderVideoThumbnail(leftVideoId, leftVideoTitle, leftChannelTitle)}
        </div>

        {/* Center sliders */}
        <div className="flex flex-col gap-6">
          {/* Video Opacity Slider */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[80px]">
                <Video className="h-6 w-6 text-muted-foreground mb-1" />
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
          <div className="w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="flex flex-col items-center min-w-[80px]">
                <Volume2 className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-sm font-medium text-muted-foreground">Audio</span>
              </div>
              <div className="flex-1 w-full">
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
                    "w-full",
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

        {/* Right video */}
        <div className="hidden md:flex items-start justify-end"> {/* Added hidden class for mobile */}
          {renderVideoThumbnail(rightVideoId, rightVideoTitle, rightChannelTitle)}
        </div>
      </div>
    </div>
  );
}