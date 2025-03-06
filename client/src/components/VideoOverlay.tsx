import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface VideoOverlayProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ isPlaying, onPlayPause }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if we're on a touch device
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event from bubbling to YouTube iframe
    e.preventDefault();
    e.stopPropagation();

    // Log the event type for debugging
    console.log('Overlay interaction:', e.type);

    // Call the play/pause handler
    onPlayPause();
  }, [onPlayPause]);

  return (
    <div 
      className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 ${
        isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
      } ${isPlaying ? 'bg-transparent' : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm'}`}
      onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
      onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
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