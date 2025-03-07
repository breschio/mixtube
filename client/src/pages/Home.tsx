import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, User, Shuffle } from "lucide-react";
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
import { MixList } from "@/components/MixList";
import DJControls from "@/components/DJControls";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import BorderBeam from "@/components/BorderBeam";

const ResizeHandle = () => {
  return (
    <div className="w-1 rounded-full mx-2 transition-colors hover:bg-primary/50" />
  );
};

interface Mix {
  id: number;
  title: string;
  leftVideoId: string;
  leftTitle: string;
  leftChannel: string;
  rightVideoId: string;
  rightTitle: string;
  rightChannel: string;
  crossFaderValue: number;
  audioFaderValue?: number; //Added audioFaderValue field
  template: string;
  createdAt: string;
  likes: number;
  views: number;
}

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  startTime?: number;
  mixId?: number;
  initialLikes?: number;
}

interface MixesResponse {
  mixes: Mix[];
  databaseConnected: boolean;
  message?: string;
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
  const [audioFader, setAudioFader] = useState(0.6);
  const [activeTemplate, setActiveTemplate] = useState<string>("side-by-side");
  const [showTransitionTooltip, setShowTransitionTooltip] = useState(false);
  const [mixName, setMixName] = useState('');
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [showDatabaseWarning, setShowDatabaseWarning] = useState(false);
  const [mobileTab, setMobileTab] = useState<'left' | 'mix' | 'right'>('left');


  const { data: mixesResponse } = useQuery<MixesResponse>({
    queryKey: ['/api/mixes'],
    queryFn: async () => {
      const response = await fetch('/api/mixes');
      if (!response.ok) {
        throw new Error('Failed to fetch mixes');
      }
      const data = await response.json();
      console.log('Fetched mixes from server:', data);
      return data;
    }
  });

  useEffect(() => {
    if (mixesResponse) {
      setDatabaseConnected(!!mixesResponse.databaseConnected);
      setShowDatabaseWarning(!mixesResponse.databaseConnected && mixesResponse.mixes.length === 0);
    }
  }, [mixesResponse]);

  const mixes = mixesResponse?.mixes || [];

