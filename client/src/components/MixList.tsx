import { Card } from "@/components/ui/card";
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
          <Card key={mix.id} className="overflow-hidden group">
            <div className="relative">
              <div className="aspect-video w-full grid grid-cols-2 gap-0.5 bg-muted/20">
                <img
                  src={`https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${mix.leftVideoId}/0.jpg`;
                  }}
                />
                <img
                  src={`https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${mix.rightVideoId}/0.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="scale-90 group-hover:scale-100 transition-transform"
                    onClick={() => onPlayMix?.(mix)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Mix
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium truncate">{mix.title}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
