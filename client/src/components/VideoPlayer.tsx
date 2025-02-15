import { Card } from '@/components/ui/card';
import { Music2 } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  videoTitle?: string;
  channelTitle?: string;
  side: 'left' | 'right';
}

export default function VideoPlayer({ 
  videoId, 
  videoTitle = '',
  channelTitle = '',
  side,
}: VideoPlayerProps) {
  if (!videoId) {
    return (
      <Card className="aspect-video bg-muted/50 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Select a video to play</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="aspect-video relative">
        <img 
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={videoTitle}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-muted p-2">
            <Music2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium leading-none truncate">
              {videoTitle || 'Untitled Video'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {channelTitle || 'Unknown Channel'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}