import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Calendar, Zap } from "lucide-react";
import { useState } from "react";

interface EnhancedWeeklyNutritionCalendarProps {
  targetCalories?: number;
}

interface DayNutritionData {
  date: string;
  calories: number;
  meals: number;
  isToday: boolean;
  dayOfWeek: string;
  progressPercent: number;
  status: 'surplus' | 'good' | 'deficit' | 'empty';
  trend: 'up' | 'down' | 'stable';
}

export function EnhancedWeeklyNutritionCalendar({ targetCalories = 3200 }: EnhancedWeeklyNutritionCalendarProps) {
  const { calorieEntries } = useUserStore();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  
  // Get current week dates (Monday to Sunday) - MacroFactor style
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const weekDates = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        dateStr: date.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNum: date.getDate()
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  // Calculate comprehensive daily nutrition data
  const getDayNutritionData = (date: string, dayName: string): DayNutritionData => {
    // Safe check for calorieEntries
    const safeCalorieEntries = calorieEntries || [];
    const dayEntries = safeCalorieEntries.filter(entry => entry && entry.date === date);
    const calories = dayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const meals = dayEntries.filter(entry => entry.calories > 0).length; // Only count actual meals
    const progressPercent = Math.min((calories / targetCalories) * 100, 150); // Allow up to 150% for surplus visualization
    
    // Advanced status determination
    let status: 'surplus' | 'good' | 'deficit' | 'empty';
    if (calories === 0) {
      status = 'empty';
    } else if (calories >= targetCalories) {
      status = 'surplus';
    } else if (progressPercent >= 75) {
      status = 'good';
    } else {
      status = 'deficit';
    }

    // Calculate trend (simplified for now - could use previous day comparison)
    const trend: 'up' | 'down' | 'stable' = calories > targetCalories ? 'up' : 
                     calories < targetCalories * 0.75 ? 'down' : 'stable';

    return {
      date,
      calories,
      meals,
      isToday: date === today,
      dayOfWeek: dayName,
      progressPercent,
      status,
      trend
    };
  };

  const weekData = weekDates.map(({ dateStr, dayName }) => 
    getDayNutritionData(dateStr, dayName)
  );

  // Calculate weekly insights (MacroFactor-style)
  const weeklyInsights = {
    totalCalories: weekData.reduce((sum, day) => sum + day.calories, 0),
    averageDaily: Math.round(weekData.reduce((sum, day) => sum + day.calories, 0) / 7),
    surplusDays: weekData.filter(day => day.status === 'surplus').length,
    deficitDays: weekData.filter(day => day.status === 'deficit').length,
    emptyDays: weekData.filter(day => day.status === 'empty').length,
    weeklyTarget: targetCalories * 7,
    weeklyProgress: Math.round((weekData.reduce((sum, day) => sum + day.calories, 0) / (targetCalories * 7)) * 100)
  };

  // MacroFactor-style sophisticated color system
  const getDayStatusColor = (day: DayNutritionData) => {
    const { status, progressPercent, isToday } = day;
    
    const baseClasses = "transition-all duration-300 relative";
    const todayClasses = isToday ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-800" : "";
    
    switch (status) {
      case 'surplus':
        return cn(baseClasses, todayClasses, "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30");
      case 'good':
        return cn(baseClasses, todayClasses, "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30");
      case 'deficit':
        return cn(baseClasses, todayClasses, "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30");
      case 'empty':
        return cn(baseClasses, todayClasses, "bg-slate-700/60 border-2 border-dashed border-slate-600");
      default:
        return cn(baseClasses, todayClasses, "bg-slate-700/60");
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-emerald-300" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-300" />;
      default: return <Minus className="h-3 w-3 text-slate-400" />;
    }
  };

  return (
    <Card className="bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <div>
              <CardTitle className="text-white text-lg font-semibold">Weekly Nutrition</CardTitle>
              <p className="text-slate-400 text-sm">MacroFactor Style • {weeklyInsights.weeklyProgress}% of target</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 text-sm font-medium">{weeklyInsights.averageDaily} kcal/day</div>
            <div className="text-slate-500 text-xs">avg this week</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Day Grid - MacroFactor Style */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekData.map((day, index) => (
            <div
              key={day.date}
              className="flex flex-col items-center min-w-0"
              onMouseEnter={() => setHoveredDay(day.date)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => setHoveredDay(hoveredDay === day.date ? null : day.date)}
            >
              {/* Day Label */}
              <div className={cn(
                "text-xs font-medium mb-2 transition-colors",
                day.isToday ? "text-cyan-400" : "text-slate-400"
              )}>
                {day.dayOfWeek.slice(0, 3)}
              </div>
              
              {/* Enhanced Day Cell */}
              <div
                className={cn(
                  "w-full h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden min-w-0",
                  "hover:scale-105 hover:shadow-xl transition-all duration-200",
                  getDayStatusColor(day)
                )}
                data-testid={`enhanced-day-${index}`}
              >
                {/* Day Number */}
                <div className="text-white text-sm font-bold mb-1">
                  {weekDates[index].dayNum}
                </div>
                
                {/* Calorie Info - Condensed */}
                {day.calories > 0 ? (
                  <div className="text-white text-xs font-medium text-center">
                    <div>{Math.round(day.calories / 1000 * 10) / 10}k</div>
                    {day.meals > 0 && (
                      <div className="text-xs opacity-75">{day.meals}m</div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs">—</div>
                )}
                
                {/* Trend Indicator - MacroFactor Style */}
                <div className="absolute top-1 right-1">
                  {getTrendIcon(day.trend)}
                </div>
                
                {/* Progress Bar - Subtle Bottom Indicator */}
                {day.calories > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div 
                      className="h-full bg-white/60 transition-all duration-300"
                      style={{ width: `${Math.min(day.progressPercent, 100)}%` }}
                    />
                  </div>
                )}
                
                {/* Today Pulse Indicator */}
                {day.isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Mobile-friendly Tooltip - MacroFactor Style */}
              {hoveredDay === day.date && (
                <div className="fixed z-50 left-4 right-4 top-32 bg-slate-900/95 border border-slate-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                  <div className="text-white text-sm font-medium">{day.dayOfWeek}, {weekDates[index].dayNum}</div>
                  {day.calories > 0 ? (
                    <>
                      <div className="text-slate-300 text-sm">{day.calories.toLocaleString()} kcal</div>
                      <div className="text-slate-400 text-xs">{day.meals} meals logged</div>
                      <div className={cn(
                        "text-xs font-medium mt-1",
                        day.status === 'surplus' ? "text-emerald-400" : 
                        day.status === 'good' ? "text-amber-400" : "text-red-400"
                      )}>
                        {day.progressPercent.toFixed(0)}% of target
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm">No meals logged</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Weekly Insights Bar - MacroFactor Style */}
        <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-white font-medium">Week</span>
              </div>
              <div className="text-slate-300">
                {weeklyInsights.totalCalories.toLocaleString()} / {weeklyInsights.weeklyTarget.toLocaleString()} kcal
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="text-emerald-400 font-medium">{weeklyInsights.surplusDays}d surplus</div>
              <div className="text-red-400 font-medium">{weeklyInsights.deficitDays}d deficit</div>
              {weeklyInsights.emptyDays > 0 && (
                <div className="text-slate-500 font-medium">{weeklyInsights.emptyDays}d empty</div>
              )}
            </div>
          </div>
          
          {/* Weekly Progress Bar */}
          <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                weeklyInsights.weeklyProgress >= 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : 
                weeklyInsights.weeklyProgress >= 75 ? "bg-gradient-to-r from-amber-500 to-orange-400" : 
                "bg-gradient-to-r from-red-500 to-red-400"
              )}
              style={{ width: `${Math.min(weeklyInsights.weeklyProgress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}