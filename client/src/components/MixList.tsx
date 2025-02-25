import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Mix {
  id: number;
  title: string;
  leftVideoId: string;
  rightVideoId: string;
  crossFaderValue: number;
  template: string;
  views: number;
  createdAt: string;
}

interface MixListProps {
  mixes: Mix[];
  onPlayMix?: (mix: Mix) => void;
  className?: string;
}

export default function MixList({ mixes, onPlayMix, className }: MixListProps) {
  if (!mixes?.length) {
    return null;
  }

  // Helper function to format the timestamp
  const formatTimeAgo = (date: Date) => {
    const formatted = formatDistanceToNow(date)
      .replace('about ', '')
      .replace('hours', 'hrs')
      .replace('hour', 'hr');
    return formatted;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold mb-6">Recent Mixes</h2>
      <div className="space-y-4">
        {mixes.map((mix) => (
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
                <h3 className="text-sm lg:text-sm md:text-xs sm:text-xs font-medium line-clamp-2 leading-tight mb-0.5">{mix.title}</h3>
                <div className="text-[11px] lg:text-[11px] md:text-[10px] sm:text-[10px] text-muted-foreground leading-tight mt-1">
                  <div className="truncate">MixTube</div>
                  <div className="flex items-center gap-1 mt-0.5 truncate">
                    <span className="min-w-fit">{mix.views.toLocaleString()} views</span>
                    <span className="min-w-fit">•</span>
                    <span className="truncate">{formatTimeAgo(new Date(mix.createdAt))} ago</span>
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