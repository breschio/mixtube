import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

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
      <h2 className="text-lg font-semibold mb-4">Recent Mixes</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {mixes.map((mix) => (
            <CarouselItem key={mix.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="relative overflow-hidden">
                  <div className="aspect-video w-full relative">
                    <div className="absolute inset-0 grid grid-cols-2 gap-1">
                      <img
                        src={`https://img.youtube.com/vi/${mix.leftVideoId}/mqdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={`https://img.youtube.com/vi/${mix.rightVideoId}/mqdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => onPlayMix?.(mix)}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm truncate">{mix.title}</h3>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
