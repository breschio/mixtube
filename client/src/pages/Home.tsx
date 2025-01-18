import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import DJControls from "@/components/DJControls";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const [mainVideo, setMainVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ left: string | null; right: string | null }>({
    left: 'xpvjPsme8_k',
    right: 'eR2FFb6Zg9Q'
  });

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ main: 0.5, left: 0.1, right: 0.25 });
  const [crossFader, setCrossFader] = useState(0.5);

  const handleVideoSelect = (videoId: string, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: videoId
    }));
  };

  const calculateVolume = (baseVolume: number, side: 'left' | 'right') => {
    const crossFaderValue = side === 'left' ? 1 - crossFader : crossFader;
    return baseVolume * crossFaderValue;
  };

  const calculateOpacity = (side: 'left' | 'right') => {
    const baseOpacity = side === 'left' ? 1 - crossFader : crossFader;
    return Math.min(Math.max(baseOpacity * 1.5, 0.2), 1); // Ensures minimum visibility of 0.2
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="w-full bg-[#0A0A0B] border-b border-primary/20 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-mono text-lg">
            mixtube
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Video Mix Section */}
        <div className="relative max-w-[1200px] mx-auto mb-8 aspect-video">
          <div className="absolute inset-0 z-10" style={{ opacity: calculateOpacity('left') }}>
            <VideoPlayer 
              videoId={videos.left} 
              side="left"
              volume={calculateVolume(volumes.left, 'left')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
              onVideoSelect={(id) => handleVideoSelect(id, 'left')}
            />
          </div>
          <div className="absolute inset-0 z-20" style={{ opacity: calculateOpacity('right') }}>
            <VideoPlayer 
              videoId={videos.right} 
              side="right"
              volume={calculateVolume(volumes.right, 'right')}
              playing={playing}
              onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
              onVideoSelect={(id) => handleVideoSelect(id, 'right')}
            />
          </div>
        </div>

        {/* Controls and Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(400px,2fr),minmax(200px,1fr),minmax(400px,2fr)] gap-4 sm:gap-6 lg:gap-8 items-start max-w-[2000px] mx-auto">
          {/* Left Video Search and Recommendations */}
          <div className="space-y-4">
            <SearchBar 
              onVideoSelect={(id) => handleVideoSelect(id, 'left')} 
              videoId={videos.left}
            />
            <RecommendedVideos
              videoId={videos.left}
              onVideoSelect={(id) => handleVideoSelect(id, 'left')}
            />
          </div>

          {/* DJ Controls */}
          <div className="hidden lg:flex items-stretch">
            <DJControls
              isPlaying={playing}
              onPlayAll={() => setPlaying(true)}
              onPauseAll={() => setPlaying(false)}
              crossFader={crossFader}
              onCrossFaderChange={setCrossFader}
            />
          </div>

          {/* Right Video Search and Recommendations */}
          <div className="space-y-4">
            <SearchBar 
              onVideoSelect={(id) => handleVideoSelect(id, 'right')} 
              videoId={videos.right}
              isRightColumn
            />
            <RecommendedVideos
              videoId={videos.right}
              onVideoSelect={(id) => handleVideoSelect(id, 'right')}
            />
          </div>

          {/* Mobile DJ Controls */}
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
    </div>
  );
}