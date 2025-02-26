import { User, Share2, ThumbsUp, Shuffle, Monitor, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
  onSaveMix?: () => void;
  user?: any;
  leftVideoSelected: boolean;
  rightVideoSelected: boolean;
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = false,
  onSaveMix,
  user,
  leftVideoSelected,
  rightVideoSelected
}: VideoInfoProps) {
  if (mixMode) {
    return (
      <div className="py-3 px-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-8 px-3"
                      onClick={() => onSaveMix?.()}
                      disabled={!leftVideoSelected || !rightVideoSelected}
                    >
                      <Upload className="h-4 w-4" />
                      Post
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {(!leftVideoSelected || !rightVideoSelected) 
                    ? "Select both videos to save" 
                    : "Save your mix"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={mixMode}
                onCheckedChange={onToggleMixMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>
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
          <div className="flex items-center gap-2 h-8 px-2">
            <span className="text-sm text-muted-foreground">Mix</span>
            <Switch
              checked={mixMode}
              onCheckedChange={onToggleMixMode}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}