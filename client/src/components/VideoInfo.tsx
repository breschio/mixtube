import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PenLine, Shuffle, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

interface VideoInfoProps {
  title: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
  onSaveMix?: (title: string) => void;
  user?: any;
  leftVideoSelected: boolean;
  rightVideoSelected: boolean;
  isPromptMode?: boolean;
  onTogglePromptMode?: () => void;
  isCreateMode?: boolean;
  mixId?: number;
  initialLikes?: number;
  className?: string; 
}

const VideoInfo = ({ 
  title,
  channelTitle = 'Unknown Channel',
  onToggleMixMode,
  mixMode = true,
  onSaveMix,
  user,
  leftVideoSelected,
  rightVideoSelected,
  isPromptMode = true,
  onTogglePromptMode,
  isCreateMode = false,
  mixId,
  initialLikes = 0,
  className
}: VideoInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mixName, setMixName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const { toast } = useToast();

  useEffect(() => {
    setIsLiked(false);
    setLikes(initialLikes);
  }, [mixId, initialLikes]);

  const handleLike = async () => {
    if (!mixId) return;

    try {
      const response = await fetch(`/api/mixes/${mixId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      setIsLiked(true);
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error('Error liking mix:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like the mix",
      });
    }
  };

  const handleSave = async () => {
    if (!mixName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSaveMix?.(mixName);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCreateMode) {
    return (
      <div className={cn("py-2", className)}>
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
                    onClick={() => mixName.trim() ? handleSave() : setIsEditing(true)}
                    disabled={!leftVideoSelected || !rightVideoSelected || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Post"}
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
    <div className={cn("py-2", className)}> {/* Reduced spacing */}
      <div className="mb-2"> {/* Added margin */}
        <h2 className="text-lg font-medium leading-tight text-blue-600">Recent mixes</h2> {/* Added label */}
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
                <span className="text-sm font-medium text-blue-600"> {/* Blue text */}
                  {channelTitle}
                </span>
              </div>
              <h3 className="text-sm font-[400] line-clamp-2 leading-[1.1] mt-0.5 text-blue-600"> {/* Blue text & order changed */}
                {title}
              </h3>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2"> {/* Moved controls up */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 px-3 h-9 border border-blue-600 text-blue-600 hover:bg-blue-100", 
              isLiked && "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
            {/* Outline style and blue text */}
            onClick={handleLike}
            disabled={!mixId}
          >
            <ThumbsUp className={cn("h-4 w-4", isLiked && "rotate-12 transition-transform")} />
            {likes > 0 ? likes : "Like"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 px-3 h-9 border border-blue-600 text-blue-600 hover:bg-blue-100", {/* Outline style and blue text */}
              mixMode && "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
            onClick={onToggleMixMode}
          >
            <Shuffle className="h-4 w-4" />
            Mix
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;