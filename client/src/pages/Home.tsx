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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-4">
            <span className="font-medium">mixtube</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Toggle
              pressed={mode === 'listening'}
              onPressedChange={(pressed) => setMode(pressed ? 'listening' : 'performance')}
            >
              {mode === 'listening' ? '🎧' : '🎭'}
            </Toggle>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
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
                <DJControls
                  crossFader={crossFader}
                  onCrossFaderChange={setCrossFader}
                  leftVideoId={videos.left?.id}
                  rightVideoId={videos.right?.id}
                />
              </>
            )}
          </div>

          <div>
            <Card className="p-6">
              <Button
                variant="default"
                size="lg"
                className="w-full mb-6"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {playing ? 'Pause' : 'Play'}
              </Button>

              <Tabs defaultValue="left">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="left">Left Video</TabsTrigger>
                  <TabsTrigger value="right">Right Video</TabsTrigger>
                </TabsList>

                <TabsContent value="left" className="mt-6 space-y-6">
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
                </TabsContent>

                <TabsContent value="right" className="mt-6 space-y-6">
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
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}