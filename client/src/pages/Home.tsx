import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { ChevronRight, ChevronLeft, Play, Pause, MonitorPlay, Volume2, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
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

  const [mode, setMode] = useState<'preview' | 'mix'>('preview');
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
    <div className="min-h-screen bg-background p-4 space-y-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">mixtube</h1>
        <Toggle
          variant="outline"
          pressed={mode === 'mix'}
          onPressedChange={(pressed) => setMode(pressed ? 'mix' : 'preview')}
          aria-label="Toggle mix mode"
        >
          <MonitorPlay className="h-4 w-4" />
        </Toggle>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Left Deck</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
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
            <div className="mt-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volumes.left]}
                max={1}
                step={0.01}
                onValueChange={([value]) => setVolumes(prev => ({ ...prev, left: value }))}
              />
            </div>
          </Card>

          <SearchBar 
            onVideoSelect={(video) => handleVideoSelect(video, 'left')}
            videoId={videos.left?.id || null}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Right Deck</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
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
            <div className="mt-4 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volumes.right]}
                max={1}
                step={0.01}
                onValueChange={([value]) => setVolumes(prev => ({ ...prev, right: value }))}
              />
            </div>
          </Card>

          <SearchBar 
            onVideoSelect={(video) => handleVideoSelect(video, 'right')}
            videoId={videos.right?.id || null}
          />
        </div>
      </div>

      <Card className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <ChevronLeft className={cn("h-4 w-4", crossFader < 0.5 && "text-primary")} />
            <Slider
              value={[crossFader]}
              max={1}
              step={0.01}
              onValueChange={([value]) => setCrossFader(value)}
              className="flex-1"
            />
            <ChevronRight className={cn("h-4 w-4", crossFader > 0.5 && "text-primary")} />
          </div>

          {mode === 'mix' && (
            <div className="aspect-video w-full max-w-md mx-auto">
              <MixedVideoPlayer
                leftVideo={videos.left}
                rightVideo={videos.right}
                crossFader={crossFader}
                playing={playing}
                volumes={volumes}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}