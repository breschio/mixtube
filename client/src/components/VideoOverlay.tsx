import React, { useState } from "react";
import { Play, Pause } from "lucide-react";

interface VideoOverlayProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ isPlaying, onPlayPause }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
        isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
      } ${isPlaying ? 'bg-transparent' : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPlayPause();
      }}
    >
      <div className="transform transition-all duration-500 hover:scale-110 perspective-1000">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 shadow-lg ring-1 ring-white/10 cursor-pointer transform-style-3d rotate-y-[-45deg] hover:rotate-y-[-30deg]">
          <div className="relative transform-none">
            {isPlaying ? (
              <Pause className="h-12 w-12 text-primary-foreground" />
            ) : (
              <Play className="h-12 w-12 text-primary-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;