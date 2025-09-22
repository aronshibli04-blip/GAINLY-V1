import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StressTrackingCardProps {
  className?: string;
}

export function StressTrackingCard({ className }: StressTrackingCardProps) {
  const [stressLevel, setStressLevel] = useState<number>(2);

  const stressLabels = {
    1: "Veldig avslappet",
    2: "Avslappet", 
    3: "Nøytral",
    4: "Stresset",
    5: "Veldig stresset"
  };

  const stressColors = {
    1: "text-emerald-400",
    2: "text-green-400", 
    3: "text-yellow-400",
    4: "text-orange-400",
    5: "text-red-400"
  };

  const stressIcons = {
    1: TrendingDown,
    2: TrendingDown,
    3: Minus,
    4: TrendingUp,
    5: TrendingUp
  };

  const StressIcon = stressIcons[stressLevel as keyof typeof stressIcons];

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Stress Level
          </CardTitle>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Today</div>
          </div>
        </div>

        {/* Current Level Display */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StressIcon className={cn("w-6 h-6", stressColors[stressLevel as keyof typeof stressColors])} />
            <span className="text-2xl font-bold text-white">{stressLevel}</span>
          </div>
          <p className={cn("text-sm font-medium", stressColors[stressLevel as keyof typeof stressColors])}>
            {stressLabels[stressLevel as keyof typeof stressLabels]}
          </p>
        </div>

        {/* Level Selector */}
        <div className="space-y-2 mb-4">
          {[1, 2, 3, 4, 5].map((level) => {
            const IconComponent = stressIcons[level as keyof typeof stressIcons];
            return (
              <Button
                key={level}
                variant={stressLevel === level ? "default" : "outline"}
                onClick={() => setStressLevel(level)}
                className={cn(
                  "w-full justify-start gap-2 h-9",
                  stressLevel === level 
                    ? "bg-purple-500 text-white border-purple-400" 
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                )}
                data-testid={`stress-level-${level}`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs">{level} - {stressLabels[level as keyof typeof stressLabels]}</span>
              </Button>
            );
          })}
        </div>

        {/* Tips based on stress level */}
        <div className="text-center pt-2 border-t border-slate-600">
          <p className="text-slate-400 text-xs">
            {stressLevel <= 2 
              ? "Great! Keep up the good mental state 🧘‍♂️" 
              : stressLevel === 3 
              ? "Consider some relaxation techniques"
              : "Try deep breathing or a short walk 🚶‍♂️"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}