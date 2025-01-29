import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import DJControls from "@/components/DJControls";
import RecommendedVideos from "@/components/RecommendedVideos";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);

  const handleVideoSelect = (video: VideoInfo, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: video
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full border-b border-border/20 px-4 sm:px-8 py-2 sm:py-4">
        <div className="max-w-[2000px] w-full sm:w-4/5 mx-auto flex justify-between items-center">
          <div className="font-bold text-xl text-primary">mixtube</div>
          <div className="flex items-center gap-4">
            <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
              <SheetTrigger asChild>
                <Toggle pressed={leftSheetOpen} className="text-xs">←</Toggle>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px]"> {/* Moved to right */}
                <div className="space-y-4">
                  <Card className="overflow-hidden bg-card/50 border-border/50">
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
              </SheetContent>
            </Sheet>



            <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
              <SheetTrigger asChild>
                <Toggle pressed={rightSheetOpen} className="text-xs">→</Toggle>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px]"> {/* Moved to right */}
                <div className="space-y-4">
                  <Card className="overflow-hidden bg-card/50 border-border/50">
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
              </SheetContent>
            </Sheet>

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
      </div>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div className="w-[66.666667%] pl-4 space-y-4">
          <Card className="aspect-video overflow-hidden bg-card/50 border-border/50">
            <MixedVideoPlayer
              leftVideo={videos.left}
              rightVideo={videos.right}
              crossFader={crossFader}
              playing={playing}
              volumes={volumes}
            />
          </Card>
          <Card className="p-4">
            <DJControls
              isPlaying={playing}
              onPlayAll={() => setPlaying(true)}
              onPauseAll={() => setPlaying(false)}
              crossFader={crossFader}
              onCrossFaderChange={setCrossFader}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}