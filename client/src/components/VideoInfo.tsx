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
  const [leftVideoInfo, setLeftVideoInfo] = useState({ title: '', channelTitle: '', videoId: '' });
  const [rightVideoInfo, setRightVideoInfo] = useState({ title: '', channelTitle: '', videoId: '' });
  const { toast } = useToast();

  useEffect(() => {
    setIsLiked(false);
    setLikes(initialLikes);
  }, [mixId, initialLikes]);
  
  // Get video information when videos are selected
  useEffect(() => {
    const getVideoInfo = () => {
      try {
        const leftPlayer = document.getElementById('left-player') as any;
        const rightPlayer = document.getElementById('right-player') as any;
        
        if (leftVideoSelected && leftPlayer?.getVideoData) {
          const data = leftPlayer.getVideoData();
          const videoId = leftPlayer.getVideoUrl().split('v=')[1];
          setLeftVideoInfo({
            title: data.title || '',
            channelTitle: data.author || '',
            videoId
          });
        }
        
        if (rightVideoSelected && rightPlayer?.getVideoData) {
          const data = rightPlayer.getVideoData();
          const videoId = rightPlayer.getVideoUrl().split('v=')[1];
          setRightVideoInfo({
            title: data.title || '',
            channelTitle: data.author || '',
            videoId
          });
        }
      } catch (error) {
        console.error('Error getting video data:', error);
      }
    };
    
    // Small delay to ensure the YouTube API is loaded
    const timer = setTimeout(getVideoInfo, 2000);
    return () => clearTimeout(timer);
  }, [leftVideoSelected, rightVideoSelected]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {!isCreateMode && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {channelTitle.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium" style={{ color: "#799FDC" }}> {/* Custom blue color for author */}
                    {channelTitle}
                  </span>
                </div>
                <h3 className="text-lg font-medium line-clamp-2 leading-[1.2] ml-0 text-white"> {/* White text for title and left-aligned */}
                  {title}
                </h3>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2"> {/* Moved controls up */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 px-3 h-9",
              isLiked && "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
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
              "gap-1.5 px-3 h-9",
              mixMode 
                ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                : "text-white hover:bg-blue-100/20"
            )}
            onClick={onToggleMixMode}
          >
            <Shuffle className="h-4 w-4" />
            Mix
          </Button>
        </div>
      </div>
      
      {/* Source Videos section removed */}
    </div>
  );
};

export default VideoInfo;