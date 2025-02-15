import React from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoOverlayProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ isPlaying, onPlayPause }) => {
  return (
    <div 
      className={cn(
        "absolute inset-0 z-10 group/player",
        "transition-opacity duration-300",
        "hover:bg-gradient-to-t hover:from-black/50 hover:via-transparent hover:to-transparent",
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPlayPause();
      }}
    >
      <div 
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2",
          "opacity-0 group-hover/player:opacity-100",
          "transition-all duration-200 ease-in-out",
        )}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 text-white backdrop-blur-sm">
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;