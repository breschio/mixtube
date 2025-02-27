import { Share2, ThumbsUp, Sparkles, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
  onSaveMix?: () => void;
  user?: any;
  leftVideoSelected: boolean;
  rightVideoSelected: boolean;
  isPromptMode?: boolean;
  onTogglePromptMode?: () => void;
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = false,
  onSaveMix,
  user,
  leftVideoSelected,
  rightVideoSelected,
  isPromptMode = true,
  onTogglePromptMode
}: VideoInfoProps) {
  return (
    <div className="py-4 px-1">
      <div className="flex items-center justify-between mb-2.5">
        <h1 className="text-lg font-medium leading-tight flex items-center gap-2">
          {title}
          {mixMode && onTogglePromptMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 hover:bg-accent/50"
                    onClick={onTogglePromptMode}
                  >
                    {isPromptMode ? (
                      <Sparkles className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                    ) : (
                      <PenLine className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isPromptMode ? "Switch to manual mode" : "Switch to AI prompt mode"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h1>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {channelTitle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {channelTitle}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-9 px-4">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="h-9 px-4">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {mixMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4"
                      onClick={() => onSaveMix?.()}
                      disabled={!leftVideoSelected || !rightVideoSelected}
                    >
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
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Mix</span>
          <Switch
            checked={mixMode}
            onCheckedChange={onToggleMixMode}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
}