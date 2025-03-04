import { Share2, ThumbsUp, Sparkles, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface VideoInfoProps {
  title: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
  onSaveMix?: () => void;
  user?: any;
  leftVideoSelected: boolean;
  rightVideoSelected: boolean;
  isPromptMode?: boolean;
  onTogglePromptMode?: () => void;
  isCreateMode?: boolean;
  mixId?: number;
  likes?: number;
  isLiked?: boolean;
}

export default function VideoInfo({
  title,
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = false,
  onSaveMix,
  user,
  leftVideoSelected,
  rightVideoSelected,
  isPromptMode = true,
  onTogglePromptMode,
  isCreateMode = false,
  mixId,
  likes = 0,
  isLiked = false
}: VideoInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mixName, setMixName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/mixes/${mixId}/like`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to like mix');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mixes'] });
    }
  });

  const handleShare = async () => {
    if (!mixId) {
      toast({
        title: "Cannot share",
        description: "Save the mix first to generate a shareable link.",
        variant: "destructive"
      });
      return;
    }

    const url = `${window.location.origin}/mix/${mixId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The mix URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the URL manually.",
        variant: "destructive"
      });
    }
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  if (isCreateMode) {
    return (
      <div className="py-2 px-1">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <Input
                value={mixName}
                onChange={(e) => setMixName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                placeholder="Name your mix"
                className="text-lg font-medium"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 group w-full"
              >
                <span className="text-lg font-medium text-muted-foreground/60 group-hover:text-muted-foreground transition-colors text-left flex-1">
                  {mixName || "Name your mix"}
                </span>
                <PenLine className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
              </button>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      (!leftVideoSelected || !rightVideoSelected) ? "opacity-50" : "hover:bg-accent/90"
                    )}
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
        </div>
      </div>
    );
  }

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
          {!isCreateMode && (
            <>
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
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-4 group",
                  isLiked && "text-primary"
                )}
                onClick={handleLike}
              >
                <ThumbsUp className={cn(
                  "h-4 w-4 mr-2 transition-transform group-hover:scale-125",
                  isLiked && "fill-current"
                )} />
                {!isLiked ? (
                  "Like"
                ) : (
                  <span className="tabular-nums">{likes}</span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </>
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