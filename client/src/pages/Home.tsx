import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { useIsMobile } from "../hooks/use-mobile";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import DJControls from "@/components/DJControls";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";

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
  const isMobile = useIsMobile();

  const handleVideoSelect = (video: VideoInfo, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: video
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="w-full bg-[#0A0A0B] border-b border-primary/20 px-4 sm:px-8 py-2 sm:py-4">
        <div className="max-w-[2000px] w-full sm:w-4/5 mx-auto flex justify-between items-center">
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
      <SidebarProvider>
      <main className="w-full sm:w-4/5 max-w-[2000px] mx-auto p-4 sm:p-8 pb-20 sm:pb-8 space-y-4 sm:space-y-8">
        {/* Mixed Video Section */}
        {mode === 'performance' && (
          <div>
            <Card className="overflow-hidden border-none bg-transparent">
              <MixedVideoPlayer 
                leftVideoId={videos.left?.id || null}
                rightVideoId={videos.right?.id || null}
                crossFaderValue={crossFader}
                playing={playing}
              />
            </Card>
          </div>
        )}

        {/* DJ Controls - Centered between video and columns */}
        <div className="flex justify-center">
          <DJControls
            isPlaying={playing}
            onPlayAll={() => setPlaying(true)}
            onPauseAll={() => setPlaying(false)}
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
          />
        </div>

        {/* Video Columns */}
        {isMobile ? (
          <Tabs defaultValue="left" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="left" className="flex-1">Left Video</TabsTrigger>
              <TabsTrigger value="right" className="flex-1">Right Video</TabsTrigger>
            </TabsList>
            <TabsContent value="left" className="space-y-4 mt-0">
            <Card className="overflow-hidden border-none bg-transparent">
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
            </Card>
            <SearchBar 
              onVideoSelect={(video) => handleVideoSelect(video, 'left')} 
              videoId={videos.left?.id || null}
            />
            <RecommendedVideos
              videoId={videos.left?.id || null}
              onVideoSelect={(video) => handleVideoSelect(video, 'left')}
            />
          </TabsContent>
            <TabsContent value="right" className="space-y-4 mt-0">
            <Card className="overflow-hidden border-none bg-transparent">
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
            </Card>
            <SearchBar 
              onVideoSelect={(video) => handleVideoSelect(video, 'right')} 
              videoId={videos.right?.id || null}
            />
            <RecommendedVideos
              videoId={videos.right?.id || null}
              onVideoSelect={(video) => handleVideoSelect(video, 'right')}
            />
          </TabsContent>
          </Tabs>
        ) : (
          <div className="flex w-full gap-4">
            <Sidebar side="left" collapsible="icon" className="bg-[#0A1525]">
              <SidebarContent className="w-[320px] p-4">
                <div className="space-y-4">
                  <Card className="overflow-hidden border-none bg-transparent">
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
              </Card>
              <SearchBar 
                onVideoSelect={(video) => handleVideoSelect(video, 'left')} 
                videoId={videos.left?.id || null}
              />
              <RecommendedVideos
                    videoId={videos.left?.id || null}
                    onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                  />
                </div>
              </SidebarContent>
            </Sidebar>

            {/* Center content for mixed video */}
            <div className="flex-1" />

            <Sidebar side="right" collapsible="icon" className="bg-[#0A1525]">
              <SidebarContent className="w-[320px] p-4">
                <div className="space-y-4">
                  <Card className="overflow-hidden border-none bg-transparent">
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
              </Card>
              <SearchBar 
                onVideoSelect={(video) => handleVideoSelect(video, 'right')} 
                videoId={videos.right?.id || null}
              />
              <RecommendedVideos
                    videoId={videos.right?.id || null}
                    onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                  />
                </div>
              </SidebarContent>
            </Sidebar>
          </div>
        )}
      </main>
      </SidebarProvider>
    </div>
  );
}