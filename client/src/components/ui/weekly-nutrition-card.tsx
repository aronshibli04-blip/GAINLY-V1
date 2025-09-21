import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  WeeklyNutritionData, 
  DayNutrition, 
  MacroProgress,
  MACRO_COLORS, 
  getDayLetter, 
  getWeekBoundaries,
  calculatePercentage 
} from "@shared/nutrition-types";
import { useWeeklyNutrition } from "@/hooks/useWeeklyNutrition";

interface WeeklyNutritionCardProps {
  className?: string;
}

export function WeeklyNutritionCard({ className }: WeeklyNutritionCardProps) {
  const [viewMode, setViewMode] = useState<'consumed' | 'remaining'>('consumed');
  
  // Fetch real weekly nutrition data
  const { weeklyNutritionData, weeklySummary, isLoading, isError } = useWeeklyNutrition();
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="animate-pulse">Loading nutrition data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show error state only for actual API errors
  if (isError) {
    return (
      <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div>Unable to load nutrition data</div>
            <div className="text-xs mt-2">Please check your connection and try again</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle case where data is still loading or unavailable
  if (!weeklyNutritionData) {
    return (
      <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="animate-pulse">Loading nutrition data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold">
            Weekly Nutrition
          </CardTitle>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Week {getCurrentWeek()}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* MacroFactor Style Grid: 4 rows × 7 columns */}
        <div className="flex gap-4">
          {/* Left Side: 4×7 Grid */}
          <div className="flex-1">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weeklyNutritionData.days.map((day, index) => (
                <div 
                  key={day.date.toISOString()}
                  className={cn(
                    "text-xs font-medium text-center py-1 rounded-md transition-all duration-300 transform-gpu",
                    "hover:scale-105 hover:bg-slate-700/50",
                    day.isCurrent 
                      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 shadow-md shadow-cyan-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-slate-600/30"
                  )}
                  data-testid={`day-header-${index}`}
                  title={`${day.date.toLocaleDateString('nb-NO', { weekday: 'long', month: 'short', day: 'numeric' })}`}
                >
                  {day.dayLetter}
                </div>
              ))}
            </div>

            {/* Macro Rows */}
            <div className="space-y-1">
              {/* Calories Row */}
              <MacroRow 
                macro="calories"
                days={weeklyNutritionData.days}
                viewMode={viewMode}
                icon="🔥"
              />
              
              {/* Protein Row */}
              <MacroRow 
                macro="protein"
                days={weeklyNutritionData.days}
                viewMode={viewMode}
                icon="💪"
              />
              
              {/* Fat Row */}
              <MacroRow 
                macro="fat"
                days={weeklyNutritionData.days}
                viewMode={viewMode}
                icon="🧈"
              />
              
              {/* Carbs Row */}
              <MacroRow 
                macro="carbs"
                days={weeklyNutritionData.days}
                viewMode={viewMode}
                icon="🌾"
              />
            </div>
          </div>

          {/* Right Side: Macro Totals */}
          <div className="w-24 space-y-1">
            {weeklySummary && (
              <>
                <NutritionSummaryItem 
                  value={weeklySummary.calories.consumed} 
                  target={weeklySummary.calories.target} 
                  unit={weeklySummary.calories.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.calories}
                />
                <NutritionSummaryItem 
                  value={weeklySummary.protein.consumed} 
                  target={weeklySummary.protein.target} 
                  unit={weeklySummary.protein.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.protein}
                />
                <NutritionSummaryItem 
                  value={weeklySummary.fat.consumed} 
                  target={weeklySummary.fat.target} 
                  unit={weeklySummary.fat.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.fat}
                />
                <NutritionSummaryItem 
                  value={weeklySummary.carbs.consumed} 
                  target={weeklySummary.carbs.target} 
                  unit={weeklySummary.carbs.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.carbs}
                />
              </>
            )}
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center">
          <div className="bg-slate-700/50 rounded-full p-1 flex border border-slate-600/50 shadow-lg backdrop-blur-sm">
            <Button
              variant={viewMode === 'consumed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('consumed')}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium transition-all duration-300 transform-gpu",
                "hover:scale-105 active:scale-95",
                viewMode === 'consumed' 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl shadow-cyan-500/30 border-0" 
                  : "text-slate-400 hover:text-white hover:bg-slate-600/50 hover:shadow-md"
              )}
              data-testid="toggle-consumed"
            >
              Consumed
            </Button>
            <Button
              variant={viewMode === 'remaining' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('remaining')}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium transition-all duration-300 transform-gpu",
                "hover:scale-105 active:scale-95",
                viewMode === 'remaining' 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl shadow-cyan-500/30 border-0" 
                  : "text-slate-400 hover:text-white hover:bg-slate-600/50 hover:shadow-md"
              )}
              data-testid="toggle-remaining"
            >
              Remaining
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// MacroRow Component - Single horizontal row for one macro across 7 days
interface MacroRowProps {
  macro: 'calories' | 'protein' | 'fat' | 'carbs';
  days: DayNutrition[];
  viewMode: 'consumed' | 'remaining';
  icon: string;
}

