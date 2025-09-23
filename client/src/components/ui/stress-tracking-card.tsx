import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingDown, TrendingUp, Minus, Briefcase, Moon, Heart, Users, Coffee, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface StressTrackingCardProps {
  className?: string;
}

export function StressTrackingCard({ className }: StressTrackingCardProps) {
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [weeklyData] = useState([1, 3, 2, 4, 2, 3, 2]); // Mock data for trend line

  const stressLabels = {
    1: "Veldig rolig", 2: "Rolig", 3: "Balansert", 4: "Anspent", 5: "Stresset",
    6: "Høyt stress", 7: "Veldig stresset", 8: "Overveldet", 9: "Ekstremt stress", 10: "Panikk"
  };

  const stressTriggers = [
    { id: "work", label: "Jobb", icon: Briefcase, color: "bg-blue-500" },
    { id: "sleep", label: "Søvn", icon: Moon, color: "bg-purple-500" },
    { id: "health", label: "Helse", icon: Heart, color: "bg-red-500" },
    { id: "social", label: "Sosialt", icon: Users, color: "bg-green-500" },
    { id: "caffeine", label: "Koffein", icon: Coffee, color: "bg-amber-500" },
    { id: "traffic", label: "Trafikk", icon: Car, color: "bg-orange-500" }
  ];

  const getStressColor = (level: number) => {
    if (level <= 2) return "text-emerald-400";
    if (level <= 4) return "text-green-400";
    if (level <= 6) return "text-yellow-400";
    if (level <= 8) return "text-orange-400";
    return "text-red-400";
  };

  const getStressIcon = (level: number) => {
    if (level <= 3) return TrendingDown;
    if (level <= 6) return Minus;
    return TrendingUp;
  };

  const getContextualTip = (level: number) => {
    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    
    if (level <= 2) return "Fantastisk! Du håndterer stress godt 🌟";
    if (level <= 4) return isEvening ? "Prøv meditasjon før sengetid 🧘‍♂️" : "Ta en kort pause og pust dypt 💨";
    if (level <= 6) return isEvening ? "Skriv ned bekymringer før du sover 📝" : "Gå en runde eller hør musikk 🎵";
    if (level <= 8) return "Snakk med noen du stoler på eller ring helsevesenet 💙";
    return "Søk profesjonell hjelp hvis dette vedvarer 🆘";
  };

  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId) 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const StressIcon = getStressIcon(stressLevel);

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-3">
        {/* Compact Header with Trend Line */}
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Stress Level
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Mini trend line */}
            <div className="flex items-end gap-0.5 h-4">
              {weeklyData.map((value, index) => (
                <div 
                  key={index}
                  className="w-1 bg-purple-400 rounded-sm transition-all"
                  style={{ height: `${(value / 10) * 16}px` }}
                />
              ))}
            </div>
            <span className="text-slate-400 text-xs">7d</span>
          </div>
        </div>

        {/* Compact Level Display with Slider */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StressIcon className={cn("w-5 h-5", getStressColor(stressLevel))} />
              <span className="text-xl font-bold text-white">{stressLevel}</span>
            </div>
            <p className={cn("text-xs font-medium", getStressColor(stressLevel))}>
              {stressLabels[stressLevel as keyof typeof stressLabels]}
            </p>
          </div>
          
          {/* Stress Level Slider */}
          <div className="px-1">
            <Slider
              value={[stressLevel]}
              onValueChange={([value]) => setStressLevel(value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
              data-testid="stress-slider"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Stress Triggers */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-slate-300 mb-2">Stress triggere:</h4>
          <div className="flex flex-wrap gap-1.5">
            {stressTriggers.map((trigger) => {
              const IconComponent = trigger.icon;
              const isSelected = selectedTriggers.includes(trigger.id);
              return (
                <Badge
                  key={trigger.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer text-xs h-6 px-2 flex items-center gap-1 transition-all",
                    isSelected
                      ? `${trigger.color} text-white border-transparent`
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  )}
                  onClick={() => toggleTrigger(trigger.id)}
                  data-testid={`trigger-${trigger.id}`}
                >
                  <IconComponent className="w-3 h-3" />
                  {trigger.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Smart Contextual Tips */}
        <div className="pt-2 border-t border-slate-600">
          <p className="text-slate-400 text-xs text-center leading-relaxed">
            {getContextualTip(stressLevel)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}