import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import VideoPlayer from "@/components/VideoPlayer";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DJControls from "@/components/DJControls";
import AuthModal from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useYoutubeSearch } from '@/hooks/use-youtube-search';
import type { YouTubeVideo } from '@/lib/youtube';
import MixControls from "@/components/MixControls";

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
}

export default function Home() {
  const user = useUser();
  const [videos, setVideos] = useState<{
    left: VideoInfo | null;
    right: VideoInfo | null;
  }>({
    left: {
      id: 'xpvjPsme8_k',
      title: 'Default Left Video',
      channelTitle: 'Default Channel',
      thumbnail: `https://img.youtube.com/vi/xpvjPsme8_k/mqdefault.jpg`
    },
    right: {
      id: 'eR2FFb6Zg9Q',
      title: 'Default Right Video',
      channelTitle: 'Default Channel',
      thumbnail: `https://img.youtube.com/vi/eR2FFb6Zg9Q/mqdefault.jpg`
    }
  });

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState({ left: 0.5, right: 0.5 });
  const [crossFader, setCrossFader] = useState(0.5);
  const [searchQueries, setSearchQueries] = useState({ left: '', right: '' });
  const [speeds, setSpeeds] = useState({ left: 1, right: 1 });

  const { data: leftSearchResults, isLoading: leftSearchLoading } = useYoutubeSearch(searchQueries.left);
  const { data: rightSearchResults, isLoading: rightSearchLoading } = useYoutubeSearch(searchQueries.right);

  const handleVideoSelect = (video: YouTubeVideo, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: { ...video, channelTitle: video.channelTitle || 'Unknown Channel' }
    }));
    setSearchQueries(prev => ({
      ...prev,
      [target]: ''
    }));
  };

  const handleSearch = (query: string, target: 'left' | 'right') => {
    setSearchQueries(prev => ({
      ...prev,
      [target]: query
    }));
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleSpeedChange = (player: 'left' | 'right', speed: number) => {
    setSpeeds(prev => ({
      ...prev,
      [player]: speed
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background border-b">
        <div className="container mx-auto max-w-[1024px] px-3 sm:px-4 md:px-6 py-2 flex justify-between items-center">
          <div className="text-foreground font-mono text-xl">
            mixtube
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user && (
              <AuthModal trigger={
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              } />
            )}
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata.avatar_url || ''} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-[1024px] w-full px-3 sm:px-4 md:px-6 py-4">
        <div className="space-y-6">
          <Card className="overflow-hidden border-none bg-transparent">
            <MixedVideoPlayer
              leftVideoId={videos.left?.id || null}
              rightVideoId={videos.right?.id || null}
              crossFaderValue={crossFader}
              playing={playing}
              onPlayPause={handlePlayPause}
              leftSpeed={speeds.left}
              rightSpeed={speeds.right}
            />
          </Card>

          <div className="py-0">
            <Tabs defaultValue="mix" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="left" className="text-base py-2">Left</TabsTrigger>
                <TabsTrigger value="mix" className="text-base py-2">Mix</TabsTrigger>
                <TabsTrigger value="right" className="text-base py-2">Right</TabsTrigger>
              </TabsList>

              <TabsContent value="mix" className="mt-2">
                <div className="space-y-4">
                  <MixControls
                    crossFader={crossFader}
                    onCrossFaderChange={setCrossFader}
                    onSpeedChange={handleSpeedChange}
                    leftSpeed={speeds.left}
                    rightSpeed={speeds.right}
                    isPlaying={playing}
                    onPlayPause={handlePlayPause}
                  />
                </div>
              </TabsContent>

              <TabsContent value="left" className="mt-2">
                <div className="space-y-4">
                  <VideoPlayer
                    videoId={videos.left?.id || null}
                    videoTitle={videos.left?.title}
                    channelTitle={videos.left?.channelTitle}
                    side="left"
                  />
                  <div className="mt-4">
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                      onSearch={(query) => handleSearch(query, 'left')}
                      videoId={videos.left?.id || null}
                    />
                  </div>
                  <div className="mt-4">
                    <RecommendedVideos
                      videoId={videos.left?.id || null}
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                      searchResults={leftSearchResults}
                      isSearching={!!searchQueries.left}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="right" className="mt-2">
                <div className="space-y-4">
                  <VideoPlayer
                    videoId={videos.right?.id || null}
                    videoTitle={videos.right?.title}
                    channelTitle={videos.right?.channelTitle}
                    side="right"
                  />
                  <div className="mt-4">
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                      onSearch={(query) => handleSearch(query, 'right')}
                      videoId={videos.right?.id || null}
                    />
                  </div>
                  <div className="mt-4">
                    <RecommendedVideos
                      videoId={videos.right?.id || null}
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                      searchResults={rightSearchResults}
                      isSearching={!!searchQueries.right}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}