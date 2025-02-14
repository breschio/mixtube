import React from "react";
import { Play } from "lucide-react";

interface VideoOverlayProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ isPlaying, onPlayPause }) => {
  if (isPlaying) return null;

  return (
    <div 
      className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        e.preventDefault();
        onPlayPause();
      }}
    >
      <div className="transform transition-all duration-500 hover:scale-110 animate-[spin_8s_linear_infinite] hover:animate-[spin_4s_linear_infinite] perspective-1000">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 shadow-lg ring-1 ring-white/10 cursor-pointer transform-style-3d rotate-y-[-45deg] hover:rotate-y-[-30deg]">
          <div className="relative transform-none">
            <Play className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;