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
        Dual YouTube Player
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'left')} />
          <Card className="mt-2">
            <VideoPlayer videoId={videos.left} side="left" />
          </Card>
        </div>
        
        <div>
          <SearchBar onVideoSelect={(id) => handleVideoSelect(id, 'right')} />
          <Card className="mt-2">
            <VideoPlayer videoId={videos.right} side="right" />
          </Card>
        </div>
      </div>
    </div>
  );
}
