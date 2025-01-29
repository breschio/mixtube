import React from 'react';
import VideoPlayer from './VideoPlayer';

interface MixedVideoPlayerProps {
  leftVideo: any;
  rightVideo: any;
  crossFader: number;
  playing: boolean;
  volumes: [number, number];
}

const MixedVideoPlayer: React.FC<MixedVideoPlayerProps> = ({
  leftVideo,
  rightVideo,
  crossFader,
  playing,
  volumes
}) => {
  const leftVolume = volumes[0] * (1 - crossFader);
  const rightVolume = volumes[1] * crossFader;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0" style={{ opacity: 1 - crossFader }}>
        <VideoPlayer
          video={leftVideo}
          playing={playing}
          volume={leftVolume}
        />
      </div>
      <div className="absolute inset-0" style={{ opacity: crossFader }}>
        <VideoPlayer
          video={rightVideo}
          playing={playing}
          volume={rightVolume}
        />
      </div>
    </div>
  );
};

export default MixedVideoPlayer;