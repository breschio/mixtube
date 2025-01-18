import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import DJControls from "@/components/DJControls";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const [videos, setVideos] = useState<{ left: string | null; right: string | null }>({
    left: 'xpvjPsme8_k',
    right: 'eR2FFb6Zg9Q'
  });

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ left: 0.5, right: 0.5 });
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
        {/* Mixed Video Section */}
        <div className="mb-8 max-w-[1200px] mx-auto">
          <Card className="overflow-hidden border-none bg-transparent">
            <MixedVideoPlayer 
              leftVideoId={videos.left}
              rightVideoId={videos.right}
              crossFaderValue={crossFader}
              playing={playing}
            />
          </Card>
        </div>

        {/* DJ Mix Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(400px,2fr),minmax(200px,1fr),minmax(400px,2fr)] gap-4 sm:gap-6 lg:gap-8 items-start max-w-[2000px] mx-auto">
          {/* Left Video Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-none bg-transparent">
              <VideoPlayer 
                videoId={videos.left} 
                side="left" 
                volume={volumes.left}
                playing={playing}
                onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
                onVideoSelect={(id) => handleVideoSelect(id, 'left')}
              />
            </Card>
            <SearchBar 
              onVideoSelect={(id) => handleVideoSelect(id, 'left')} 
              videoId={videos.left}
            />
            <RecommendedVideos
              videoId={videos.left}
              onVideoSelect={(id) => handleVideoSelect(id, 'left')}
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

          {/* Right Video Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-none bg-transparent">
              <VideoPlayer 
                videoId={videos.right} 
                side="right"
                volume={volumes.right}
                playing={playing}
                onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
                onVideoSelect={(id) => handleVideoSelect(id, 'right')}
              />
            </Card>
            <SearchBar 
              onVideoSelect={(id) => handleVideoSelect(id, 'right')} 
              videoId={videos.right}
            />
            <RecommendedVideos
              videoId={videos.right}
              onVideoSelect={(id) => handleVideoSelect(id, 'right')}
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
    </div>
  );
}