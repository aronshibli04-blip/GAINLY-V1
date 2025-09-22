import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepTrackingCardProps {
  className?: string;
}

export function SleepTrackingCard({ className }: SleepTrackingCardProps) {
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(4);

  const qualityLabels = {
    1: "Søvnløs",
    2: "Dårlig", 
    3: "OK",
    4: "Bra",
    5: "Perfekt"
  };

  const qualityColors = {
    1: "text-red-400",
    2: "text-orange-400", 
    3: "text-yellow-400",
    4: "text-green-400",
    5: "text-emerald-400"
  };

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400" />
            Sleep Tracking
          </CardTitle>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Today</div>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Hours
            </span>
            <span className="text-blue-400 font-semibold">{sleepHours}h</span>
          </div>
          
          {/* Hour Selector */}
          <div className="flex gap-1 flex-wrap">
            {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((hours) => (
              <Button
                key={hours}
                variant={sleepHours === hours ? "default" : "outline"}
                size="sm"
                onClick={() => setSleepHours(hours)}
                className={cn(
                  "text-xs px-2 py-1 h-7",
                  sleepHours === hours 
                    ? "bg-blue-500 text-white" 
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                )}
                data-testid={`sleep-hours-${hours}`}
              >
                {hours}h
              </Button>
            ))}
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm flex items-center gap-1">
              <Star className="w-4 h-4" />
              Quality
            </span>
            <span className={cn("font-semibold", qualityColors[sleepQuality as keyof typeof qualityColors])}>
              {qualityLabels[sleepQuality as keyof typeof qualityLabels]}
            </span>
          </div>
          
          {/* Quality Stars */}
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((quality) => (
              <Button
                key={quality}
                variant="ghost"
                size="sm"
                onClick={() => setSleepQuality(quality)}
                className="p-1 h-auto hover:bg-slate-700"
                data-testid={`sleep-quality-${quality}`}
              >
                <Star 
                  className={cn(
                    "w-6 h-6",
                    sleepQuality >= quality 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-slate-600"
                  )}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="text-center pt-2 border-t border-slate-600">
          <p className="text-slate-400 text-xs">
            {sleepHours >= 8 ? "Excellent sleep duration! 💤" : "Consider more sleep for better recovery"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}