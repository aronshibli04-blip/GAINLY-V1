import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Scale, Calendar } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface HabitTrackingCardProps {
  className?: string;
}

export function MealLoggingHabitCard({ className }: HabitTrackingCardProps) {
  const { calorieEntries } = useUserStore();
  
  // Get last 30 days
  const getLast30Days = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasLogged = calorieEntries.some(entry => entry.date === dateStr && entry.calories > 0);
      days.push({ date: dateStr, logged: hasLogged });
    }
    
    return days;
  };

  const last30Days = getLast30Days();
  const currentWeekLogged = last30Days.slice(-7).filter(day => day.logged).length;
  const totalLogged = last30Days.filter(day => day.logged).length;

  // Create dot grid (5 rows x 6 columns = 30 days)
  const createDotGrid = () => {
    const grid = [];
    for (let row = 0; row < 5; row++) {
      const rowDots = [];
      for (let col = 0; col < 6; col++) {
        const dayIndex = row * 6 + col;
        if (dayIndex < 30) {
          const day = last30Days[dayIndex];
          rowDots.push(
            <div
              key={dayIndex}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                day.logged 
                  ? "bg-emerald-400 shadow-sm" 
                  : "bg-slate-600/50"
              )}
              title={day.date}
            />
          );
        } else {
          rowDots.push(<div key={dayIndex} className="w-2 h-2" />);
        }
      }
      grid.push(
        <div key={row} className="flex gap-1">
          {rowDots}
        </div>
      );
    }
    return grid;
  };

  return (
    <Card className={cn("bg-slate-800/40 border-slate-600/30 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
          <span>Meal Logging</span>
          <Utensils className="h-3 w-3 text-emerald-400" />
        </CardTitle>
        <p className="text-xs text-gray-400">Last 30 Days</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Dot Grid */}
        <div className="space-y-1">
          {createDotGrid()}
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white">
              {currentWeekLogged}/7
            </div>
            <div className="text-xs text-gray-400">this week</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-400 font-medium">
              {Math.round((totalLogged / 30) * 100)}% consistency
            </div>
            <div className="text-xs text-gray-400">
              {totalLogged}/30 days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightTrackingHabitCard({ className }: HabitTrackingCardProps) {
  const { weightEntries } = useUserStore();
  
  // Get last 30 days
  const getLast30Days = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasWeighed = weightEntries.some(entry => entry.date === dateStr);
      days.push({ date: dateStr, weighed: hasWeighed });
    }
    
    return days;
  };

  const last30Days = getLast30Days();
  const currentWeekWeighed = last30Days.slice(-7).filter(day => day.weighed).length;
  const totalWeighed = last30Days.filter(day => day.weighed).length;

  // Create dot grid (5 rows x 6 columns = 30 days)
  const createDotGrid = () => {
    const grid = [];
    for (let row = 0; row < 5; row++) {
      const rowDots = [];
      for (let col = 0; col < 6; col++) {
        const dayIndex = row * 6 + col;
        if (dayIndex < 30) {
          const day = last30Days[dayIndex];
          rowDots.push(
            <div
              key={dayIndex}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                day.weighed 
                  ? "bg-blue-400 shadow-sm" 
                  : "bg-slate-600/50"
              )}
              title={day.date}
            />
          );
        } else {
          rowDots.push(<div key={dayIndex} className="w-2 h-2" />);
        }
      }
      grid.push(
        <div key={row} className="flex gap-1">
          {rowDots}
        </div>
      );
    }
    return grid;
  };

  return (
    <Card className={cn("bg-slate-800/40 border-slate-600/30 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
          <span>Weight Check-ins</span>
          <Scale className="h-3 w-3 text-blue-400" />
        </CardTitle>
        <p className="text-xs text-gray-400">Last 30 Days</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Dot Grid */}
        <div className="space-y-1">
          {createDotGrid()}
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-white">
              {currentWeekWeighed}/7
            </div>
            <div className="text-xs text-gray-400">this week</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-400 font-medium">
              {Math.round((totalWeighed / 30) * 100)}% consistency
            </div>
            <div className="text-xs text-gray-400">
              {totalWeighed}/30 days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}