  useEffect(() => {
    if (mixes.length > 0 && !currentMix && !isNewMode) {
      const mostLikedMix = getMostLikedMixes(mixes)[0];
      handlePlayMix(mostLikedMix, false);
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
          audioFaderValue: Math.round(audioFader * 100),
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
    setAudioFader(0.5);
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
    setAudioFader(template.crossFaderValue);
  };

  const handleCrossFaderChange = (value: number) => {
    setCrossFader(value);
  };

  const handleAudioFaderChange = (value: number) => {
    setAudioFader(value);
  };

  const handlePlayMix = async (mix: Mix, shouldAutoPlay: boolean = true) => {
    setVideos({
      left: {
        id: mix.leftVideoId,
        title: mix.leftTitle || "Video",
        channelTitle: mix.leftChannel || "Channel",
        thumbnail: `https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`,
        mixId: mix.id,
        initialLikes: mix.likes
      },
      right: {
        id: mix.rightVideoId,
        title: mix.rightTitle || "Video",
        channelTitle: mix.rightChannel || "Channel",
        thumbnail: `https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`,
        mixId: mix.id,
        initialLikes: mix.likes
      }
    });

    // Safely handle audio and cross fader values
    const crossFaderVal = typeof mix.crossFaderValue === 'number' ? mix.crossFaderValue / 100 : 0.5;

    // Debug the mix object to see what values we're getting
    console.log('Mix object:', JSON.stringify(mix, null, 2));

    // Explicit checking for audioFaderValue with defined fallback logic
    let audioValue;
    if (mix.audioFaderValue !== undefined && mix.audioFaderValue !== null) {
      audioValue = mix.audioFaderValue / 100;
      console.log('Using audio fader value from mix:', audioValue);
    } else {
      audioValue = mix.crossFaderValue / 100;
      console.log('Falling back to cross fader value for audio:', audioValue);
    }

    setAudioFader(audioValue);
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
      const latestMix = getMostLikedMixes(mixes)[0];
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
        audioFaderValue={audioFader}
        playing={playing}
        onPlayPause={handlePlayPause}
        preview={false}
        activeTemplate={activeTemplate}
        leftStartTime={videos.left?.startTime}
        rightStartTime={videos.right?.startTime}
      />
    </div>
  );

  const mixControls = (
    <Card className="bg-background">
      <div className="space-y-8 p-6">
        <DJControls
          crossFader={crossFader}
          audioFader={audioFader}
          onCrossFaderChange={handleCrossFaderChange}
          onAudioFaderChange={handleAudioFaderChange}
          leftVideoId={videos.left?.id}
          rightVideoId={videos.right?.id}
          leftVideoTitle={videos.left?.title}
          rightVideoTitle={videos.right?.title}
          leftChannelTitle={videos.left?.channelTitle}
          rightChannelTitle={videos.right?.channelTitle}
          forceShowTooltip={showTransitionTooltip}
          mixTemplates={<MixTemplates onSelectTemplate={handleTemplateSelect} activeTemplate={activeTemplate} />}
        />
      </div>
    </Card>
  );

  const mainContent = (
    <>
      <div className="relative w-full aspect-video">
        <MixedVideoPlayer
          leftVideoId={videos.left?.id || null}
          rightVideoId={videos.right?.id || null}
          crossFaderValue={crossFader}
          audioFaderValue={audioFader}
          playing={playing}
          onPlayPause={handlePlayPause}
          preview={false}
          activeTemplate={activeTemplate}
          leftStartTime={videos.left?.startTime}
          rightStartTime={videos.right?.startTime}
        />
      </div>
      <div className="mt-3">
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
          initialLikes={currentMix?.likes || 0}
          className="px-0"
        />
      </div>
      {showMixControls && !isNewMode && (
        <Card className="mt-4 bg-muted/30 border-y border-r border-border/50 rounded-r-lg">
          <div className="p-6">
            <DJControls
              crossFader={crossFader}
              audioFader={audioFader}
              onCrossFaderChange={handleCrossFaderChange}
              onAudioFaderChange={handleAudioFaderChange}
              leftVideoId={videos.left?.id}
              rightVideoId={videos.right?.id}
              leftVideoTitle={videos.left?.title}
              rightVideoTitle={videos.right?.title}
              leftChannelTitle={videos.left?.channelTitle}
              rightChannelTitle={videos.right?.channelTitle}
              forceShowTooltip={showTransitionTooltip}
              mixTemplates={<MixTemplates onSelectTemplate={handleTemplateSelect} activeTemplate={activeTemplate} />}
            />
          </div>
        </Card>
      )}
    </>
  );

  const renderMobileLayout = () => (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {mainContent}

      {isNewMode && (
        <div className="px-4 pt-4">
          <Tabs value={mobileTab} onValueChange={(value) => setMobileTab(value as 'left' | 'mix' | 'right')}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="left">Left</TabsTrigger>
              <TabsTrigger value="mix">Mix</TabsTrigger>
              <TabsTrigger value="right">Right</TabsTrigger>
            </TabsList>
            <TabsContent value="left" className="mt-4">
              {renderControls('left')}
            </TabsContent>
            <TabsContent value="mix" className="mt-4">
              {mixControls}
            </TabsContent>
            <TabsContent value="right" className="mt-4">
              {renderControls('right')}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="relative mt-4 flex-1 overflow-auto">
        {!isNewMode && (
          <MixList
            mixes={getMostLikedMixes(mixes)}
            onPlayMix={handlePlayMix}
            className="h-full"
          />
        )}
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
              "h-full flex flex-col pr-6",
              "transform transition-transform duration-300 ease-in-out",
              isNewMode ? "translate-x-0" : "-translate-x-full",
              "opacity-100"
            )}>
              {renderControls('left')}
            </div>
          </ResizablePanel>

          <ResizeHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col px-6 space-y-6">
              <div className="relative w-full aspect-video">
                {mainVideoPlayer}
              </div>
              <div className="mt-3">
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
                  initialLikes={currentMix?.likes || 0}
                  className="px-0"
                />
              </div>
              {showMixControls && (
                <Card className="mt-4 bg-muted/30 border-y border-r border-border/50 rounded-r-lg">
                  <div className="p-8 flex flex-col gap-8">
                    <DJControls
                      crossFader={crossFader}
                      audioFader={audioFader}
                      onCrossFaderChange={handleCrossFaderChange}
                      onAudioFaderChange={handleAudioFaderChange}
                      leftVideoId={videos.left?.id}
                      rightVideoId={videos.right?.id}
                      leftVideoTitle={videos.left?.title}
                      rightVideoTitle={videos.right?.title}
                      leftChannelTitle={videos.left?.channelTitle}
                      rightChannelTitle={videos.right?.channelTitle}
                      forceShowTooltip={showTransitionTooltip}
                      mixTemplates={<MixTemplates onSelectTemplate={handleTemplateSelect} activeTemplate={activeTemplate} />}
                    />
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>

          <ResizeHandle />

          <ResizablePanel
            defaultSize={25}
            minSize={20}
          >
            <div className={cn(
              "h-full flex flex-col pl-6",
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
            <div className="h-full flex flex-col pr-6">
              <div className="relative w-full aspect-video">
                {mainVideoPlayer}
              </div>
              <div className="mt-3">
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
                  initialLikes={currentMix?.likes || 0}
                  className="px-0"
                />
              </div>
              {showMixControls && (
                <Card className="mt-4 bg-muted/30 border-y border-r border-border/50 rounded-r-lg">
                  <div className="p-8 flex flex-col gap-8">
                    <DJControls
                      crossFader={crossFader}
                      audioFader={audioFader}
                      onCrossFaderChange={handleCrossFaderChange}
                      onAudioFaderChange={handleAudioFaderChange}
                      leftVideoId={videos.left?.id}
                      rightVideoId={videos.right?.id}
                      leftVideoTitle={videos.left?.title}
                      rightVideoTitle={videos.right?.title}
                      leftChannelTitle={videos.left?.channelTitle}
                      rightChannelTitle={videos.right?.channelTitle}
                      forceShowTooltip={showTransitionTooltip}
                      mixTemplates={<MixTemplates onSelectTemplate={handleTemplateSelect} activeTemplate={activeTemplate} />}
                    />
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>

          <ResizeHandle />

          <ResizablePanel
            defaultSize={30}
            minSize={25}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="h-[calc(100vh-5rem)] flex flex-col pl-6">
              <div className="h-full overflow-auto">
                <MixList mixes={getMostLikedMixes(mixes)} onPlayMix={handlePlayMix} className="h-full" />
                {mixes.length > 0 && !isNewMode && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Hot mixes</h2>
                    <div className="space-y-3">
                      {getMostLikedMixes(mixes).slice(0, 5).map((mix) => (
                        <div key={mix.id} onClick={() => handlePlayMix(mix)}>
                          <p>{mix.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );

  // Debug log to see what mixes we have
  useEffect(() => {
    if (mixes.length > 0) {
      console.log('Mixes available in component:', mixes);
      console.log('First mix audioFaderValue:', mixes[0]?.audioFaderValue);
    }
  }, [mixes]);


  const getMostLikedMixes = (mixesArray: Mix[]) => {
    return [...mixesArray].sort((a, b) => b.likes - a.likes);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      <header className="w-full bg-background flex-none">
        <div className="w-full max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shuffle className="h-7 w-7 text-[#455A7D] my-auto" />
              <Button
                variant="ghost"
                className="font-sans font-[400] text-2xl tracking-wider hover:text-primary transition-colors duration-200 bg-transparent hover:bg-transparent p-0"
                onClick={handleResetView}
              >
                mixtube
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="default"
                size="sm"
                className={cn(
                  "gap-1.5 px-3 h-9",
                  !isNewMode && "bg-blue-600 text-white hover:bg-blue-700"
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
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {showDatabaseWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded shadow-sm">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Database Not Connected</p>
                <p className="text-sm">This app is running with a mock database. Add DATABASE_URL to your deployment configuration.</p>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-[1200px] mx-auto px-6 h-full">
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