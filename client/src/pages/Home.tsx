import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react"; 
import SearchBar from "@/components/SearchBar";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMobile } from '@/hooks/use-mobile';
import SaveMixDialog from "@/components/SaveMixDialog";
import type { YouTubeVideo } from '@/lib/youtube';
import MixTemplates, { MixTemplate } from "@/components/MixTemplates";
import VideoPreview from "@/components/VideoPreview";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ResizablePanels";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MixList from "@/components/MixList";
import DJControls from "@/components/DJControls";

interface VideoInfo extends YouTubeVideo {
  channelTitle: string;
  startTime?: number;
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const { toast } = useToast();
  const [showMixControls, setShowMixControls] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("mix");
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

  const queryClient = useQueryClient();

  const { data: mixes = [] } = useQuery({
    queryKey: ['/api/mixes'],
    queryFn: async () => {
      const response = await fetch('/api/mixes');
      if (!response.ok) {
        throw new Error('Failed to fetch mixes');
      }
      return response.json();
    }
  });

  const handleNewMix = () => {
    setVideos({
      left: null,
      right: null
    });
    setShowMixControls(true);
    setPlaying(false);
    setCrossFader(0.5);
    setActiveTab("left");
  };

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
  const [activeTemplate, setActiveTemplate] = useState<string>("side-by-side");
  const [showTransitionTooltip, setShowTransitionTooltip] = useState(false);

  const handleVideoSelect = (video: YouTubeVideo, target: 'left' | 'right') => {
    setVideos(prev => ({
      ...prev,
      [target]: { ...video, channelTitle: video.channelTitle || 'Unknown Channel' }
    }));
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

  const handlePlayMix = (mix: any) => {
    setVideos({
      left: {
        id: mix.leftVideoId,
        title: "Loading...",
        channelTitle: "Loading...",
        thumbnail: `https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`
      },
      right: {
        id: mix.rightVideoId,
        title: "Loading...",
        channelTitle: "Loading...",
        thumbnail: `https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`
      }
    });
    setCrossFader(mix.crossFaderValue / 100);
    setActiveTemplate(mix.template);
    // Don't enable mix mode when playing from sidebar
    setShowMixControls(false);
  };


  const handleSaveMix = async (title: string) => {
    if (!videos.left?.id || !videos.right?.id) {
      toast({
        title: "Incomplete Mix",
        description: "Please select both videos before saving",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/mixes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          leftVideoId: videos.left.id,
          rightVideoId: videos.right.id,
          crossFaderValue: Math.round(crossFader * 100),
          template: activeTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mix');
      }

      // Invalidate and refetch mixes after successful save
      await queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });

      toast({
        title: "Success",
        description: "Your mix has been saved",
      });
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving mix:', error);
      toast({
        title: "Error",
        description: "Failed to save mix. Please try again.",
        variant: "destructive"
      });
    }
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
        videoId={videos[side]?.id || null}
        autoFocus={side === 'left' && !videos.left?.id}
      />
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
        leftStartTime={videos.left?.startTime}
        rightStartTime={videos.right?.startTime}
      />
    </div>
  );

  const mixControls = (
    <Card className="mt-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <MixTemplates
            onSelectTemplate={handleTemplateSelect}
            activeTemplate={activeTemplate}
          />
        </div>
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

  const mainContent = (
    <>
      <div className="relative w-full aspect-video">
        {mainVideoPlayer}
      </div>
      <div className="border-t border-border/50">
        <VideoInfo
          title={videos.left?.title || "Untitled Mix"}
          channelTitle={videos.left?.channelTitle}
          onToggleMixMode={() => setShowMixControls(!showMixControls)}
          mixMode={showMixControls}
          onSaveMix={() => setShowSaveDialog(true)}
          user={user}
          leftVideoSelected={!!videos.left?.id}
          rightVideoSelected={!!videos.right?.id}
        />
      </div>
      {showMixControls && mixControls}
    </>
  );

  const renderMobileLayout = () => (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="relative">
        <MixedVideoPlayer
          leftVideoId={videos.left?.id || null}
          rightVideoId={videos.right?.id || null}
          crossFaderValue={crossFader}
          playing={playing}
          onPlayPause={handlePlayPause}
          preview={false}
          activeTemplate={showMixControls ? activeTemplate : "single"}
          mobileView={true}
          leftStartTime={videos.left?.startTime}
          rightStartTime={videos.right?.startTime}
        />
      </div>

      <div className="px-3 border-t border-border/50">
        <VideoInfo
          title={videos.left?.title || "Untitled Mix"}
          channelTitle={videos.left?.channelTitle}
          onToggleMixMode={() => setShowMixControls(!showMixControls)}
          mixMode={showMixControls}
          onSaveMix={() => setShowSaveDialog(true)}
          user={user}
          leftVideoSelected={!!videos.left?.id}
          rightVideoSelected={!!videos.right?.id}
        />
      </div>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out transform",
          showMixControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        )}
        style={{
          height: showMixControls ? 'calc(100% - 56.25vw - 4rem)' : '0',
          marginTop: showMixControls ? '1rem' : '0'
        }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
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
                  videoId={videos.left?.id || null}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="mix" className="h-[calc(100%-3rem)] overflow-auto">
            <div className="px-0">
              {mixControls}
            </div>
          </TabsContent>
          <TabsContent value="right" className="h-[calc(100%-3rem)] overflow-auto">
            <div className="px-0">
              <div className="mt-6">
                <SearchBar
                  onVideoSelect={(video) => handleVideoSelect(video, 'right')}
                  videoId={videos.right?.id || null}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

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
          !showMixControls && "!basis-[70%]"
        )}
      >
        <div className="h-full flex flex-col px-4">
          {mainContent}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className={cn(!showMixControls && "hidden")} />

      <ResizablePanel
        defaultSize={25}
        minSize={20}
        className={cn(
          "transition-all duration-300 ease-in-out",
          !showMixControls && "!basis-[30%]"
        )}
      >
        <div className="h-full flex flex-col pl-4">
          {showMixControls ? renderControls('right') : (
            <MixList 
              mixes={mixes} 
              onPlayMix={handlePlayMix}
              className="h-full overflow-y-auto"
            />
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  const handleResetView = () => {
    setShowMixControls(false);
    setActiveTab("mix");
    setPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="w-full px-6 sm:px-8 md:px-12 py-4 grid grid-cols-[2fr,5fr,2fr] items-center">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
          <div className="flex justify-center">
            {!isMobile && (
              <Button
                variant="ghost"
                className="font-mono font-light text-2xl tracking-wider hover:text-primary transition-colors duration-200 bg-transparent hover:bg-transparent"
                onClick={handleResetView}
              >
                mixtube
              </Button>
            )}
            {isMobile && (
              <Button
                variant="ghost"
                className="font-mono font-light text-2xl tracking-wider hover:text-primary transition-colors duration-200 bg-transparent hover:bg-transparent p-0"
                onClick={handleResetView}
              >
                mixtube
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleNewMix}
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
            {!user && (
              <AuthModal 
                defaultTab="sign-up"
                trigger={
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="hover:text-primary transition-colors duration-200"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                } 
              />
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
      <SaveMixDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveMix}
      />
    </div>
  );
}