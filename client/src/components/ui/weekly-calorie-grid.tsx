import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface WeeklyCalorieGridProps {
  targetCalories?: number;
}

export function WeeklyCalorieGrid({ targetCalories = 3200 }: WeeklyCalorieGridProps) {
  const { calorieEntries } = useUserStore();
  
  // Safety check for calorieEntries
  const safeCalorieEntries = calorieEntries || [];
  
  // Get current week dates (Monday to Sunday)
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().toISOString().split('T')[0];

  // Calculate calories for each day
  const getDayCalories = (date: string) => {
    return safeCalorieEntries
      .filter(entry => entry && entry.date === date)
      .reduce((sum, entry) => sum + (entry.calories || 0), 0);
  };

  // Calculate progress percentage
  const getProgressPercent = (calories: number) => {
    return Math.min((calories / targetCalories) * 100, 100);
  };

  // Determine status color
  const getStatusColor = (calories: number, isToday: boolean) => {
    const progress = getProgressPercent(calories);
    const isSurplus = calories >= targetCalories;
    
    if (calories === 0) {
      return isToday ? "bg-slate-600" : "bg-slate-700/50";
    }
    
    if (isSurplus) {
      return "bg-emerald-500";
    } else if (progress >= 75) {
      return "bg-orange-400";
    } else {
      return "bg-red-400";
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          <span>Weekly Nutrition Progress</span>
          <span className="text-sm font-normal text-gray-400">Target: {targetCalories} kcal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayLabels.map((label, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-400">
              {label}
            </div>
          ))}
        </div>

        {/* Calorie Grid */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, index) => {
            const dayCalories = getDayCalories(date);
            const isToday = date === today;
            const progressPercent = getProgressPercent(dayCalories);
            const statusColor = getStatusColor(dayCalories, isToday);

            return (
              <div
                key={date}
                className={cn(
                  "relative h-12 rounded-md p-1 transition-all duration-200 hover:scale-105 cursor-pointer",
                  "bg-slate-900/50 border border-slate-600/50",
                  isToday && "ring-1 ring-emerald-400 ring-opacity-50"
                )}
                data-testid={`day-${index}`}
              >
                {/* Progress Bar Background */}
                <div className="absolute inset-1 bg-slate-700/30 rounded-sm overflow-hidden">
                  {/* Progress Fill */}
                  <div 
                    className={cn("h-full transition-all duration-500", statusColor)}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between text-center">
                  {/* Calories */}
                  <div className="text-xs font-bold text-white leading-tight">
                    {dayCalories > 0 ? (dayCalories > 999 ? `${Math.round(dayCalories/1000)}k` : dayCalories) : '---'}
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-xs text-gray-300 leading-tight">
                    {dayCalories > 0 ? `${Math.round(progressPercent)}%` : '0%'}
                  </div>
                </div>

                {/* Today Indicator */}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Summary */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-600/30">
          <div className="text-xs text-gray-400">
            Week Average
          </div>
          <div className="text-xs font-semibold text-white">
            {Math.round(
              weekDates.reduce((sum, date) => sum + getDayCalories(date), 0) / 7
            )} kcal/day
          </div>
        </div>
      </CardContent>
    </Card>
  );
}