function MacroRow({ macro, days, viewMode, icon }: MacroRowProps) {
  const colors = MACRO_COLORS[macro];
  
  return (
    <div className="grid grid-cols-7 gap-2 h-12">
      {days.map((day, index) => (
        <DayProgressBar
          key={day.date.toISOString()}
          day={day}
          macro={macro}
          viewMode={viewMode}
          colors={colors}
          dayIndex={index}
        />
      ))}
    </div>
  );
}

// DayProgressBar Component - Individual day cell
interface DayProgressBarProps {
  day: DayNutrition;
  macro: 'calories' | 'protein' | 'fat' | 'carbs';
  viewMode: 'consumed' | 'remaining';
  colors: typeof MACRO_COLORS.calories;
  dayIndex: number;
}

function DayProgressBar({ day, macro, viewMode, colors, dayIndex }: DayProgressBarProps) {
  const macroData = day[macro];
  const percentage = Math.min(macroData.percentage, 150); // Cap at 150% for visual
  
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300 transform-gpu",
        "hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer",
        "hover:z-10 hover:border hover:border-cyan-400/30",
        day.isCurrent && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-800 shadow-lg shadow-cyan-500/30",
        day.isFuture ? "bg-slate-700/40" : colors.background,
        // Enhanced interactivity for completed days
        !day.isFuture && "hover:brightness-110"
      )}
      style={{
        background: day.isFuture 
          ? 'rgba(71, 85, 105, 0.4)' 
          : colors.background
      }}
      data-testid={`progress-bar-${macro}-${dayIndex}`}
      title={`${macro.charAt(0).toUpperCase() + macro.slice(1)}: ${macroData.current}/${macroData.target} ${macroData.unit} (${percentage.toFixed(0)}%)`}
    >
      {/* Progress Fill */}
      {!day.isFuture && (
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-lg"
          style={{
            height: `${Math.max(percentage, 8)}%`, // Minimum 8% height for visibility
            backgroundColor: colors.primary,
            boxShadow: percentage > 100 ? colors.glow : `0 0 10px ${colors.primary}40`
          }}
        />
      )}
      
      {/* Current Day Indicator - Enhanced */}
      {day.isCurrent && (
        <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-lg animate-pulse">
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-300 rounded-full" />
          </div>
        </div>
      )}
      
      {/* Subtle glow effect on hover for current day */}
      {day.isCurrent && (
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
}

// NutritionSummaryItem Component - Right side totals
interface NutritionSummaryItemProps {
  value: number;
  target: number;
  unit: string;
  viewMode: 'consumed' | 'remaining';
  color: typeof MACRO_COLORS.calories;
}

function NutritionSummaryItem({ value, target, unit, viewMode, color }: NutritionSummaryItemProps) {
  const displayValue = viewMode === 'consumed' ? value : target - value;
  const percentage = (value / target) * 100;
  
  return (
    <div 
      className="text-right py-2 px-2 rounded-lg transition-all duration-300 hover:bg-slate-700/30 hover:scale-105 transform-gpu"
      data-testid={`summary-${unit.toLowerCase()}`}
      title={`${percentage.toFixed(1)}% of target reached`}
    >
      <div 
        className="text-sm font-semibold transition-colors duration-300"
        style={{ color: percentage >= 100 ? color.primary : 'white' }}
      >
        {displayValue.toLocaleString()} {unit}
      </div>
      <div className="text-slate-500 text-xs">
        of {target.toLocaleString()}
      </div>
      {/* Progress indicator bar */}
      <div className="w-full h-0.5 bg-slate-600 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full transition-all duration-500 rounded-full"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color.primary,
            boxShadow: percentage >= 100 ? `0 0 4px ${color.primary}` : undefined
          }}
        />
      </div>
    </div>
  );
}

// Helper Functions
function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}