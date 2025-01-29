
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
        <div className="flex flex-1">
          <div className="w-2/3 p-4">
            {mode === 'performance' && (
              <Card className="h-full overflow-hidden bg-card/50 border-border/50">
                <MixedVideoPlayer 
                  leftVideoId={videos.left?.id || null}
                  rightVideoId={videos.right?.id || null}
                  crossFaderValue={crossFader}
                  playing={playing}
                />
              </Card>
            )}
          </div>

          <div className="w-1/3 p-4 border-l border-border/20">
            <Card className="h-full bg-card/50">
              {mode === 'performance' && (
                <div className="mb-4 p-4">
                  <DJControls
                    isPlaying={playing}
                    onPlayAll={() => setPlaying(true)}
                    onPauseAll={() => setPlaying(false)}
                    crossFader={crossFader}
                    onCrossFaderChange={setCrossFader}
                  />
                </div>
              )}
              <Tabs defaultValue="left" className="w-full h-full">
                <TabsList className="w-full mb-4 bg-muted/50">
                  <TabsTrigger value="left" className="flex-1">Left Video</TabsTrigger>
                  <TabsTrigger value="right" className="flex-1">Right Video</TabsTrigger>
                </TabsList>

                <TabsContent value="left" className="h-[calc(100%-60px)]">
                  <div className="space-y-4 p-4">
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
                  <div className="space-y-4 p-4">
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
