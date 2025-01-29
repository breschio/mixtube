import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";

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
    <div className="min-h-screen bg-background p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">mixtube</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </header>

      <div className="mb-4 w-full flex justify-center">
        <div className="w-1/3 aspect-video bg-background/95 rounded-lg overflow-hidden">
          <MixedVideoPlayer
            leftVideo={videos.left}
            rightVideo={videos.right}
            crossFader={crossFader}
            playing={playing}
            volumes={volumes}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <VideoPlayer
            videoId={videos.left?.id || null}
            videoTitle={videos.left?.title}
            channelTitle={videos.left?.channelTitle}
            side="left"
            volume={volumes.left * (1 - crossFader)}
            playing={playing}
            onVolumeChange={(value) => setVolumes(prev => ({ ...prev, left: value }))}
          />
          <SearchBar onVideoSelect={(video) => handleVideoSelect(video, 'left')} />
        </div>

        <div className="space-y-4">
          <VideoPlayer
            videoId={videos.right?.id || null}
            videoTitle={videos.right?.title}
            channelTitle={videos.right?.channelTitle}
            side="right"
            volume={volumes.right * crossFader}
            playing={playing}
            onVolumeChange={(value) => setVolumes(prev => ({ ...prev, right: value }))}
          />
          <SearchBar onVideoSelect={(video) => handleVideoSelect(video, 'right')} />
        </div>
      </div>

      <Card className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Volume2 className={cn("h-4 w-4", crossFader < 0.5 && "text-primary")} />
          <Slider
            value={[crossFader]}
            max={1}
            step={0.01}
            onValueChange={([value]) => setCrossFader(value)}
            className="flex-1"
          />
          <Volume2 className={cn("h-4 w-4", crossFader >= 0.5 && "text-primary")} />
        </div>
      </Card>
    </div>
  );
}