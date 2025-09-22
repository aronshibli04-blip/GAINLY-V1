import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { WeeklyNutritionCard } from "@/components/ui/weekly-nutrition-card";
import { SleepTrackingCard } from "@/components/ui/sleep-tracking-card";
import { StressTrackingCard } from "@/components/ui/stress-tracking-card";
import { cn } from "@/lib/utils";

interface TrackingCardsCarouselProps {
  className?: string;
}

export function TrackingCardsCarousel({ className }: TrackingCardsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
            <WeeklyNutritionCard />
          </CarouselItem>
          
          <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
            <SleepTrackingCard />
          </CarouselItem>
          
          <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
            <StressTrackingCard />
          </CarouselItem>
        </CarouselContent>
        
        {/* Dots indicator for all screen sizes */}
        <div className="flex justify-center gap-2 mt-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentSlide === index ? 'bg-white' : 'bg-slate-600'
              }`}
              data-testid={`dot-${index === 0 ? 'nutrition' : index === 1 ? 'sleep' : 'stress'}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}