import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { 
  WeeklyNutritionData, 
  DayNutrition, 
  MacroTargets, 
  getDayLetter, 
  getWeekBoundaries, 
  calculatePercentage 
} from "@shared/nutrition-types";
import type { MealLog } from "@shared/schema";

interface WeeklyNutritionParams {
  weekOffset?: number; // 0 = current week, -1 = last week, +1 = next week
}

export function useWeeklyNutrition({ weekOffset = 0 }: WeeklyNutritionParams = {}) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  // Calculate week boundaries
  const weekBoundaries = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weekOffset * 7));
    return getWeekBoundaries(targetDate);
  }, [weekOffset]);

  // Fetch meal logs for the specific week
  const { data: mealLogs, isLoading: mealLogsLoading, error: mealLogsError } = useQuery<MealLog[]>({
    queryKey: ["/api/meal-logs", userId, weekBoundaries.weekStart.toISOString()],
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - meal data is dynamic
    gcTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Fetch user's macro targets (from TDEE analysis or user settings)
  const { data: userTargets, isLoading: targetsLoading, error: targetsError } = useQuery<MacroTargets | null>({
    queryKey: ["/api/user-targets", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - targets rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Process the data into WeeklyNutritionData format
  const weeklyNutritionData = useMemo((): WeeklyNutritionData | null => {
    // Return null while still loading, but create empty structure for empty arrays
    if (mealLogsLoading) return null;
    
    // Always create week structure - use empty array if no meal logs exist yet
    const mealLogsArray = mealLogs || [];

    const today = new Date();
    const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0

    // No more hardcoded fallbacks! Use userTargets from centralized API
    // If userTargets is null, the weekly nutrition will show loading state
    if (!userTargets) {
      return null; // Let the component handle loading state properly
    }

    const targets: MacroTargets = userTargets;
    const days: DayNutrition[] = [];

    // Process each day of the week
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const currentDate = new Date(weekBoundaries.weekStart);
      currentDate.setDate(weekBoundaries.weekStart.getDate() + dayIndex);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrent = dayIndex === currentDayIndex && 
                      currentDate.toDateString() === today.toDateString();
      const isCompleted = dayIndex < currentDayIndex;
      const isFuture = dayIndex > currentDayIndex;

      // Filter meals for this specific day
      const dayMeals = mealLogsArray.filter(meal => 
        meal.logDate === dateString
      );

      // Calculate daily totals
      const dailyTotals = dayMeals.reduce(
        (totals, meal) => ({
          calories: totals.calories + (meal.calories || 0),
          protein: totals.protein + parseFloat(meal.protein || '0'),
          fat: totals.fat + parseFloat(meal.fat || '0'),
          carbs: totals.carbs + parseFloat(meal.carbs || '0'),
        }),
        { calories: 0, protein: 0, fat: 0, carbs: 0 }
      );

      days.push({
        date: currentDate,
        dayLetter: getDayLetter(dayIndex),
        dayIndex,
        calories: {
          current: dailyTotals.calories,
          target: targets.calories,
          percentage: calculatePercentage(dailyTotals.calories, targets.calories),
          unit: 'kcal'
        },
        protein: {
          current: Math.round(dailyTotals.protein),
          target: targets.protein,
          percentage: calculatePercentage(dailyTotals.protein, targets.protein),
          unit: 'g'
        },
        fat: {
          current: Math.round(dailyTotals.fat),
          target: targets.fat,
          percentage: calculatePercentage(dailyTotals.fat, targets.fat),
          unit: 'g'
        },
        carbs: {
          current: Math.round(dailyTotals.carbs),
          target: targets.carbs,
          percentage: calculatePercentage(dailyTotals.carbs, targets.carbs),
          unit: 'g'
        },
        isCompleted,
        isCurrent,
        isFuture
      });
    }

    return {
      weekStart: weekBoundaries.weekStart,
      weekEnd: weekBoundaries.weekEnd,
      days,
      currentDayIndex,
      viewMode: 'consumed'
    };
  }, [mealLogs, userTargets, weekBoundaries, weekOffset, mealLogsLoading]);

  // Calculate weekly summary statistics
  const weeklySummary = useMemo(() => {
    if (!weeklyNutritionData) return null;

    const totals = weeklyNutritionData.days.reduce(
      (sum, day) => ({
        calories: sum.calories + day.calories.current,
        protein: sum.protein + day.protein.current,
        fat: sum.fat + day.fat.current,
        carbs: sum.carbs + day.carbs.current,
        targetCalories: sum.targetCalories + day.calories.target,
        targetProtein: sum.targetProtein + day.protein.target,
        targetFat: sum.targetFat + day.fat.target,
        targetCarbs: sum.targetCarbs + day.carbs.target,
      }),
      { 
        calories: 0 as number, 
        protein: 0 as number, 
        fat: 0 as number, 
        carbs: 0 as number,
        targetCalories: 0 as number, 
        targetProtein: 0 as number, 
        targetFat: 0 as number, 
        targetCarbs: 0 as number
      }
    );

    return {
      calories: {
        consumed: totals.calories,
        target: totals.targetCalories,
        remaining: Math.max(0, totals.targetCalories - totals.calories),
        unit: 'kcal' as const
      },
      protein: {
        consumed: totals.protein,
        target: totals.targetProtein,
        remaining: Math.max(0, totals.targetProtein - totals.protein),
        unit: 'P' as const
      },
      fat: {
        consumed: totals.fat,
        target: totals.targetFat,
        remaining: Math.max(0, totals.targetFat - totals.fat),
        unit: 'F' as const
      },
      carbs: {
        consumed: totals.carbs,
        target: totals.targetCarbs,
        remaining: Math.max(0, totals.targetCarbs - totals.carbs),
        unit: 'C' as const
      }
    };
  }, [weeklyNutritionData]);

  return {
    weeklyNutritionData,
    weeklySummary,
    isLoading: mealLogsLoading || targetsLoading,
    isError: !!mealLogsError, // Only block on meal logs error - targets can fallback
    refetch: () => {
      // Re-fetch both meal logs and targets
      // This will be handled by TanStack Query's invalidation
    }
  };
}