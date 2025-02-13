import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DJControls from "@/components/DJControls";
import AuthModal from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background border-b">
        <div className="container max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-2 flex justify-between items-center">
          <div className="text-foreground font-mono text-xl">
            mixtube
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthModal trigger={
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            } />
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-[70%] space-y-4">
            <Card className="overflow-hidden border-none bg-transparent">
              <MixedVideoPlayer
                leftVideoId={videos.left?.id || null}
                rightVideoId={videos.right?.id || null}
                crossFaderValue={crossFader}
                playing={playing}
              />
            </Card>
            <div className="py-4 flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-[120px]"
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
              <DJControls
                crossFader={crossFader}
                onCrossFaderChange={setCrossFader}
                leftVideoId={videos.left?.id}
                rightVideoId={videos.right?.id}
              />
            </div>
          </div>

          <div className="w-full sm:w-[30%]">
            <Card className="h-full bg-transparent border-none">
              <Tabs defaultValue="left" className="w-full h-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="left" className="flex-1">
                    Left
                  </TabsTrigger>
                  <TabsTrigger value="right" className="flex-1">
                    Right
                  </TabsTrigger>
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