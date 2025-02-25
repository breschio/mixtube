import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mix {
  id: number;
  title: string;
  leftVideoId: string;
  rightVideoId: string;
  crossFaderValue: number;
  template: string;
}

interface MixCarouselProps {
  mixes: Mix[];
  onPlayMix?: (mix: Mix) => void;
}

export default function MixCarousel({ mixes, onPlayMix }: MixCarouselProps) {
  if (!mixes?.length) {
    return null;
  }

  return (
    <div className="w-full relative">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {mixes.map((mix) => (
            <CarouselItem key={mix.id} className="basis-1/4">
              <div className="p-1">
                <Card className="relative overflow-hidden group">
                  <div className="aspect-video w-full relative">
                    <div className="absolute inset-0 grid grid-cols-2 gap-1">
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
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="scale-90 group-hover:scale-100 transition-transform"
                        onClick={() => onPlayMix?.(mix)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm truncate">{mix.title}</h3>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-none hover:bg-background">
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-none hover:bg-background">
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </Carousel>
    </div>
  );
}