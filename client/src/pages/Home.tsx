import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import DJControls from "@/components/DJControls";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [videos, setVideos] = useState<{ left: string | null; right: string | null }>({
    left: 'xpvjPsme8_k',
    right: 'eR2FFb6Zg9Q'
  });

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ left: 0.1, right: 0.25 });
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
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr,1fr,2fr] gap-8 items-start">
        {/* Left Video */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none bg-transparent">
            <VideoPlayer 
              videoId={videos.left} 
              side="left" 
              volume={calculateVolume(volumes.left, 'left')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
              onVideoSelect={(id) => handleVideoSelect(id, 'left')}
            />
          </Card>
          <SearchBar 
            onVideoSelect={(id) => handleVideoSelect(id, 'left')} 
            videoId={videos.left}
          />
        </div>

        {/* DJ Controls - Only shown in large screens between videos */}
        <div className="hidden lg:flex items-stretch">
          <DJControls
            isPlaying={playing}
            onPlayAll={() => setPlaying(true)}
            onPauseAll={() => setPlaying(false)}
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
          />
        </div>

        {/* Right Video */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-none bg-transparent">
            <VideoPlayer 
              videoId={videos.right} 
              side="right"
              volume={calculateVolume(volumes.right, 'right')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
              onVideoSelect={(id) => handleVideoSelect(id, 'right')}
            />
          </Card>
          <SearchBar 
            onVideoSelect={(id) => handleVideoSelect(id, 'right')} 
            videoId={videos.right}
          />
        </div>

        {/* DJ Controls - Shown below videos on medium and small screens */}
        <div className="lg:hidden col-span-full">
          <DJControls
            isPlaying={playing}
            onPlayAll={() => setPlaying(true)}
            onPauseAll={() => setPlaying(false)}
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
          />
        </div>
      </div>
    </div>
  );
}