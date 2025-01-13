import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import DJControls from "@/components/DJControls";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [videos, setVideos] = useState<{ left: string | null; right: string | null }>({
    left: null,
    right: null
  });

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ left: 0.5, right: 0.5 });
  const [crossFader, setCrossFader] = useState(0.5); // 0 = full left, 1 = full right

  const handleVideoSelect = (videoId: string, side: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [side]: videoId
    }));
  };

  const calculateVolume = (baseVolume: number, side: 'left' | 'right') => {
    const crossFaderValue = side === 'left' ? 1 - crossFader : crossFader;
    return baseVolume * crossFaderValue;
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground text-center mb-6">
        MixTube
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Video */}
        <div className="space-y-2">
          <Card className="overflow-hidden">
            <VideoPlayer 
              videoId={videos.left} 
              side="left" 
              volume={calculateVolume(volumes.left, 'left')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
            />
          </Card>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'left')} />
        </div>

        {/* Right Video */}
        <div className="space-y-2">
          <Card className="overflow-hidden">
            <VideoPlayer 
              videoId={videos.right} 
              side="right"
              volume={calculateVolume(volumes.right, 'right')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
            />
          </Card>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'right')} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <DJControls
          isPlaying={playing}
          onPlayAll={() => setPlaying(true)}
          onPauseAll={() => setPlaying(false)}
          leftVolume={volumes.left}
          rightVolume={volumes.right}
          onLeftVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
          onRightVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
          crossFader={crossFader}
          onCrossFaderChange={setCrossFader}
        />
      </div>
    </div>
  );
}