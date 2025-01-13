import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [videos, setVideos] = useState<{ left: string | null; right: string | null }>({
    left: null,
    right: null
  });

  const handleVideoSelect = (videoId: string, side: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [side]: videoId
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground text-center mb-6">
        MixTube
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <VideoPlayer videoId={videos.left} side="left" />
        </Card>

        <Card className="overflow-hidden">
          <VideoPlayer videoId={videos.right} side="right" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'left')} />
        </div>
        <div>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'right')} />
        </div>
      </div>
    </div>
  );
}