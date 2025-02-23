import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react"; 
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
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ResizablePanels";
import VideoPreview from "@/components/VideoPreview";

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
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

  const { data: leftSearchResults, isLoading: leftSearchLoading } = useYoutubeSearch(searchQueries.left, {
    enabled: searchQueries.left.length >= 2
  });
  const { data: rightSearchResults, isLoading: rightSearchLoading } = useYoutubeSearch(searchQueries.right, {
    enabled: searchQueries.right.length >= 2
  });

  // Common player config
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
        origin: window.location.origin,
        enablejsapi: 1,
        mute: 0,
        fs: 0,
        disablekb: 1
      }
    }
  };

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

  const mainVideoPlayer = (
    <div className={cn(
      "aspect-video bg-black rounded-lg overflow-hidden relative transition-all duration-500 ease-in-out",
      !isEditMode && "h-[80vh] max-h-[80vh] w-full max-w-[1000px] mx-auto"
    )}>
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

  const renderContent = () => {
    return (
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-5rem)]">
        <ResizablePanel
          defaultSize={30}
          minSize={25}
          collapsible
          collapsedSize={4}
          onCollapse={setLeftPanelCollapsed}
          isCollapsed={leftPanelCollapsed}
          className="transition-all duration-300 ease-in-out"
        >
          <div className="h-full flex flex-col pr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="h-6 w-6 p-0 self-end mb-2"
            >
              {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {!leftPanelCollapsed && (
              <Tabs defaultValue="left" className="flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="left">Left Video</TabsTrigger>
                  <TabsTrigger value="right">Right Video</TabsTrigger>
                </TabsList>
                <TabsContent value="left" className="flex-1 mt-4">
                  <div className="h-full flex flex-col">
                    <VideoPreview
                      videoId={videos.left?.id || null}
                      playing={videoStates.left.playing}
                      onPlayPause={() => {
                        setVideoStates(prev => ({
                          ...prev,
                          left: { ...prev.left, playing: !prev.left.playing }
                        }));
                      }}
                      volume={videoStates.left.volume}
                      onVolumeChange={(value) => {
                        setVideoStates(prev => ({
                          ...prev,
                          left: { ...prev.left, volume: value }
                        }));
                      }}
                      className="mb-4"
                    />
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'left')}
                      onSearch={(query) => handleSearch(query, 'left')}
                      videoId={videos.left?.id || null}
                    />
                    <div className="flex-1 overflow-auto mt-4">
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
                <TabsContent value="right" className="flex-1 mt-4">
                  <div className="h-full flex flex-col">
                    <VideoPreview
                      videoId={videos.right?.id || null}
                      playing={videoStates.right.playing}
                      onPlayPause={() => {
                        setVideoStates(prev => ({
                          ...prev,
                          right: { ...prev.right, playing: !prev.right.playing }
                        }));
                      }}
                      volume={videoStates.right.volume}
                      onVolumeChange={(value) => {
                        setVideoStates(prev => ({
                          ...prev,
                          right: { ...prev.right, volume: value }
                        }));
                      }}
                      className="mb-4"
                    />
                    <SearchBar
                      onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                      onSearch={(query) => handleSearch(query, 'right')}
                      videoId={videos.right?.id || null}
                    />
                    <div className="flex-1 overflow-auto mt-4">
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
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={70}
          minSize={40}
          collapsible
          collapsedSize={4}
          onCollapse={setRightPanelCollapsed}
          isCollapsed={rightPanelCollapsed}
          className="transition-all duration-300 ease-in-out"
        >
          <div className="h-full flex flex-col pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="h-6 w-6 p-0 self-end mb-2"
            >
              {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>

            {!rightPanelCollapsed && (
              <div className="space-y-4 max-w-[600px] mx-auto w-full">
                {mainVideoPlayer}
                <div className="flex flex-col gap-4">
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
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
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
        "flex-1 w-full px-6 sm:px-8 md:px-12 pb-8 transition-all duration-500 ease-in-out",
        !isEditMode && "flex items-center justify-center pt-4"
      )}>
        {renderContent()}
      </main>
    </div>
  );
}