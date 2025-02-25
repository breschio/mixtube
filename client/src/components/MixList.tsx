import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mix {
  id: number;
  title: string;
  leftVideoId: string;
  rightVideoId: string;
  crossFaderValue: number;
  template: string;
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

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold">Recent Mixes</h2>
      <div className="space-y-3">
        {mixes.map((mix) => (
          <div key={mix.id} className="group cursor-pointer" onClick={() => onPlayMix?.(mix)}>
            <div className="relative">
              <div className="aspect-video w-full grid grid-cols-2 gap-0.5 bg-muted/20">
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
              <div className="py-2">
                <h3 className="text-sm font-medium truncate">{mix.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}