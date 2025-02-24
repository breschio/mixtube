import { User, Share2, ThumbsUp, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  channelTitle = 'Unknown Channel',
  onToggleMixMode 
}: VideoInfoProps) {
  return (
    <div className="py-3">
      <h1 className="text-xl font-semibold mb-3 leading-tight">
        {title}
      </h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {channelTitle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {channelTitle}
            </span>
            <span className="text-xs text-muted-foreground">
              Subscriber count
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Like
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onToggleMixMode}>
            <Shuffle className="h-4 w-4" />
            Mix
          </Button>
        </div>
      </div>
    </div>
  );
}
