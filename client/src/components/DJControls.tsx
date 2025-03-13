import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/theme';
import { componentStyles } from '@/lib/theme';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Video, Volume2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

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
  activeTemplate?: string;
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
  mixTemplates,
  activeTemplate = "fade"
}: DJControlsProps) {
  const [showVideoTooltip, setShowVideoTooltip] = useState(forceShowTooltip);
  const [showAudioTooltip, setShowAudioTooltip] = useState(forceShowTooltip);
  const [videoLeftLabel, setVideoLeftLabel] = useState("");
  const [videoRightLabel, setVideoRightLabel] = useState("");
  const [audioLeftLabel, setAudioLeftLabel] = useState("");
  const [audioRightLabel, setAudioRightLabel] = useState("");
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setShowVideoTooltip(forceShowTooltip);
    setShowAudioTooltip(forceShowTooltip);
  }, [forceShowTooltip]);

  const getPercentage = (value: number) => {
    return Math.round(value * 100);
  };

  const showLabel = () => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    setShowVideoTooltip(true);
    setShowAudioTooltip(true);
  };

  const hideLabel = () => {
    tooltipTimer.current = setTimeout(() => {
      setShowVideoTooltip(false);
      setShowAudioTooltip(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  const handleSliderChange = (type: 'video' | 'audio', value: number[]) => {
    if (value && value.length > 0) {
      const normalizedValue = value[0] / 100;

      if (type === 'video') {
        onCrossFaderChange(normalizedValue);
      } else {
        onAudioFaderChange(normalizedValue);
      }
    }
  };

  useEffect(() => {
    const leftPercentage = Math.round((1 - crossFader) * 100);
    const rightPercentage = Math.round(crossFader * 100);
    setVideoLeftLabel(`${leftPercentage}%`);
    setVideoRightLabel(`${rightPercentage}%`);
  }, [crossFader]);

  useEffect(() => {
    const leftPercentage = Math.round((1 - audioFader) * 100);
    const rightPercentage = Math.round(audioFader * 100);
    setAudioLeftLabel(`${leftPercentage}%`);
    setAudioRightLabel(`${rightPercentage}%`);
  }, [audioFader]);

  const renderVideoThumbnail = (videoId: string | null | undefined, title?: string, channelTitle?: string) => {
    if (!videoId) {
      return (
        <div className="w-[180px] h-[101px] bg-card rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 8 6 4-6 4Z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
          <div className="p-2 bg-black/70 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title || "Video thumbnail"}
          className="w-[180px] h-[101px] object-cover rounded-md"
        />
        {(title || channelTitle) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 rounded-b-md">
            {title && <p className="text-xs font-medium truncate">{title}</p>}
            {channelTitle && <p className="text-xs opacity-70 truncate">{channelTitle}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 bg-transparent">
      {/* Mix Templates at the top */}
      {mixTemplates}

      {/* Main controls container with three columns */}
      <div className={cn(
        componentStyles.djControls.container,
        isMobile ? "grid-cols-1" : "grid-cols-[auto_1fr_auto]"
      )}>
        {/* Left video thumbnail */}
        <div className="flex flex-col items-center gap-1">
          {renderVideoThumbnail(leftVideoId, leftVideoTitle, leftChannelTitle)}
          <div className="text-sm text-muted-foreground text-center">
            Video Channel
          </div>
        </div>

        {/* Center controls with sliders */}
        <div className="flex flex-col gap-8 px-3">
          {/* Video slider */}
          <div className={componentStyles.djControls.slider}
            onMouseEnter={showLabel}
            onMouseLeave={hideLabel}
            onTouchStart={showLabel}
            onTouchEnd={hideLabel}
          >
            <div className="w-full flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">L</span>
              <div className="flex items-center">
                <span className="mr-2">Video</span>
                {showVideoTooltip && (
                  <div className="bg-card text-card-foreground px-2 py-1 rounded-md text-xs">
                    L: {videoLeftLabel} | R: {videoRightLabel}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground">R</span>
            </div>
            
            <Slider 
              defaultValue={[50]} 
              value={[crossFader * 100]}
              max={100}
              step={1}
              className="w-full" 
              onValueChange={(value) => handleSliderChange('video', value)}
            />
          </div>

          {/* Audio slider */}
          <div className={componentStyles.djControls.slider}
            onMouseEnter={showLabel}
            onMouseLeave={hideLabel}
            onTouchStart={showLabel}
            onTouchEnd={hideLabel}
          >
            <div className="w-full flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">L</span>
              <div className="flex items-center">
                <span className="mr-2">Audio</span>
                {showAudioTooltip && (
                  <div className="bg-card text-card-foreground px-2 py-1 rounded-md text-xs">
                    L: {audioLeftLabel} | R: {audioRightLabel}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground">R</span>
            </div>
            
            <Slider 
              defaultValue={[50]} 
              value={[audioFader * 100]}
              max={100}
              step={1}
              className="w-full" 
              onValueChange={(value) => handleSliderChange('audio', value)}
            />
          </div>
        </div>

        {/* Right video thumbnail */}
        <div className="flex flex-col items-center gap-1">
          {renderVideoThumbnail(rightVideoId, rightVideoTitle, rightChannelTitle)}
          <div className="text-sm text-muted-foreground text-center">
            Video Channel
          </div>
        </div>
      </div>
    </div>
  );
}