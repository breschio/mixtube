import { Button } from "@/components/ui/button";
import { Play, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Eye } from "lucide-react";

interface Mix {
  id: number;
  title: string;
  leftVideoId: string;
  rightVideoId: string;
  crossFaderValue: number;
  template: string;
  views: number;
  likes: number;
  createdAt: string;
  author: string; // Added author field
}

interface MixListProps {
  mixes: Mix[];
  onPlayMix?: (mix: Mix) => void;
  className?: string;
}

type SortType = "hot" | "new";

// MixCard component for Recent mixes section
export function MixCard({ mix, onSelect }: { mix: Mix; onSelect: () => void }) {
  return (
    <div
      className="group border border-theme-border rounded-lg overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors"
      onClick={onSelect}
    >
      <div className="flex gap-3 p-3">
        <div className="grid grid-cols-2 gap-1 w-24 h-14 overflow-hidden rounded">
          <div className="relative bg-muted/20">
            <img
              src={`https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${mix.leftVideoId}/0.jpg`;
              }}
            />
          </div>
          <div className="relative bg-muted/20">
            <img
              src={`https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${mix.rightVideoId}/0.jpg`;
              }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-snug line-clamp-2 text-sm mb-1">
              {mix.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ThumbsUp className="h-3 w-3" /> {mix.likes || 0}
            <Eye className="h-3 w-3 ml-2" /> {mix.views || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MixList({ mixes, onPlayMix, className }: MixListProps) {
  const [activeSort, setActiveSort] = useState<SortType>("hot");

  const sortedMixes = useMemo(() => {
    if (!mixes?.length) return [];

    const sortedArray = [...mixes];
    switch (activeSort) {
      case "hot":
        // Sort by combined score of likes and views (descending)
        return sortedArray.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
      case "new":
        // Sort by most recent creation date (descending)
        return sortedArray.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return sortedArray;
    }
  }, [mixes, activeSort]);

  if (!mixes?.length) {
    return null;
  }

  // Helper function to format the timestamp
  const formatTimeAgo = (date: Date) => {
    const formatted = formatDistanceToNow(date)
      .replace("about ", "")
      .replace("hours", "hrs")
      .replace("hour", "hr");
    return formatted;
  };

  const Label = () => (
    <div className="text-sm font-medium mb-2 text-primary">
      Recent mixes
    </div>
  );

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="shrink-0 mb-6">
        <Tabs value={activeSort} onValueChange={(value) => setActiveSort(value as SortType)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-muted/30">
            <TabsTrigger value="hot" className="text-xs font-medium text-primary">
              Hot
            </TabsTrigger>
            <TabsTrigger value="new" className="text-xs font-medium text-primary">
              New
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="space-y-4 overflow-y-auto flex-1">
        <Label /> {/* Added label */}
        {sortedMixes.map((mix) => (
          <div key={mix.id} className="group cursor-pointer hover:bg-accent/5 rounded-lg p-2" onClick={() => onPlayMix?.(mix)}>
            <div className="flex gap-3">
              <div className="relative shrink-0" style={{ width: "120px" }}>
                <div className="aspect-video grid grid-cols-2 gap-0.5 bg-muted/20 rounded-md overflow-hidden">
                  <div className="relative bg-muted/20">
                    <img
                      src={`https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${mix.leftVideoId}/0.jpg`;
                      }}
                    />
                  </div>
                  <div className="relative bg-muted/20">
                    <img
                      src={`https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${mix.rightVideoId}/0.jpg`;
                      }}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="scale-90 group-hover:scale-100 transition-transform"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="text-[11px] text-muted-foreground leading-tight mb-1"> {/* Moved author above title */}
                  <div className="truncate">{mix.author}</div> {/* Added author display */}
                </div>
                <h3 className="text-sm font-[400] line-clamp-2 leading-[1.1] mb-0.5">{mix.title}</h3>
                <div className="text-[11px] text-muted-foreground leading-tight mt-1">
                  <div className="flex items-center gap-2 mt-2 truncate">
                    <span className="flex items-center gap-0.5 min-w-fit">
                      <ThumbsUp className="h-3 w-3" />
                      {mix.likes}
                    </span>
                    <span className="flex items-center gap-0.5 min-w-fit">
                      <Play className="h-3 w-3" />
                      {mix.views.toLocaleString()}
                    </span>
                    <span className="truncate">• {formatTimeAgo(new Date(mix.createdAt))} ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}