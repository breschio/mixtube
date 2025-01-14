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

  const handleVideoSelect = (videoId: string, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: videoId
    }));
  };

  const calculateVolume = (baseVolume: number, side: 'left' | 'right', isMixPreview: boolean) => {
    // If it's not the mix preview, return 0 to mute the bottom players
    if (!isMixPreview) {
      return 0;
    }
    // For mix preview, calculate volume based on crossfader
    const crossFaderValue = side === 'left' ? 1 - crossFader : crossFader;
    return baseVolume * crossFaderValue;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8 space-y-8">
      {/* Primary Video Section - Mix Preview */}
      <section className="max-w-[1920px] mx-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-primary/80">MIX PREVIEW</h2>
            <div className="text-xs text-muted-foreground">
              {Math.round((1 - crossFader) * 100)}% L / {Math.round(crossFader * 100)}% R
            </div>
          </div>
          <Card className="overflow-hidden border-none bg-transparent relative">
            <div className="grid grid-cols-2 aspect-video">
              <VideoPlayer 
                videoId={videos.left} 
                side="primary-left"
                volume={calculateVolume(volumes.left, 'left', true)}
                playing={playing}
                onVolumeChange={() => {}}
                onVideoSelect={() => {}}
              />
              <VideoPlayer 
                videoId={videos.right} 
                side="primary-right"
                volume={calculateVolume(volumes.right, 'right', true)}
                playing={playing}
                onVolumeChange={() => {}}
                onVideoSelect={() => {}}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Mixing Section */}
      <section className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr,1fr,2fr] gap-8 items-start">
          {/* Left Video */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-none bg-transparent">
              <VideoPlayer 
                videoId={videos.left} 
                side="left" 
                volume={calculateVolume(volumes.left, 'left', false)}
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
                volume={calculateVolume(volumes.right, 'right', false)}
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
        </div>

        {/* DJ Controls - Shown below videos on medium and small screens */}
        <div className="lg:hidden mt-8">
          <DJControls
            isPlaying={playing}
            onPlayAll={() => setPlaying(true)}
            onPauseAll={() => setPlaying(false)}
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
          />
        </div>
      </section>
    </div>
  );
}