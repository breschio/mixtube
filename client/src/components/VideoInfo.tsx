import { User, Share2, ThumbsUp, Shuffle, Monitor, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
  onSaveMix?: () => void;
  user?: any;
  leftVideoSelected: boolean; // Added
  rightVideoSelected: boolean; // Added
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = false,
  onSaveMix,
  user,
  leftVideoSelected, // Added
  rightVideoSelected // Added
}: VideoInfoProps) {
  if (mixMode) {
    return (
      <div className="py-3 px-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3"
              onClick={() => onSaveMix?.()}
              disabled={!user || !leftVideoSelected || !rightVideoSelected} // Modified
            >
              <Upload className="h-4 w-4" />
              Post
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 h-8 px-3" 
              onClick={onToggleMixMode}
            >
              <Monitor className="h-4 w-4" />
              Watch
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-base font-medium mb-2 leading-tight">
        {title}
      </h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {channelTitle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">
            {channelTitle}
          </span>
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
            Mix
          </Button>
        </div>
      </div>
    </div>
  );
}