import { z } from "zod";

// Norwegian day letters following MacroFactor style
export type DayLetter = 'M' | 'T' | 'O' | 'T' | 'F' | 'L' | 'S';

// Individual macro progress data
export interface MacroProgress {
  current: number;
  target: number;
  percentage: number; // 0-100+ (can exceed 100%)
  unit: 'kcal' | 'g'; // calories vs grams
}

// Single day's nutrition data
export interface DayNutrition {
  date: Date;
  dayLetter: DayLetter;
  dayIndex: number; // 0-6 (Monday-Sunday)
  calories: MacroProgress;
  protein: MacroProgress;
  fat: MacroProgress;
  carbs: MacroProgress;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

// Complete weekly nutrition data
export interface WeeklyNutritionData {
  weekStart: Date;
  weekEnd: Date;
  days: DayNutrition[];
  currentDayIndex: number; // 0-6
  viewMode: 'consumed' | 'remaining';
}

// Aggregated weekly totals for right-side display
export interface WeeklyNutritionSummary {
  calories: {
    consumed: number;
    target: number;
    remaining: number;
    unit: 'kcal';
  };
  protein: {
    consumed: number;
    target: number;
    remaining: number;
    unit: 'g';
  };
  fat: {
    consumed: number;
    target: number;
    remaining: number;
    unit: 'g';
  };
  carbs: {
    consumed: number;
    target: number;
    remaining: number;
    unit: 'g';
  };
}

// User's daily macro targets
export interface MacroTargets {
  calories: number; // kcal
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

// Color theme for each macro
export interface MacroColorTheme {
  primary: string;
  background: string;
  glow: string;
}

// Complete color system
export const MACRO_COLORS: Record<string, MacroColorTheme> = {
  calories: {
    primary: '#3B82F6', // Blue
    background: 'rgba(59,130,246,0.1)',
    glow: '0 0 20px rgba(59,130,246,0.3)'
  },
  protein: {
    primary: '#F97316', // Orange  
    background: 'rgba(249,115,22,0.1)',
    glow: '0 0 20px rgba(249,115,22,0.3)'
  },
  fat: {
    primary: '#EAB308', // Yellow
    background: 'rgba(234,179,8,0.1)', 
    glow: '0 0 20px rgba(234,179,8,0.3)'
  },
  carbs: {
    primary: '#10B981', // Green
    background: 'rgba(16,185,129,0.1)',
    glow: '0 0 20px rgba(16,185,129,0.3)'
  }
};

// Helper function to get Norwegian day letter (Sunday-based to match JavaScript getDay())
export const getDayLetter = (dayIndex: number): DayLetter => {
  const letters: DayLetter[] = ['S', 'M', 'T', 'O', 'T', 'F', 'L'];
  return letters[dayIndex] || 'S';
};

// Helper function to calculate percentage
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
};

// Helper function to get week boundaries
export const getWeekBoundaries = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  
  console.log('🐛 getWeekBoundaries called with:', {
    inputDate: date.toISOString().split('T')[0],
    dayOfWeek: day,
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]
  });
  
  // Calculate Sunday's date using Sunday-based week system
  // For Sunday-based week: go back day days from current day (Sun=0, Mon=1, Tue=2, etc.)
  const daysBackToSunday = day; // Sunday=0 days back, Monday=1 day back, etc.
  
  // Use string-based date arithmetic to avoid all timezone issues
  const todayString = date.toISOString().split('T')[0]; // "2025-09-24"
  const todayParts = todayString.split('-').map(Number); // [2025, 9, 24]
  const todayYear = todayParts[0];
  const todayMonth = todayParts[1]; // 1-indexed month
  const todayDay = todayParts[2];
  
  // Calculate Sunday and Saturday dates by doing math on day number
  const sundayDay = todayDay - daysBackToSunday; // 24 - 3 = 21 
  const saturdayDay = sundayDay + 6; // 21 + 6 = 27
  
  // Create Date objects with the calculated days - do NOT set hours to avoid timezone shifts
  const sundayDate = new Date(todayYear, todayMonth - 1, sundayDay); // month is 0-indexed in constructor
  const saturdayDate = new Date(todayYear, todayMonth - 1, saturdayDay);
  
  console.log('🔍 String-based calculation:', {
    todayString,
    todayParts,
    dayOfWeek: day,
    daysBackToSunday,
    calculatedSundayDay: sundayDay,
    calculatedSaturdayDay: saturdayDay,
    sundayCalculated: sundayDate.toISOString().split('T')[0],
    saturdayCalculated: saturdayDate.toISOString().split('T')[0]
  });
  
  // Return dates WITHOUT setting hours to avoid timezone shifts
  console.log('🔍 Final week dates (no hour changes):', {
    weekStartFinal: sundayDate.toISOString().split('T')[0],
    weekEndFinal: saturdayDate.toISOString().split('T')[0]
  });
  
  return { weekStart: sundayDate, weekEnd: saturdayDate };
};

// Validation schema for macro targets
export const macroTargetsSchema = z.object({
  calories: z.number().min(1000).max(6000),
  protein: z.number().min(50).max(300),
  fat: z.number().min(30).max(200),
  carbs: z.number().min(100).max(800),
});

export type MacroTargetsInput = z.infer<typeof macroTargetsSchema>;