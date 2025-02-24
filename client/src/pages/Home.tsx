import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react"; 
import SearchBar from "@/components/SearchBar";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import RecommendedVideos from "@/components/RecommendedVideos";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DJControls from "@/components/DJControls";
import AuthModal from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useYoutubeSearch } from '@/hooks/use-youtube-search';
import { useMobile } from '@/hooks/use-mobile';
import type { YouTubeVideo } from '@/lib/youtube';
import MixTemplates, { MixTemplate } from "@/components/MixTemplates";
import VideoPreview from "@/components/VideoPreview";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ResizablePanels";

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const [showMixControls, setShowMixControls] = useState(false);
  const [activeTab, setActiveTab] = useState("left"); // For mobile tab view
  const [videos, setVideos] = useState<{
    left: VideoInfo | null;
    right: VideoInfo | null;
  }>({
    left: {
      id: 'ApSCH4JXjQU',
      title: 'Chilled Jazz House Music Mix - Cozy Playlist',
      channelTitle: 'Default Channel',
      thumbnail: `https://img.youtube.com/vi/ApSCH4JXjQU/mqdefault.jpg`
    },
    right: {
      id: 'Q_050nEIMqw',
      title: 'How to Attract Money & Clients',
      channelTitle: 'Unknown Channel',
      thumbnail: `https://img.youtube.com/vi/Q_050nEIMqw/mqdefault.jpg`
    }
  });

  const [playing, setPlaying] = useState(false);
  const [videoStates, setVideoStates] = useState({
    left: {
      playing: false,
      volume: 0.5
    },
    right: {
      playing: false,
      volume: 0.5
    }
  });
  const [crossFader, setCrossFader] = useState(0.6);
  const [searchQueries, setSearchQueries] = useState({ 
    left: '',  
    right: '' 
  });
  const [activeTemplate, setActiveTemplate] = useState<string>("side-by-side");
  const [showTransitionTooltip, setShowTransitionTooltip] = useState(false);

  const { data: leftSearchResults } = useYoutubeSearch(searchQueries.left, {
    enabled: searchQueries.left.length >= 2
  });
  const { data: rightSearchResults } = useYoutubeSearch(searchQueries.right, {
    enabled: searchQueries.right.length >= 2
  });

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
    if (query.length >= 2) {
      setSearchQueries(prev => ({
        ...prev,
        [target]: query
      }));
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleTemplateSelect = (template: MixTemplate) => {
    setActiveTemplate(template.id);
    setCrossFader(template.crossFaderValue);
  };

  const handleCrossFaderChange = (value: number) => {
    setCrossFader(value);
  };

  const renderControls = (side: 'left' | 'right') => (
    <div className="h-full flex flex-col">
      <VideoPreview
        videoId={videos[side]?.id || null}
        playing={videoStates[side].playing}
        onPlayPause={() => {
          setVideoStates(prev => ({
            ...prev,
            [side]: { ...prev[side], playing: !prev[side].playing }
          }));
        }}
        volume={videoStates[side].volume}
        onVolumeChange={(value) => {
          setVideoStates(prev => ({
            ...prev,
            [side]: { ...prev[side], volume: value }
          }));
        }}
        className="mb-4"
      />
      <SearchBar
        onVideoSelect={(video) => handleVideoSelect(video, side)}
        onSearch={(query) => handleSearch(query, side)}
        videoId={videos[side]?.id || null}
      />
      <div className="flex-1 overflow-auto mt-4">
        <RecommendedVideos
          videoId={videos[side]?.id || null}
          onVideoSelect={(video) => handleVideoSelect(video, side)}
          searchResults={side === 'left' ? leftSearchResults : rightSearchResults}
          isSearching={!!searchQueries[side]}
          side={side}
        />
      </div>
    </div>
  );

  const mainVideoPlayer = (
    <div className="relative">
      <MixedVideoPlayer
        leftVideoId={videos.left?.id || null}
        rightVideoId={videos.right?.id || null}
        crossFaderValue={crossFader}
        playing={playing}
        onPlayPause={handlePlayPause}
        preview={false}
        activeTemplate={activeTemplate}
        mobileView={isMobile}
      />
    </div>
  );

  const mixControls = (
    <Card className="mt-4 p-4">
      <div className="space-y-6">
        <MixTemplates
          onSelectTemplate={handleTemplateSelect}
          activeTemplate={activeTemplate}
        />
        <DJControls
          crossFader={crossFader}
          onCrossFaderChange={handleCrossFaderChange}
          leftVideoId={videos.left?.id}
          rightVideoId={videos.right?.id}
          forceShowTooltip={showTransitionTooltip}
        />
      </div>
    </Card>
  );

  // Mobile Layout with Tabs
  const renderMobileLayout = () => (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="relative">
        {/* Left Video Player */}
        <div className={cn("w-full", activeTab !== "left" && "hidden")}>
          <MixedVideoPlayer
            leftVideoId={videos.left?.id || null}
            rightVideoId={null}
            crossFaderValue={1}
            playing={playing}
            onPlayPause={handlePlayPause}
            preview={false}
            activeTemplate="single"
            mobileView={true}
          />
        </div>

        {/* Mix Video Player */}
        <div className={cn("w-full", activeTab !== "mix" && "hidden")}>
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

        {/* Right Video Player */}
        <div className={cn("w-full", activeTab !== "right" && "hidden")}>
          <MixedVideoPlayer
            leftVideoId={null}
            rightVideoId={videos.right?.id || null}
            crossFaderValue={0}
            playing={playing}
            onPlayPause={handlePlayPause}
            preview={false}
            activeTemplate="single"
            mobileView={true}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 mt-8">
        <TabsList className="w-full grid grid-cols-3 gap-1 p-1">
          <TabsTrigger value="left" className="flex-1 px-8 py-3">Left</TabsTrigger>
          <TabsTrigger value="mix" className="flex-1 px-8 py-3">Mix</TabsTrigger>
          <TabsTrigger value="right" className="flex-1 px-8 py-3">Right</TabsTrigger>
        </TabsList>
        <TabsContent value="left" className="h-[calc(100%-3rem)] overflow-auto">
          <div className="px-0">
            <div className="mt-6">
              <SearchBar
                onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                onSearch={(query) => handleSearch(query, 'left')}
                videoId={videos.left?.id || null}
              />
            </div>
            <div className="mt-6">
              <RecommendedVideos
                videoId={videos.left?.id || null}
                onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                searchResults={leftSearchResults}
                isSearching={!!searchQueries.left}
                side="left"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="mix" className="h-[calc(100%-3rem)] overflow-auto">
          <div className="px-4">
            {mixControls}
          </div>
        </TabsContent>
        <TabsContent value="right" className="h-[calc(100%-3rem)] overflow-auto">
          <div className="px-0">
            <div className="mt-6">
              <SearchBar
                onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                onSearch={(query) => handleSearch(query, 'right')}
                videoId={videos.right?.id || null}
              />
            </div>
            <div className="mt-6">
              <RecommendedVideos
                videoId={videos.right?.id || null}
                onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                searchResults={rightSearchResults}
                isSearching={!!searchQueries.right}
                side="right"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Desktop Layout with Resizable Panels
  const renderDesktopLayout = () => (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-5rem)]">
      <ResizablePanel
        defaultSize={25}
        minSize={20}
        className={cn(
          "transition-all duration-300 ease-in-out",
          !showMixControls && "!min-w-0 !w-0 !basis-0"
        )}
      >
        <div className="h-full flex flex-col pr-4">
          {renderControls('left')}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className={cn(!showMixControls && "hidden")} />

      <ResizablePanel
        defaultSize={50}
        minSize={30}
        className={cn(
          "transition-all duration-300 ease-in-out",
          !showMixControls && "!basis-full"
        )}
      >
        <div className="h-full flex flex-col px-4">
          <div className={cn(
            "max-w-[600px] mx-auto w-full transition-all duration-300 ease-in-out",
            !showMixControls && "scale-150 origin-center mt-32"
          )}>
            {mainVideoPlayer}
            {showMixControls && mixControls}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className={cn(!showMixControls && "hidden")} />

      <ResizablePanel
        defaultSize={25}
        minSize={20}
        className={cn(
          "transition-all duration-300 ease-in-out",
          !showMixControls && "!min-w-0 !w-0 !basis-0"
        )}
      >
        <div className="h-full flex flex-col pl-4">
          {renderControls('right')}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="w-full px-6 sm:px-8 md:px-12 py-4 grid grid-cols-[2fr,5fr,2fr] items-center">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMixControls(!showMixControls)}
                className="gap-2 transition-colors duration-200"
              >
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Mix</span>
              </Button>
            )}
          </div>
          <div className="flex justify-center">
            <div className="text-foreground font-mono font-light text-2xl tracking-wider">
              mixtube
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
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

      <main className="flex-1 w-full px-6 sm:px-8 md:px-12 pb-8">
        {isMobile ? renderMobileLayout() : renderDesktopLayout()}
      </main>
    </div>
  );
}