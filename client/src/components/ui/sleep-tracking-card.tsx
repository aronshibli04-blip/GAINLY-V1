import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Moon, Clock, Coffee, Smartphone, Dumbbell, Brain, UtensilsCrossed, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepTrackingCardProps {
  className?: string;
}

export function SleepTrackingCard({ className }: SleepTrackingCardProps) {
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [weeklyData] = useState([7.5, 8, 6.5, 8, 7, 8.5, 8]); // Mock weekly sleep data

  const quickHourOptions = [6, 7, 8, 9];
  const sleepGoal = 8; // Fixed 8h goal

  const sleepFactors = [
    { id: "caffeine", label: "Koffein", icon: Coffee, color: "bg-amber-500" },
    { id: "screen", label: "Skjermtid", icon: Smartphone, color: "bg-blue-500" },
    { id: "exercise", label: "Trening", icon: Dumbbell, color: "bg-green-500" },
    { id: "stress", label: "Stress", icon: Brain, color: "bg-purple-500" },
    { id: "food", label: "Mat", icon: UtensilsCrossed, color: "bg-orange-500" },
    { id: "alcohol", label: "Alkohol", icon: Wine, color: "bg-red-500" }
  ];

  const getQualityColor = (quality: number) => {
    if (quality <= 3) return "text-red-400";
    if (quality <= 5) return "text-orange-400";
    if (quality <= 7) return "text-yellow-400";
    if (quality <= 8) return "text-green-400";
    return "text-emerald-400";
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 2) return "Søvnløs";
    if (quality <= 4) return "Dårlig";
    if (quality <= 6) return "OK";
    if (quality <= 8) return "Bra";
    return "Perfekt";
  };

  const getSmartTip = (hours: number, quality: number) => {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 18;
    
    if (hours >= 8 && quality >= 7) return "Fantastisk! Du får nok god søvn 🌟";
    if (hours < 7) return isEvening ? "Legg deg tidligere i kveld for å nå 8t målet 🛏️" : "Prøv å gå til sengs 1 time tidligere 💤";
    if (quality <= 5) return "Vurder å redusere koffein og skjermtid før sengetid ☕📱";
    if (hours >= 8 && quality <= 6) return "Du sover nok timer, men kvaliteten kan forbedres 🧘‍♂️";
    return "Du er på rett vei! Hold oppe gode søvnrutiner 💪";
  };

  const weeklyAverage = weeklyData.reduce((sum, hours) => sum + hours, 0) / weeklyData.length;
  const goalProgress = (weeklyAverage / sleepGoal) * 100;

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-3">
        {/* Compact Header with Weekly Progress */}
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400" />
            Sleep Tracking
          </CardTitle>
          <div className="text-right">
            <div className="text-xs text-slate-400">
              Uke Ø: <span className={cn("font-medium", weeklyAverage >= 8 ? "text-green-400" : "text-orange-400")}>
                {weeklyAverage.toFixed(1)}t
              </span>
            </div>
            {/* Mini progress bar */}
            <div className="w-16 h-1 bg-slate-600 rounded-full mt-1">
              <div 
                className={cn("h-full rounded-full transition-all", goalProgress >= 100 ? "bg-green-400" : "bg-blue-400")}
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Hour Buttons */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Timer i natt
            </span>
            <span className={cn("text-lg font-bold", sleepHours >= 8 ? "text-green-400" : "text-blue-400")}>
              {sleepHours}t
            </span>
          </div>
          
          <div className="flex gap-2 justify-center">
            {quickHourOptions.map((hours) => (
              <Button
                key={hours}
                variant={sleepHours === hours ? "default" : "outline"}
                size="sm"
                onClick={() => setSleepHours(hours)}
                className={cn(
                  "text-sm px-3 py-1.5 h-8 min-w-[44px]",
                  sleepHours === hours 
                    ? hours === 8 
                      ? "bg-green-500 text-white border-green-400 ring-2 ring-green-400/50" 
                      : "bg-blue-500 text-white border-blue-400"
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                )}
                data-testid={`sleep-hours-${hours}`}
              >
                {hours}t
              </Button>
            ))}
          </div>
          {sleepHours === 8 && (
            <div className="text-center mt-1">
              <span className="text-xs text-green-400">🎯 Perfekt!</span>
            </div>
          )}
        </div>

        {/* Sleep Quality Slider */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-xs">Kvalitet</span>
            <span className={cn("text-xs font-medium", getQualityColor(sleepQuality))}>
              {sleepQuality}/10 - {getQualityLabel(sleepQuality)}
            </span>
          </div>
          
          <div className="px-1">
            <Slider
              value={[sleepQuality]}
              onValueChange={([value]) => setSleepQuality(value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
              data-testid="sleep-quality-slider"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Sleep Factors */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-slate-300 mb-2">Søvnpåvirkere:</h4>
          <div className="flex flex-wrap gap-1.5">
            {sleepFactors.map((factor) => {
              const IconComponent = factor.icon;
              const isSelected = selectedFactors.includes(factor.id);
              return (
                <Badge
                  key={factor.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer text-xs h-6 px-2 flex items-center gap-1 transition-all",
                    isSelected
                      ? `${factor.color} text-white border-transparent`
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  )}
                  onClick={() => toggleFactor(factor.id)}
                  data-testid={`sleep-factor-${factor.id}`}
                >
                  <IconComponent className="w-3 h-3" />
                  {factor.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Smart Tips */}
        <div className="pt-2 border-t border-slate-600">
          <p className="text-slate-400 text-xs text-center leading-relaxed">
            {getSmartTip(sleepHours, sleepQuality)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}