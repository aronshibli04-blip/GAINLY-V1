import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { WeeklyNutritionCard } from "@/components/ui/weekly-nutrition-card";
import { SleepTrackingCard } from "@/components/ui/sleep-tracking-card";
import { StressTrackingCard } from "@/components/ui/stress-tracking-card";
import { cn } from "@/lib/utils";

interface TrackingCardsCarouselProps {
  className?: string;
}

export function TrackingCardsCarousel({ className }: TrackingCardsCarouselProps) {
  return (
    <div className={cn("relative", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
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
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-slate-600" data-testid="dot-nutrition"></div>
          <div className="w-2 h-2 rounded-full bg-slate-400" data-testid="dot-sleep"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600" data-testid="dot-stress"></div>
        </div>
      </Carousel>
    </div>
  );
}