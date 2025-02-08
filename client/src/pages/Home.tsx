import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DJControls from "@/components/DJControls";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold sm:inline-block">
                mixtube
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Toggle
              variant="outline"
              pressed={mode === 'listening'}
              onPressedChange={(pressed) => setMode(pressed ? 'listening' : 'performance')}
              className="text-xs"
            >
              {mode === 'listening' ? '🎧' : '🎭'}
            </Toggle>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-[1800px] mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Main Video Section */}
          <div className="w-full sm:w-[70%] space-y-6">
            {mode === 'performance' && (
              <>
                <Card className="overflow-hidden">
                  <MixedVideoPlayer
                    leftVideoId={videos.left?.id || null}
                    rightVideoId={videos.right?.id || null}
                    crossFaderValue={crossFader}
                    playing={playing}
                  />
                </Card>
                <div className="py-4">
                  <DJControls
                    crossFader={crossFader}
                    onCrossFaderChange={setCrossFader}
                    leftVideoId={videos.left?.id}
                    rightVideoId={videos.right?.id}
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full sm:w-[30%]">
            <Card className="h-full">
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="left" className="w-full h-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="left">Left Video</TabsTrigger>
                  <TabsTrigger value="right">Right Video</TabsTrigger>
                </TabsList>

                <TabsContent value="left" className="h-[calc(100%-60px)]">
                  <div className="space-y-4">
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
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                      videoId={videos.left?.id || null}
                    />
                    <RecommendedVideos
                      videoId={videos.left?.id || null}
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="right" className="h-[calc(100%-60px)]">
                  <div className="space-y-4">
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
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                      videoId={videos.right?.id || null}
                    />
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