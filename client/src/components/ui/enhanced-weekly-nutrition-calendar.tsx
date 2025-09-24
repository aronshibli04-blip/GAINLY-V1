import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { calculateCalorieTargets } from '@shared/calorie-calculations';

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
  status: 'complete' | 'partial' | 'empty';
}

export function EnhancedWeeklyNutritionCalendar({ targetCalories }: EnhancedWeeklyNutritionCalendarProps) {
  const { calorieEntries, user, currentTdeeAnalysis } = useUserStore();
  
  // Calculate target calories using centralized system if not provided
  const userWeightGoal = (user as any)?.weightGainGoal || 1.0;
  const calculatedTargetCalories = targetCalories || (
    currentTdeeAnalysis?.targetCalories || 
    calculateCalorieTargets(3200, userWeightGoal).targetCalories
  );
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  
  // Get current week dates (Monday to Sunday)
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
    const progressPercent = Math.min((calories / calculatedTargetCalories) * 100, 150); // Allow up to 150% for surplus visualization
    
    // Neutral status determination
    let status: 'complete' | 'partial' | 'empty';
    if (calories === 0) {
      status = 'empty';
    } else if (calories >= calculatedTargetCalories) {
      status = 'complete';
    } else {
      status = 'partial';
    }

    return {
      date,
      calories,
      meals,
      isToday: date === today,
      dayOfWeek: dayName,
      progressPercent,
      status
    };
  };

  const weekData = weekDates.map(({ dateStr, dayName }) => 
    getDayNutritionData(dateStr, dayName)
  );

  // Calculate weekly summary
  const weeklyInsights = {
    totalCalories: weekData.reduce((sum, day) => sum + day.calories, 0),
    averageDaily: Math.round(weekData.reduce((sum, day) => sum + day.calories, 0) / 7),
    completeDays: weekData.filter(day => day.status === 'complete').length,
    partialDays: weekData.filter(day => day.status === 'partial').length,
    emptyDays: weekData.filter(day => day.status === 'empty').length,
    weeklyTarget: calculatedTargetCalories * 7,
    weeklyProgress: Math.round((weekData.reduce((sum, day) => sum + day.calories, 0) / (calculatedTargetCalories * 7)) * 100)
  };

  // Neutral color system based on progress
  const getDayStatusColor = (day: DayNutritionData) => {
    const { status, progressPercent, isToday } = day;
    
    const baseClasses = "transition-all duration-300 relative";
    const todayClasses = isToday ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-800" : "";
    
    switch (status) {
      case 'complete':
        return cn(baseClasses, todayClasses, "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30");
      case 'partial':
        return cn(baseClasses, todayClasses, "bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg shadow-slate-500/30");
      case 'empty':
        return cn(baseClasses, todayClasses, "bg-slate-700/60 border-2 border-dashed border-slate-600");
      default:
        return cn(baseClasses, todayClasses, "bg-slate-700/60");
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
              <p className="text-slate-400 text-sm">{weeklyInsights.weeklyProgress}% complete</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 text-sm font-medium">{weeklyInsights.averageDaily} kcal/day</div>
            <div className="text-slate-500 text-xs">avg this week</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekData.map((day, index) => (
            <div
              key={day.date}
              className="flex flex-col items-center min-w-0"
              onMouseEnter={() => setHoveredDay(day.date)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => setHoveredDay(hoveredDay === day.date ? null : day.date)}
            >
              {/* Day Label - Updated */}
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
              
              {/* Mobile-friendly Tooltip */}
              {hoveredDay === day.date && (
                <div className="fixed z-50 left-4 right-4 top-32 bg-slate-900/95 border border-slate-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                  <div className="text-white text-sm font-medium">{day.dayOfWeek}, {weekDates[index].dayNum}</div>
                  {day.calories > 0 ? (
                    <>
                      <div className="text-slate-300 text-sm">{day.calories.toLocaleString()} kcal</div>
                      <div className="text-slate-400 text-xs">{day.meals} meals logged</div>
                      <div className="text-cyan-400 text-xs font-medium mt-1">
                        {day.progressPercent.toFixed(0)}% complete
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

      </CardContent>
    </Card>
  );
}