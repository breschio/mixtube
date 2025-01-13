import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendedVideosProps {
  videoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

export default function RecommendedVideos({ videoId, onVideoSelect }: RecommendedVideosProps) {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: [`/api/youtube/related?v=${videoId}`],
    enabled: !!videoId,
  });

  if (!videoId || !videos?.length) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-xs font-bold text-primary/80">UP NEXT</h3>
      <div className="space-y-2">
        {videos.map((video: any) => (
          <Card 
            key={video.id}
            className={cn(
              "overflow-hidden transition-all duration-300",
              "hover:ring-1 hover:ring-primary/50"
            )}
          >
            <div className="flex gap-3 p-2">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-32 aspect-video object-cover rounded"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <p className="text-xs line-clamp-2 normal-case font-medium">
                  {video.title}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-1"
                  onClick={() => onVideoSelect(video.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Load
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}