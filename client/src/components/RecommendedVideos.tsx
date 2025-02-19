import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import type { YouTubeVideo } from '@/lib/youtube';
import { getRelatedVideos } from '@/lib/youtube';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (video: YouTubeVideo) => void;
  searchResults?: YouTubeVideo[];
  isSearching?: boolean;
  side?: 'left' | 'right';
}

// Parse video ID from YouTube URL
function getVideoIdFromUrl(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

// Default videos from CSV data
const DEFAULT_LEFT_VIDEOS: YouTubeVideo[] = [
  {
    id: getVideoIdFromUrl('https://www.youtube.com/watch?v=jGuVJHmo2hQ'),
    title: 'The Most Popular ASMR Triggers',
    channelTitle: 'Various',
    thumbnail: `https://img.youtube.com/vi/jGuVJHmo2hQ/mqdefault.jpg`
  }
];

const DEFAULT_RIGHT_VIDEOS: YouTubeVideo[] = [
  {
    id: getVideoIdFromUrl('https://www.youtube.com/watch?v=v3hpZ4HPIT4'),
    title: 'MINDSET IS EVERYTHING | Powerful Motivational Speeches',
    channelTitle: 'Various',
    thumbnail: `https://img.youtube.com/vi/v3hpZ4HPIT4/mqdefault.jpg`
  }
];

export default function RecommendedVideos({ 
  videoId, 
  onVideoSelect, 
  searchResults,
  isSearching = false,
  side = 'left'
}: RecommendedVideosProps) {
  const { data: recommendedVideos, isLoading } = useQuery({
    queryKey: ['related-videos', videoId],
    queryFn: async () => {
      if (!videoId) return side === 'left' ? DEFAULT_LEFT_VIDEOS : DEFAULT_RIGHT_VIDEOS;
      return getRelatedVideos(videoId);
    },
    enabled: !isSearching,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  const displayVideos = searchResults || recommendedVideos;
  const showLoading = isSearching || isLoading;

  if (showLoading) {
    return (
      <div className="flex-1 space-y-3">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="w-full overflow-hidden animate-pulse">
            <div className="flex gap-3 p-3">
              <div className="w-32 aspect-video bg-muted rounded-md" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!displayVideos?.length) {
    const defaultVideos = side === 'left' ? DEFAULT_LEFT_VIDEOS : DEFAULT_RIGHT_VIDEOS;
    return (
      <div className="flex-1 space-y-3">
        {defaultVideos.map((video) => (
          <VideoCard 
            key={video.id}
            video={video}
            onSelect={() => onVideoSelect(video)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3">
      {displayVideos.slice(0, 10).map((video) => (
        <VideoCard 
          key={video.id}
          video={video}
          onSelect={() => onVideoSelect(video)}
        />
      ))}
    </div>
  );
}

interface VideoCardProps {
  video: YouTubeVideo;
  onSelect: () => void;
}

function VideoCard({ video, onSelect }: VideoCardProps) {
  const initial = video.channelTitle?.[0]?.toUpperCase() || '?';

  return (
    <Card className="overflow-hidden border border-border/50 hover:bg-accent/5 transition-colors">
      <div className="flex gap-3 p-3">
        <div className="relative w-32 aspect-video rounded-md overflow-hidden">
          <img 
            src={video.thumbnail}
            alt={video.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-snug line-clamp-2 text-sm mb-1">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {video.channelTitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="default"
              className="bg-primary/80 hover:bg-primary transition-colors shrink-0 ml-auto"
              onClick={onSelect}
            >
              Load
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}