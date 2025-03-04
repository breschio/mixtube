import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, User } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MixedVideoPlayer from "@/components/MixedVideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import { ThemeToggle } from "@/components/ThemeToggle";
import AuthModal from "@/components/AuthModal";
import { useMobile } from '@/hooks/use-mobile';
import SaveMixDialog from "@/components/SaveMixDialog";
import type { YouTubeVideo } from '@/lib/youtube';
import MixTemplates, { MixTemplate } from "@/components/MixTemplates";
import VideoPreview from "@/components/VideoPreview";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ResizablePanels";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MixList from "@/components/MixList";
import DJControls from "@/components/DJControls";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Mix {
  id: string;
  title: string;
  leftVideoId: string;
  leftTitle: string;
  leftChannel: string;
  rightVideoId: string;
  rightTitle: string;
  rightChannel: string;
  crossFaderValue: number;
  template: string;
  createdAt: string;
  likes?: number; 
}

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  startTime?: number;
  mixId?: string; 
  initialLikes?: number; 
}

export default function Home() {
  const user = useUser();
  const isMobile = useMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showMixControls, setShowMixControls] = useState(true); 
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("mix");
  const [currentMix, setCurrentMix] = useState<Mix | null>(null);
  const [videos, setVideos] = useState<{
    left: VideoInfo | null;
    right: VideoInfo | null;
  }>({
    left: null,
    right: null
  });
  const [isNewMode, setIsNewMode] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isPromptMode, setIsPromptMode] = useState(true);
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
  const [mixName, setMixName] = useState(''); 

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

  useEffect(() => {
    if (mixes.length > 0 && !currentMix && !isNewMode) {
      const latestMix = [...mixes].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      handlePlayMix(latestMix, false);
    }
  }, [mixes]);

  const handlePost = async (title: string) => {
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
          leftTitle: videos.left.title,
          leftChannel: videos.left.channelTitle,
          rightVideoId: videos.right.id,
          rightTitle: videos.right.title,
          rightChannel: videos.right.channelTitle,
          crossFaderValue: Math.round(crossFader * 100),
          template: activeTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mix');
      }

      const newMix = await response.json();
      setCurrentMix(newMix);
      await queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });

      toast({
        title: "Success",
        description: "Your mix has been saved",
      });
      setShowSaveDialog(false);
      setIsNewMode(false);
      setMixName(title);
    } catch (error) {
      console.error('Error saving mix:', error);
      toast({
        title: "Error",
        description: "Failed to save mix. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getVideoInfoFromMixes = (videoId: string): {title: string, channelTitle: string} | undefined => {
    for (const mix of mixes) {
      if (mix.leftVideoId === videoId) {
        return { title: mix.leftTitle || "Untitled Video", channelTitle: mix.leftChannel || "Unknown Channel" };
      }
      if (mix.rightVideoId === videoId) {
        return { title: mix.rightTitle || "Untitled Video", channelTitle: mix.rightChannel || "Unknown Channel" };
      }
    }
    return undefined;
  };

  const handleNewMix = () => {
    setIsButtonActive(true);
    setShowMixControls(true);
    setPlaying(false);
    setCrossFader(0.5);
    setActiveTab("mix");
    setIsNewMode(true);
    setVideos({
      left: null,
      right: null
    });
    setCurrentMix(null);
    setMixName(''); 
  };

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

  const handlePlayMix = async (mix: Mix, shouldAutoPlay: boolean = true) => {
    const leftInfo = getVideoInfoFromMixes(mix.leftVideoId);
    const rightInfo = getVideoInfoFromMixes(mix.rightVideoId);

    setVideos({
      left: {
        id: mix.leftVideoId,
        title: leftInfo?.title || "Video",
        channelTitle: leftInfo?.channelTitle || "Channel",
        thumbnail: `https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`
      },
      right: {
        id: mix.rightVideoId,
        title: rightInfo?.title || "Video",
        channelTitle: rightInfo?.channelTitle || "Channel",
        thumbnail: `https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`
      }
    });

    setCrossFader(mix.crossFaderValue / 100);
    setActiveTemplate(mix.template);
    setShowMixControls(true); 
    setCurrentMix(mix);
    setPlaying(shouldAutoPlay);
    setIsNewMode(false);

    try {
      await fetch(`/api/mixes/${mix.id}/view`, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleResetView = () => {
    setIsButtonActive(false);
    setShowMixControls(true); 
    setActiveTab("mix");
    setPlaying(false);
    setIsNewMode(false);

    if (currentMix) {
      handlePlayMix(currentMix);
    } else if (mixes.length > 0) {
      const latestMix = [...mixes].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      handlePlayMix(latestMix);
    }
  };

  const hasMixTitle = () => {
    return currentMix?.title || mixName || false;
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
        isPromptMode={isPromptMode}
        defaultMode="url"
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
    <Card className="mt-4"> 
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
      <div>
        <VideoInfo
          title={currentMix?.title || mixName || "New Mix"}
          channelTitle="MixTube"
          onToggleMixMode={() => setShowMixControls(!showMixControls)}
          mixMode={showMixControls}
          onSaveMix={(title) => {
            setMixName(title);
            handlePost(title);
          }}
          user={user}
          leftVideoSelected={!!videos.left?.id}
          rightVideoSelected={!!videos.right?.id}
          isCreateMode={isNewMode}
          mixId={currentMix?.id} 
          initialLikes={currentMix?.likes} 
        />
      </div>
      {showMixControls && !isNewMode && (
        <Card className="mt-4 bg-background border-y border-r border-border/50 rounded-r-lg">
          <div className="p-6">
            <DJControls
              crossFader={crossFader}
              onCrossFaderChange={handleCrossFaderChange}
              leftVideoId={videos.left?.id}
              rightVideoId={videos.right?.id}
              forceShowTooltip={showTransitionTooltip}
            />
            <div className="mt-8">
              <MixTemplates
                onSelectTemplate={handleTemplateSelect}
                activeTemplate={activeTemplate}
              />
            </div>
          </div>
        </Card>
      )}
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
          title={isNewMode ? (isPromptMode ? "Describe your mix" : "Name your mix") : videos.left?.title || "Untitled Mix"}
          channelTitle={videos.left?.channelTitle}
          onToggleMixMode={() => setShowMixControls(!showMixControls)}
          mixMode={showMixControls}
          onSaveMix={handlePost}
          user={user}
          leftVideoSelected={!!videos.left?.id}
          rightVideoSelected={!!videos.right?.id}
          isPromptMode={isPromptMode}
          onTogglePromptMode={() => setIsPromptMode(!isPromptMode)}
          isCreateMode={isNewMode}
          mixId={currentMix?.id} 
          initialLikes={currentMix?.likes} 
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
                  isPromptMode={isPromptMode}
                  defaultMode="url"
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
                  isPromptMode={isPromptMode}
                  defaultMode="url"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[calc(100vh-5rem)]"
    >
      {isNewMode ? (
        <>
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className={cn(
              "h-full flex flex-col pr-4",
              "transform transition-transform duration-300 ease-in-out",
              isNewMode ? "translate-x-0" : "-translate-x-full",
              "opacity-100"
            )}>
              {renderControls('left')}
            </div>
          </ResizablePanel>

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col px-4">
              <div className="relative w-full aspect-video">
                {mainVideoPlayer}
              </div>
              <div>
                <VideoInfo
                  title={isNewMode ? (isPromptMode ? "Describe your mix" : "Name your mix") : "New Mix"}
                  channelTitle="MixTube"
                  onToggleMixMode={() => setShowMixControls(!showMixControls)}
                  mixMode={showMixControls}
                  onSaveMix={(title) => {
                    setMixName(title);
                    handlePost(title);
                  }}
                  user={user}
                  leftVideoSelected={!!videos.left?.id}
                  rightVideoSelected={!!videos.right?.id}
                  isPromptMode={isPromptMode}
                  onTogglePromptMode={() => setIsPromptMode(!isPromptMode)}
                  isCreateMode={isNewMode}
                  mixId={currentMix?.id} 
                  initialLikes={currentMix?.likes} 
                />
              </div>
              {showMixControls && (
                <Card className="mt-4 bg-background border-y border-r border-border/50 rounded-r-lg"> 
                  <div className="p-6">
                    <DJControls
                      crossFader={crossFader}
                      onCrossFaderChange={handleCrossFaderChange}
                      leftVideoId={videos.left?.id}
                      rightVideoId={videos.right?.id}
                      forceShowTooltip={showTransitionTooltip}
                    />
                    <div className="mt-8">
                      <MixTemplates
                        onSelectTemplate={handleTemplateSelect}
                        activeTemplate={activeTemplate}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>

          <ResizablePanel defaultSize={25} minSize={20}>
            <div className={cn(
              "h-full flex flex-col pl-4",
              "transform transition-transform duration-300 ease-in-out",
              isNewMode ? "translate-x-0" : "translate-x-full",
              "opacity-100"
            )}>
              {renderControls('right')}
            </div>
          </ResizablePanel>
        </>
      ) : (
        <>
          <ResizablePanel
            defaultSize={70}
            minSize={65}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="h-full flex flex-col pr-4">
              <div className="relative w-full aspect-video">
                {mainVideoPlayer}
              </div>
              <div>
                <VideoInfo
                  title={currentMix?.title || mixName || "New Mix"}
                  channelTitle="MixTube"
                  onToggleMixMode={() => setShowMixControls(!showMixControls)}
                  mixMode={showMixControls}
                  onSaveMix={(title) => {
                    setMixName(title);
                    handlePost(title);
                  }}
                  user={user}
                  leftVideoSelected={!!videos.left?.id}
                  rightVideoSelected={!!videos.right?.id}
                  isCreateMode={isNewMode}
                  mixId={currentMix?.id} 
                  initialLikes={currentMix?.likes} 
                />
              </div>
              {showMixControls && (
                <Card className="mt-4 bg-background border-y border-r border-border/50 rounded-r-lg"> 
                  <div className="p-6">
                    <DJControls
                      crossFader={crossFader}
                      onCrossFaderChange={handleCrossFaderChange}
                      leftVideoId={videos.left?.id}
                      rightVideoId={videos.right?.id}
                      forceShowTooltip={showTransitionTooltip}
                    />
                    <div className="mt-8">
                      <MixTemplates
                        onSelectTemplate={handleTemplateSelect}
                        activeTemplate={activeTemplate}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>

          <ResizablePanel
            defaultSize={30}
            minSize={25}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="h-[calc(100vh-5rem)] flex flex-col pl-4">
              <div className="h-full overflow-auto"> {/*Corrected line */}
                <MixList
                  mixes={mixes}
                  onPlayMix={handlePlayMix}
                  className="h-full"
                />
              </div>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="font-sans font-[400] text-2xl tracking-wider hover:text-primary transition-colors duration-200 bg-transparent hover:bg-transparent p-0"
              onClick={handleResetView}
            >
              mixtube
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5",
                  isNewMode && "bg-accent text-accent-foreground hover:bg-accent/90"
                )}
                onClick={isNewMode ? handleResetView : handleNewMix}
              >
                {isNewMode ? (
                  <X className="h-4 w-4 transition-all duration-300 ease-in-out rotate-[360deg]" />
                ) : (
                  <Plus className={cn(
                    "h-4 w-4 transition-all duration-300 ease-in-out",
                    isButtonActive ? "rotate-[135deg]" : "rotate-0 hover:rotate-90"
                  )} />
                )}
                {isNewMode ? 'Close' : 'New'}
              </Button>
              <ThemeToggle />
              {!user ? (
                <AuthModal
                  defaultTab="sign-up"
                  trigger={
                    <Button variant="outline" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  }
                />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata.avatar_url || ''} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 pb-8">
          {isMobile ? renderMobileLayout() : renderDesktopLayout()}
        </div>
      </main>
      <SaveMixDialog
        open={showSaveDialog && !hasMixTitle()}
        onOpenChange={setShowSaveDialog}
        onSave={handlePost}
      />
    </div>
  );
}