import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { useIsMobile } from "../hooks/use-mobile";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import DJControls from "@/components/DJControls";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
}

export default function Home() {
  const [videos, setVideos] = useState<{
    left: VideoInfo | null;
    right: VideoInfo | null;
  }>({
    left: {
      id: 'xpvjPsme8_k',
      title: 'Default Left Video',
      channelTitle: 'Default Channel'
    },
    right: {
      id: 'eR2FFb6Zg9Q',
      title: 'Default Right Video',
      channelTitle: 'Default Channel'
    }
  });

  const [mode, setMode] = useState<'performance' | 'listening'>('performance');
  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ left: 0.5, right: 0.5 });
  const [crossFader, setCrossFader] = useState(0.5);

  const handleVideoSelect = (video: VideoInfo, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: video
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#0A0A0B] border-b border-primary/20 px-4 py-2">
        <div className="max-w-[2000px] mx-auto flex justify-between items-center">
          <div className="text-white font-mono text-base sm:text-lg">
            mixtube
          </div>
          <div className="flex items-center gap-4">
            <Toggle
              variant="outline"
              pressed={mode === 'listening'}
              onPressedChange={(pressed) => setMode(pressed ? 'listening' : 'performance')}
              className="text-xs"
            >
              {mode === 'listening' ? '🎧' : '🎭'}
            </Toggle>
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content - Modified layout */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-x-8 lg:justify-between items-start">
          {/* Main Video Section - Reduced to ~75% size */}
          <div className="lg:w-1/2 xl:w-[55%] max-w-4xl w-full space-y-4">
            {mode === 'performance' && (
              <>
                <Card className="overflow-hidden border-none bg-transparent">
                  <MixedVideoPlayer
                    leftVideoId={videos.left?.id || null}
                    rightVideoId={videos.right?.id || null}
                    crossFaderValue={crossFader}
                    playing={playing}
                  />
                </Card>
                <div className="py-4">
                  <DJControls
                    isPlaying={playing}
                    onPlayAll={() => setPlaying(true)}
                    onPauseAll={() => setPlaying(false)}
                    crossFader={crossFader}
                    onCrossFaderChange={setCrossFader}
                    leftVideoId={videos.left?.id}
                    rightVideoId={videos.right?.id}
                    videos={videos}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Adjusted to maintain proportion */}
          <div className="lg:w-[38%] xl:w-[35%] w-full">
            <Card className="h-full bg-transparent">
              <Tabs defaultValue="left" className="w-full h-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="left" className="flex-1">Left Video</TabsTrigger>
                  <TabsTrigger value="right" className="flex-1">Right Video</TabsTrigger>
                </TabsList>

                <TabsContent value="left" className="h-[calc(100%-60px)]">
                  <VideoPlayer
                    videoId={videos.left?.id || null}
                    videoTitle={videos.left?.title}
                    channelTitle={videos.left?.channelTitle}
                    side="left"
                    volume={volumes.left}
                    playing={playing}
                    onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
                    onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                  />
                  <div className="mt-4">
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                      videoId={videos.left?.id || null}
                    />
                  </div>
                  <div className="mt-4">
                    <RecommendedVideos
                      videoId={videos.left?.id || null}
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="right" className="h-[calc(100%-60px)]">
                  <VideoPlayer
                    videoId={videos.right?.id || null}
                    videoTitle={videos.right?.title}
                    channelTitle={videos.right?.channelTitle}
                    side="right"
                    volume={volumes.right}
                    playing={playing}
                    onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
                    onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                  />
                  <div className="mt-4">
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                      videoId={videos.right?.id || null}
                    />
                  </div>
                  <div className="mt-4">
                    <RecommendedVideos
                      videoId={videos.right?.id || null}
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}