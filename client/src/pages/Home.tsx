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
import { useMobile } from '@/hooks/use-mobile';
import type { YouTubeVideo } from '@/lib/youtube';
import MixTemplates, { MixTemplate, mixTemplates } from "@/components/MixTemplates";
import ReactPlayer from 'react-player';

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('mix');
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
  const [activeTemplate, setActiveTemplate] = useState<string>(mixTemplates[0].id);

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

  const handleTemplateSelect = (template: MixTemplate) => {
    setActiveTemplate(template.id);
    setCrossFader(template.crossFaderValue);
  };

  const renderContent = () => {
    if (isMobile) {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="left" className="text-base py-2">Left</TabsTrigger>
            <TabsTrigger value="mix" className="text-base py-2">Mix</TabsTrigger>
            <TabsTrigger value="right" className="text-base py-2">Right</TabsTrigger>
          </TabsList>

          <TabsContent value="mix" className="mt-2">
            <div className="space-y-4">
              <MixTemplates
                onSelectTemplate={handleTemplateSelect}
                activeTemplate={activeTemplate}
              />
              <DJControls
                crossFader={crossFader}
                onCrossFaderChange={setCrossFader}
                leftVideoId={videos.left?.id}
                rightVideoId={videos.right?.id}
              />
            </div>
          </TabsContent>

          <TabsContent value="left" className="mt-2">
            <div className="space-y-4">
              <SearchBar
                onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                onSearch={(query) => handleSearch(query, 'left')}
                videoId={videos.left?.id || null}
              />
              <RecommendedVideos
                videoId={videos.left?.id || null}
                onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                searchResults={leftSearchResults}
                isSearching={!!searchQueries.left}
              />
            </div>
          </TabsContent>

          <TabsContent value="right" className="mt-2">
            <div className="space-y-4">
              <SearchBar
                onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                onSearch={(query) => handleSearch(query, 'right')}
                videoId={videos.right?.id || null}
              />
              <RecommendedVideos
                videoId={videos.right?.id || null}
                onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                searchResults={rightSearchResults}
                isSearching={!!searchQueries.right}
              />
            </div>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="grid grid-cols-[1fr,1fr,1fr] gap-6">
        {/* Left Deck */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videos.left?.id}`}
              width="100%"
              height="100%"
              playing={false}
              muted={true}
              config={{
                youtube: {
                  playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3
                  }
                }
              }}
            />
          </div>
          <h2 className="text-lg font-semibold">Left Deck</h2>
          <SearchBar
            onVideoSelect={(video) => handleVideoSelect(video, 'left')}
            onSearch={(query) => handleSearch(query, 'left')}
            videoId={videos.left?.id || null}
          />
          <RecommendedVideos
            videoId={videos.left?.id || null}
            onVideoSelect={(video) => handleVideoSelect(video, 'left')}
            searchResults={leftSearchResults}
            isSearching={!!searchQueries.left}
          />
        </div>

        {/* Mix Controls */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">mixtube</h2>
          <MixTemplates
            onSelectTemplate={handleTemplateSelect}
            activeTemplate={activeTemplate}
          />
          <DJControls
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
            leftVideoId={videos.left?.id}
            rightVideoId={videos.right?.id}
          />
        </div>

        {/* Right Deck */}
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videos.right?.id}`}
              width="100%"
              height="100%"
              playing={false}
              muted={true}
              config={{
                youtube: {
                  playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3
                  }
                }
              }}
            />
          </div>
          <h2 className="text-lg font-semibold">Right Deck</h2>
          <SearchBar
            onVideoSelect={(video) => handleVideoSelect(video, 'right')}
            onSearch={(query) => handleSearch(query, 'right')}
            videoId={videos.right?.id || null}
          />
          <RecommendedVideos
            videoId={videos.right?.id || null}
            onVideoSelect={(video) => handleVideoSelect(video, 'right')}
            searchResults={rightSearchResults}
            isSearching={!!searchQueries.right}
          />
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    if (!isMobile) {
      return (
        <MixedVideoPlayer
          leftVideoId={videos.left?.id || null}
          rightVideoId={videos.right?.id || null}
          crossFaderValue={crossFader}
          playing={playing}
          onPlayPause={handlePlayPause}
          preview={false}
          activeTemplate={activeTemplate}
          mobileView={false}
        />
      );
    }

    // Mobile view: Show mixed video player with both videos
    return (
      <div className="relative aspect-video">
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'mix' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <MixedVideoPlayer
            leftVideoId={videos.left?.id || null}
            rightVideoId={videos.right?.id || null}
            crossFaderValue={crossFader}
            playing={playing}
            onPlayPause={handlePlayPause}
            preview={false}
            activeTemplate={activeTemplate}
            mobileView={true}
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'left' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <MixedVideoPlayer
            leftVideoId={videos.left?.id || null}
            rightVideoId={null}
            crossFaderValue={0}
            playing={playing}
            onPlayPause={handlePlayPause}
            preview={false}
            mobileView={true}
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'right' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <MixedVideoPlayer
            leftVideoId={null}
            rightVideoId={videos.right?.id || null}
            crossFaderValue={1}
            playing={playing}
            onPlayPause={handlePlayPause}
            preview={false}
            mobileView={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="container mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 py-2 flex justify-between items-center">
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

      <main className="flex-1 container mx-auto max-w-[1440px] w-full px-3 sm:px-4 md:px-6 py-4">
        <div className="lg:grid lg:grid-cols-[2fr,1fr] lg:gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {renderContent()}
          </div>

          {/* Mixed Video */}
          <Card className="overflow-hidden border-none bg-transparent mb-6 lg:mb-0">
            {isMobile ? (
              renderVideo()
            ) : (
              <MixedVideoPlayer
                leftVideoId={videos.left?.id || null}
                rightVideoId={videos.right?.id || null}
                crossFaderValue={crossFader}
                playing={playing}
                onPlayPause={handlePlayPause}
                preview={false}
                activeTemplate={activeTemplate}
                mobileView={false}
              />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}