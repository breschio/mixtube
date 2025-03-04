import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PenLine, Sparkles, SplitSquareHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export default function VideoInfo({ 
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
  isCreateMode = false
}: VideoInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mixName, setMixName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            mixMode && "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
          onClick={onToggleMixMode}
        >
          <SplitSquareHorizontal className="h-4 w-4" />
          Mix
        </Button>
      </div>
    </div>
  );
}