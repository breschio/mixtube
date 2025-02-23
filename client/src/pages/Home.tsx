import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Edit2 } from "lucide-react"; 
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
import ReactPlayer from 'react-player';

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const [isEditMode, setIsEditMode] = useState(false); // Default to Watch mode
  const [activeTab, setActiveTab] = useState('left');
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
  const [volumes, setVolumes] = useState({ left: 0.5, right: 0.5 });
  const [crossFader, setCrossFader] = useState(0.6);
  const [searchQueries, setSearchQueries] = useState({ 
    left: '',  
    right: '' 
  });
  const [activeTemplate, setActiveTemplate] = useState<string>("side-by-side");
  const [showTransitionTooltip, setShowTransitionTooltip] = useState(false);
  const [userInteractedWithSlider, setUserInteractedWithSlider] = useState(false);
  const [videosReady, setVideosReady] = useState({ left: false, right: false });

  const { data: leftSearchResults, isLoading: leftSearchLoading } = useYoutubeSearch(searchQueries.left, {
    enabled: searchQueries.left.length >= 2
  });
  const { data: rightSearchResults, isLoading: rightSearchLoading } = useYoutubeSearch(searchQueries.right, {
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
    setUserInteractedWithSlider(true);
  };

  const handleCrossFaderChange = (value: number, userInitiated?: boolean) => {
    setCrossFader(value);
    if (userInitiated) {
      setUserInteractedWithSlider(true);
    }
  };

  const renderContent = () => {
    const mainVideoPlayer = (
      <div className={cn(
        "aspect-video bg-black rounded-lg overflow-hidden relative transition-all duration-500 ease-in-out",
        !isEditMode && "h-[80vh] max-h-[80vh] w-full max-w-[1000px] mx-auto" // Added max-width constraint
      )}>
        <MixedVideoPlayer
          leftVideoId={videos.left?.id || null}
          rightVideoId={videos.right?.id || null}
          crossFaderValue={crossFader}
          playing={playing && (!isEditMode || (videosReady.left && videosReady.right))}
          onPlayPause={handlePlayPause}
          preview={false}
          activeTemplate={activeTemplate}
          mobileView={isMobile}
        />
      </div>
    );

    if (!isEditMode) {
      return (
        <div className="space-y-4 transition-all duration-500 ease-in-out transform">
          {mainVideoPlayer}
          <div className="flex justify-center transition-opacity duration-500">
            <DJControls
              crossFader={crossFader}
              onCrossFaderChange={handleCrossFaderChange}
              leftVideoId={videos.left?.id}
              rightVideoId={videos.right?.id}
              forceShowTooltip={showTransitionTooltip}
            />
          </div>
        </div>
      );
    }

    if (isMobile) {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4 transition-all duration-500 ease-in-out">
          {mainVideoPlayer}
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="left" className="text-base py-2">Left</TabsTrigger>
            <TabsTrigger value="mix" className="text-base py-2">Mix</TabsTrigger>
            <TabsTrigger value="right" className="text-base py-2">Right</TabsTrigger>
          </TabsList>
          <TabsContent value="mix" className="mt-2 space-y-4">
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
          </TabsContent>
          <TabsContent value="left" className="mt-2 space-y-4">
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
              side="left"
            />
          </TabsContent>
          <TabsContent value="right" className="mt-2 space-y-4">
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
              side="right"
            />
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="grid grid-cols-[2fr,5fr,2fr] gap-16 transition-all duration-500 ease-in-out">
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videos.left?.id}`}
              width="100%"
              height="100%"
              playing={playing}
              muted={true}
              onReady={() => setVideosReady(prev => ({ ...prev, left: true }))}
              config={{
                youtube: {
                  playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 3,
                    cc_lang_pref: 'none',
                    start: 0
                  }
                }
              }}
            />
          </div>
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
            side="left"
          />
        </div>
        <div className="space-y-6 px-8 border-l border-r border-border/20">
          {mainVideoPlayer}
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
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videos.right?.id}`}
              width="100%"
              height="100%"
              playing={playing}
              muted={true}
              onReady={() => setVideosReady(prev => ({ ...prev, right: true }))}
              config={playerConfig}
            />
          </div>
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
            side="right"
          />
        </div>
      </div>
    );
  };

  const playerConfig = {
    youtube: {
      playerVars: {
        controls: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: 3, 
        cc_lang_pref: 'none', 
        start: 0
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="w-full px-6 sm:px-8 md:px-12 py-4 grid grid-cols-[2fr,5fr,2fr] items-center">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="gap-2 transition-colors duration-200"
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Watch</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              )}
            </Button>
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

      <main className={cn(
        "flex-1 w-full px-6 sm:px-8 md:px-12 pt-4 pb-8 transition-all duration-500 ease-in-out",
        !isEditMode && "flex items-center justify-center"
      )}>
        {renderContent()}
      </main>
    </div>
  );
}