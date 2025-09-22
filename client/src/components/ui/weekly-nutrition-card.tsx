import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  // Fetch real weekly nutrition data
  const { weeklyNutritionData, weeklySummary, isLoading, isError } = useWeeklyNutrition();
  
  // Set selected day to current day when data loads
  useEffect(() => {
    if (weeklyNutritionData) {
      setSelectedDayIndex(weeklyNutritionData.currentDayIndex);
    }
  }, [weeklyNutritionData]);
  
  // Get selected day's nutrition data
  const selectedDayNutrition = weeklyNutritionData?.days[selectedDayIndex];
  
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
      <CardContent className="p-4">
        {/* Header inline */}
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-white text-lg font-semibold">
            Weekly Nutrition
          </CardTitle>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Week {getCurrentWeek()}</div>
          </div>
        </div>

        {/* MacroFactor Style Grid: 7 columns × 4 rows */}
        <div className="flex gap-4">
          {/* Left Side: 7×4 Grid */}
          <div className="flex-1">
            {/* Day Columns Layout */}
            <div className="grid grid-cols-7 gap-2">
              {weeklyNutritionData.days.map((day, index) => (
                <DayColumn
                  key={day.date.toISOString()}
                  day={day}
                  dayIndex={index}
                  viewMode={viewMode}
                  isSelected={index === selectedDayIndex}
                  onDayClick={() => setSelectedDayIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Selected Day Totals */}
          <div className="w-24 space-y-1">
            {selectedDayNutrition && (
              <>
                <NutritionSummaryItem 
                  value={selectedDayNutrition.calories.current} 
                  target={selectedDayNutrition.calories.target} 
                  unit={selectedDayNutrition.calories.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.calories}
                />
                <NutritionSummaryItem 
                  value={selectedDayNutrition.protein.current} 
                  target={selectedDayNutrition.protein.target} 
                  unit={selectedDayNutrition.protein.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.protein}
                />
                <NutritionSummaryItem 
                  value={selectedDayNutrition.fat.current} 
                  target={selectedDayNutrition.fat.target} 
                  unit={selectedDayNutrition.fat.unit} 
                  viewMode={viewMode}
                  color={MACRO_COLORS.fat}
                />
                <NutritionSummaryItem 
                  value={selectedDayNutrition.carbs.current} 
                  target={selectedDayNutrition.carbs.target} 
                  unit={selectedDayNutrition.carbs.unit} 
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

// DayColumn Component - Single vertical column for one day containing all 4 macros
interface DayColumnProps {
  day: DayNutrition;
  dayIndex: number;
  viewMode: 'consumed' | 'remaining';
  isSelected: boolean;
  onDayClick: () => void;
}

function DayColumn({ day, dayIndex, viewMode, isSelected, onDayClick }: DayColumnProps) {
  const macros = ['calories', 'protein', 'fat', 'carbs'] as const;
  
  return (
    <div
      className={cn(
        "relative transition-all duration-300 transform-gpu cursor-pointer rounded-lg",
        // Vertical column highlighting
        isSelected
          ? "border-2 border-cyan-400 bg-cyan-500/5 shadow-lg shadow-cyan-500/30" 
          : day.isCurrent 
            ? "border-2 border-cyan-400/30 bg-cyan-500/5 shadow-md shadow-cyan-500/20" 
            : "border-2 border-transparent hover:border-slate-600/50",
        "hover:scale-105 hover:bg-slate-700/20"
      )}
      onClick={onDayClick}
      data-testid={`day-column-${dayIndex}`}
    >
      {/* Day Header */}
      <div className={cn(
        "text-xs font-medium text-center py-1 rounded-t-md transition-all duration-300",
        isSelected
          ? "text-white bg-cyan-500/20" 
          : day.isCurrent 
            ? "text-cyan-400 bg-cyan-500/10" 
            : "text-slate-400"
      )}>
        {day.dayLetter}
      </div>

      {/* Macro Cells */}
      <div className="space-y-1 p-1">
        {macros.map((macro) => (
          <DayMacroCell
            key={macro}
            day={day}
            macro={macro}
            viewMode={viewMode}
            colors={MACRO_COLORS[macro]}
          />
        ))}
      </div>
    </div>
  );
}

// DayMacroCell Component - Individual macro cell within a day column
interface DayMacroCellProps {
  day: DayNutrition;
  macro: 'calories' | 'protein' | 'fat' | 'carbs';
  viewMode: 'consumed' | 'remaining';
  colors: typeof MACRO_COLORS.calories;
}

function DayMacroCell({ day, macro, viewMode, colors }: DayMacroCellProps) {
  const macroData = day[macro];
  const consumedPercentage = Math.min(macroData.percentage, 150); // Cap at 150% for visual
  
  // For remaining mode, show remaining percentage instead of consumed
  const displayPercentage = viewMode === 'remaining' 
    ? Math.max(0, 100 - consumedPercentage) // Invert: 0% consumed = 100% remaining
    : consumedPercentage;
  
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300 h-12",
        day.isFuture ? "bg-slate-700/40" : colors.background,
        // Remove individual cell highlighting
        "hover:brightness-110"
      )}
      style={{
        background: day.isFuture 
          ? 'rgba(71, 85, 105, 0.4)' 
          : colors.background
      }}
      data-testid={`macro-cell-${macro}`}
      title={`${macro.charAt(0).toUpperCase() + macro.slice(1)}: ${macroData.current}/${macroData.target} ${macroData.unit} (${consumedPercentage.toFixed(0)}%)`}
    >
      {/* Progress Fill */}
      {!day.isFuture && (
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-lg"
          style={{
            height: `${Math.max(displayPercentage, 8)}%`, // Minimum 8% height for visibility
            backgroundColor: colors.primary,
            boxShadow: consumedPercentage > 100 ? colors.glow : `0 0 10px ${colors.primary}40`
          }}
        />
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
  
  // Convert new unit letters back to original units for target display
  const getOriginalUnit = (unit: string): string => {
    switch (unit) {
      case 'P': // Protein
      case 'C': // Carbs  
      case 'F': // Fat
        return 'g';
      case 'kcal':
        return 'kcal';
      default:
        return unit;
    }
  };

  const originalUnit = getOriginalUnit(unit);
  
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
        of {target.toLocaleString()}{originalUnit}
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