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
  const [crossFader, setCrossFader] = useState(0.5);

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
    <div className="min-h-screen bg-[#0A0A0B] p-8 space-y-8">
      <h1 className="mixtube-logo text-center text-primary mb-12">
        MIXTUBE
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Video */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none bg-transparent">
            <VideoPlayer 
              videoId={videos.left} 
              side="left" 
              volume={calculateVolume(volumes.left, 'left')}
              playing={playing}
            />
          </Card>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'left')} />
        </div>

        {/* Right Video */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none bg-transparent">
            <VideoPlayer 
              videoId={videos.right} 
              side="right"
              volume={calculateVolume(volumes.right, 'right')}
              playing={playing}
            />
          </Card>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'right')} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-12">
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