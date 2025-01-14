import { cn } from '@/lib/utils';
import VideoPlayer from './VideoPlayer';

interface BlendedVideoPlayerProps {
  leftVideo: string | null;
  rightVideo: string | null;
  crossFaderPosition: number;
  volumes: { left: number; right: number };
  playing: boolean;
  onVolumeChange: (value: number, side: 'left' | 'right') => void;
}

export default function BlendedVideoPlayer({
  leftVideo,
  rightVideo,
  crossFaderPosition,
  volumes,
  playing,
  onVolumeChange,
}: BlendedVideoPlayerProps) {
  // Calculate opacity and blend effects based on crossfader position
  const leftOpacity = Math.max(0, Math.min(1, 1 - crossFaderPosition));
  const rightOpacity = Math.max(0, Math.min(1, crossFaderPosition));

  return (
    <div className="relative w-full aspect-video">
      {/* Container for blend effect */}
      <div className="absolute inset-0 grid grid-cols-2">
        {/* Left video with blend effect */}
        <div
          className={cn(
            "relative transition-opacity duration-100",
            "after:absolute after:inset-0 after:backdrop-blur-[2px]"
          )}
          style={{
            opacity: leftOpacity,
            mixBlendMode: 'normal',
            transform: `scale(${1 + (1 - leftOpacity) * 0.05})`,
          }}
        >
          <VideoPlayer
            videoId={leftVideo}
            side="primary-left"
            volume={volumes.left * leftOpacity}
            playing={playing}
            onVolumeChange={(value) => onVolumeChange(value, 'left')}
            onVideoSelect={() => {}}
          />
        </div>

        {/* Right video with blend effect */}
        <div
          className={cn(
            "relative transition-opacity duration-100",
            "after:absolute after:inset-0 after:backdrop-blur-[2px]"
          )}
          style={{
            opacity: rightOpacity,
            mixBlendMode: 'normal',
            transform: `scale(${1 + rightOpacity * 0.05})`,
          }}
        >
          <VideoPlayer
            videoId={rightVideo}
            side="primary-right"
            volume={volumes.right * rightOpacity}
            playing={playing}
            onVolumeChange={(value) => onVolumeChange(value, 'right')}
            onVideoSelect={() => {}}
          />
        </div>
      </div>
    </div>
  );
}