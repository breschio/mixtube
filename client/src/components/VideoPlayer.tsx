import { Card } from '@/components/ui/card';
import { Music2, ExternalLink } from 'lucide-react';

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
      <Card className="bg-muted/50 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Select a video to play</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border/50">
      <div className="flex gap-2 p-1.5">
        <img 
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={videoTitle}
          className="w-24 aspect-video object-cover rounded"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="space-y-1">
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
              <h3 className="font-medium leading-none line-clamp-2 text-sm">
                {videoTitle || 'Untitled Video'}
                <ExternalLink className="inline ml-1 h-4 w-4"/>
              </h3>
            </a>
            <a href={`https://www.youtube.com/channel/${channelTitle}`} target="_blank" rel="noopener noreferrer">
              <p className="text-xs text-muted-foreground">
                {channelTitle || 'Unknown Channel'}
                <ExternalLink className="inline ml-1 h-4 w-4"/>
              </p>
            </a>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="shrink-0 rounded-full bg-muted p-1.5">
              <Music2 className="h-3 w-3" />
            </div>
            <span className="text-xs text-muted-foreground capitalize">{side} deck</span>
          </div>
        </div>
      </div>
    </Card>
  );
}