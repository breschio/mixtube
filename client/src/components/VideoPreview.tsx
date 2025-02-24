import { useState } from 'react';
import ReactPlayer from 'react-player';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface VideoPreviewProps {
  videoId: string | null;
  playing: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onVideoEnd?: () => void;
  className?: string;
}

export default function VideoPreview({
  videoId,
  playing,
  onPlayPause,
  volume,
  onVolumeChange,
  onVideoEnd,
  className
}: VideoPreviewProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const playerConfig = {
    youtube: {
      playerVars: {
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: 3,
        cc_lang_pref: 'none',
        origin: window.location.origin,
        enablejsapi: 1,
        fs: 0,
        disablekb: 1
      }
    }
  };

  const handleEnded = () => {
    console.log('Video ended event triggered');
    setIsEnded(true);
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {videoId && (
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${videoId}`}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            config={playerConfig}
            onEnded={handleEnded}
            onPlay={() => setIsEnded(false)}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-white"
            onClick={onPlayPause}
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div 
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white"
              onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {showVolumeSlider && (
              <div className="absolute left-8 bottom-0 w-24 px-2 py-1 bg-black/90 rounded">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => onVolumeChange(value[0])}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}