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
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-6">Recent Mixes</h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full mx-auto max-w-5xl"
        >
          <CarouselContent>
            {mixes.map((mix) => (
              <CarouselItem key={mix.id} className="md:basis-2/3 lg:basis-3/4">
                <div className="p-1">
                  <Card className="relative overflow-hidden group">
                    <div className="aspect-video w-full relative">
                      <div className="absolute inset-0 grid grid-cols-2 gap-1">
                        <img
                          src={`https://img.youtube.com/vi/${mix.leftVideoId}/maxresdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <img
                          src={`https://img.youtube.com/vi/${mix.rightVideoId}/maxresdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="scale-90 group-hover:scale-100 transition-transform"
                          onClick={() => onPlayMix?.(mix)}
                        >
                          <Play className="h-6 w-6 mr-2" />
                          Play Mix
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg truncate">{mix.title}</h3>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 lg:-left-12 bg-background/80 backdrop-blur-sm border-none hover:bg-background">
            <ChevronLeft className="h-8 w-8" />
          </CarouselPrevious>
          <CarouselNext className="right-4 lg:-right-12 bg-background/80 backdrop-blur-sm border-none hover:bg-background">
            <ChevronRight className="h-8 w-8" />
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
}