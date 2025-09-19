import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Scale, TrendingUp, Zap } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface EnhancedHabitGridProps {
  className?: string;
}

interface DayHabitData {
  date: string;
  mealLogged: boolean;
  weightLogged: boolean;
  caloriesMet: boolean;
  dayOfWeek: number;
  isToday: boolean;
  streak?: number;
}

export function EnhancedHabitGrid({ className }: EnhancedHabitGridProps) {
  const { calorieEntries, weightEntries, currentTdeeAnalysis } = useUserStore();
  const targetCalories = currentTdeeAnalysis ? currentTdeeAnalysis.tdee + 1100 : 3200;

  // Get last 14 days of habit data (2 weeks like MacroFactor)
  const getLast14Days = (): DayHabitData[] => {
    const today = new Date();
    const days: DayHabitData[] = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Check meal logging
      const dayCalories = calorieEntries
        .filter(entry => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.calories, 0);
      const mealLogged = dayCalories > 0;
      const caloriesMet = dayCalories >= targetCalories * 0.85; // 85% threshold
      
      // Check weight logging
      const weightLogged = weightEntries.some(entry => entry.date === dateStr);
      
      days.push({
        date: dateStr,
        mealLogged,
        weightLogged,
        caloriesMet,
        dayOfWeek: date.getDay(),
        isToday: dateStr === todayStr
      });
    }
    
    return days;
  };

  const habitData = getLast14Days();
  
  // Calculate current streaks (MacroFactor-style)
  const calculateCurrentStreak = (type: 'meal' | 'weight' | 'calories'): number => {
    let streak = 0;
    for (let i = habitData.length - 1; i >= 0; i--) {
      const day = habitData[i];
      let completed = false;
      
      switch (type) {
        case 'meal':
          completed = day.mealLogged;
          break;
        case 'weight':
          completed = day.weightLogged;
          break;
        case 'calories':
          completed = day.caloriesMet;
          break;
      }
      
      if (completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const mealStreak = calculateCurrentStreak('meal');
  const weightStreak = calculateCurrentStreak('weight');
  const calorieStreak = calculateCurrentStreak('calories');

  // Calculate completion rates
  const mealRate = Math.round((habitData.filter(d => d.mealLogged).length / habitData.length) * 100);
  const weightRate = Math.round((habitData.filter(d => d.weightLogged).length / habitData.length) * 100);
  const calorieRate = Math.round((habitData.filter(d => d.caloriesMet).length / habitData.length) * 100);

  // Get habit status color (MacroFactor-style sophisticated colors)
  const getHabitStatusColor = (mealLogged: boolean, weightLogged: boolean, caloriesMet: boolean) => {
    const score = (mealLogged ? 1 : 0) + (weightLogged ? 1 : 0) + (caloriesMet ? 1 : 0);
    
    switch (score) {
      case 3: return "bg-emerald-500"; // Perfect day
      case 2: return "bg-amber-400";   // Good day  
      case 1: return "bg-orange-500";  // Partial day
      default: return "bg-slate-600/50"; // No data
    }
  };

  // Generate actual weekday labels for the first week of data
  const getActualDayLabels = () => {
    const firstWeekDates = habitData.slice(0, 7);
    return firstWeekDates.map(day => {
      const date = new Date(day.date);
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday = 0
      return dayNames[date.getDay()];
    });
  };
  const dayLabels = getActualDayLabels();

  return (
    <Card className={cn("bg-slate-800/60 border-slate-700", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-base font-medium">Habit Performance</CardTitle>
            <p className="text-slate-400 text-sm">Last 14 Days • MacroFactor Style</p>
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MacroFactor-style 2-week grid */}
        <div className="space-y-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="text-xs text-slate-400 text-center font-medium">
                {label}
              </div>
            ))}
          </div>
          
          {/* Week 1 */}
          <div className="grid grid-cols-7 gap-1">
            {habitData.slice(0, 7).map((day, i) => (
              <div key={i} className="relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200",
                    getHabitStatusColor(day.mealLogged, day.weightLogged, day.caloriesMet),
                    day.isToday && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-800"
                  )}
                  title={`${day.date}: Meals: ${day.mealLogged ? '✓' : '✗'}, Weight: ${day.weightLogged ? '✓' : '✗'}, Target: ${day.caloriesMet ? '✓' : '✗'}`}
                />
                {/* Today indicator */}
                {day.isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Week 2 */}
          <div className="grid grid-cols-7 gap-1">
            {habitData.slice(7, 14).map((day, i) => (
              <div key={i + 7} className="relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200",
                    getHabitStatusColor(day.mealLogged, day.weightLogged, day.caloriesMet),
                    day.isToday && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-800"
                  )}
                  title={`${day.date}: Meals: ${day.mealLogged ? '✓' : '✗'}, Weight: ${day.weightLogged ? '✓' : '✗'}, Target: ${day.caloriesMet ? '✓' : '✗'}`}
                />
                {/* Today indicator */}
                {day.isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MacroFactor-style metrics row */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Utensils className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-xs text-slate-400">Meals</span>
            </div>
            <div className="text-sm font-semibold text-white">{mealRate}%</div>
            <div className="text-xs text-slate-500">{mealStreak}d streak</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Scale className="h-3 w-3 text-purple-400 mr-1" />
              <span className="text-xs text-slate-400">Weight</span>
            </div>
            <div className="text-sm font-semibold text-white">{weightRate}%</div>
            <div className="text-xs text-slate-500">{weightStreak}d streak</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-3 w-3 text-amber-400 mr-1" />
              <span className="text-xs text-slate-400">Target</span>
            </div>
            <div className="text-sm font-semibold text-white">{calorieRate}%</div>
            <div className="text-xs text-slate-500">{calorieStreak}d streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}