import { useState } from "react";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  const [searchQueries, setSearchQueries] = useState({ left: '', right: '' });
  const [activeTemplate, setActiveTemplate] = useState<string>("side-by-side");
  const [showTransitionTooltip, setShowTransitionTooltip] = useState(false);

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
    // If starting playback, transition to right
    if (!playing) {
      // Show tooltip during transition
      setShowTransitionTooltip(true);

      // Start from center
      setCrossFader(0.5);
      // Create a gradual 1.5-second transition through multiple steps
      const steps = 90; // Increased steps for even smoother transition
      const increment = 0.1 / steps; // Total movement is 0.1 (from 0.5 to 0.6)
      const timePerStep = 1500 / steps; // 1.5 seconds total duration

      // Create steps for smooth transition
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          setCrossFader(0.5 + (increment * i));
          // Hide tooltip after last step
          if (i === steps) {
            setTimeout(() => setShowTransitionTooltip(false), 1000);
          }
        }, timePerStep * i);
      }
    }
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
                forceShowTooltip={showTransitionTooltip}
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
                side="left"
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
                side="right"
              />
            </div>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="grid grid-cols-[2fr,5fr,2fr] gap-16">
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
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
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
          </div>

          <MixTemplates
            onSelectTemplate={handleTemplateSelect}
            activeTemplate={activeTemplate}
          />
          <DJControls
            crossFader={crossFader}
            onCrossFaderChange={setCrossFader}
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-background">
        <div className="w-full px-6 sm:px-8 md:px-12 py-4 grid grid-cols-[2fr,5fr,2fr] items-center">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div className="flex justify-center">
            <div className="text-foreground font-mono text-2xl">
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

      <main className="flex-1 w-full px-6 sm:px-8 md:px-12 py-8">
        {renderContent()}
      </main>
    </div>
  );
}