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
  
  // Show error state
  if (isError || !weeklyNutritionData) {
    return (
      <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div>Unable to load nutrition data</div>
            <div className="text-xs mt-2">Start logging meals to see weekly progress</div>
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
                    "text-xs font-medium text-center py-1",
                    day.isCurrent ? "text-cyan-400" : "text-slate-400"
                  )}
                  data-testid={`day-header-${index}`}
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
          <div className="bg-slate-700/50 rounded-full p-1 flex">
            <Button
              variant={viewMode === 'consumed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('consumed')}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium transition-all",
                viewMode === 'consumed' 
                  ? "bg-white text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
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
                "rounded-full px-4 py-1 text-xs font-medium transition-all",
                viewMode === 'remaining' 
                  ? "bg-white text-black shadow-lg" 
                  : "text-slate-400 hover:text-white"
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
        "relative rounded-lg overflow-hidden transition-all duration-200",
        "hover:scale-105 hover:shadow-lg cursor-pointer",
        day.isCurrent && "ring-2 ring-white ring-offset-1 ring-offset-slate-800",
        day.isFuture ? "bg-slate-700/40" : colors.background
      )}
      style={{
        background: day.isFuture 
          ? 'rgba(71, 85, 105, 0.4)' 
          : colors.background
      }}
      data-testid={`progress-bar-${macro}-${dayIndex}`}
    >
      {/* Progress Fill */}
      {!day.isFuture && (
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300 rounded-lg"
          style={{
            height: `${Math.max(percentage, 8)}%`, // Minimum 8% height for visibility
            backgroundColor: colors.primary,
            boxShadow: percentage > 100 ? colors.glow : undefined
          }}
        />
      )}
      
      {/* Current Day Indicator */}
      {day.isCurrent && (
        <div className="absolute top-1 right-1">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        </div>
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
  
  return (
    <div className="text-right py-2">
      <div className="text-white text-sm font-semibold">
        {displayValue.toLocaleString()} {unit}
      </div>
      <div className="text-slate-500 text-xs">
        of {target.toLocaleString()}
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