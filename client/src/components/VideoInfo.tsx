import { User, Share2, ThumbsUp, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = false 
}: VideoInfoProps) {
  return (
    <div className="py-2">
      <h1 className="text-base font-medium mb-2 leading-tight">
        {title}
      </h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {channelTitle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {channelTitle}
            </span>
            <span className="text-xs text-muted-foreground">
              Subscriber count
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
            <ThumbsUp className="h-4 w-4" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={onToggleMixMode}>
            <Shuffle className="h-4 w-4" />
            {mixMode ? 'Watch' : 'Mix'}
          </Button>
        </div>
      </div>
    </div>
  );
}