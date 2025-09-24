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

// Helper function to get Norwegian day letter (Monday-based indexing)
export const getDayLetter = (dayIndex: number): DayLetter => {
  // Monday-based: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const letters: DayLetter[] = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  return letters[dayIndex] || 'M';
};

// Helper function to calculate percentage
export const calculatePercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((current / target) * 100);
};

// Helper function to get week boundaries (Monday-based system)
export const getWeekBoundaries = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  console.log('🐛 getWeekBoundaries called with:', {
    inputDate: date.toISOString().split('T')[0],
    dayOfWeek: day,
    dayName: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]
  });
  
  // Calculate Monday's date using Monday-based week system
  // Convert Sunday=0 to Sunday=7 for easier math, then calculate days back to Monday
  const dayOfWeekMondayBased = day === 0 ? 6 : day - 1; // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const daysBackToMonday = dayOfWeekMondayBased; // Monday=0 days back, Tuesday=1 day back, etc.
  
  // Use string-based date arithmetic to avoid all timezone issues
  const todayString = date.toISOString().split('T')[0]; // "2025-09-24"
  const todayParts = todayString.split('-').map(Number); // [2025, 9, 24]
  const todayYear = todayParts[0];
  const todayMonth = todayParts[1]; // 1-indexed month
  const todayDay = todayParts[2];
  
  // Calculate Monday and Sunday dates by doing math on day number
  const mondayDay = todayDay - daysBackToMonday; // For Wed (24): 24 - 2 = 22 (Monday)
  const sundayDay = mondayDay + 6; // Monday + 6 = Sunday
  
  // Create Date objects with the calculated days - do NOT set hours to avoid timezone shifts
  const mondayDate = new Date(todayYear, todayMonth - 1, mondayDay); // month is 0-indexed in constructor
  const sundayDate = new Date(todayYear, todayMonth - 1, sundayDay);
  
  console.log('🔍 Monday-based calculation:', {
    todayString,
    todayParts,
    jsGetDay: day, // JavaScript getDay() result
    dayOfWeekMondayBased, // Our Monday-based index (Wed = 2)
    daysBackToMonday,
    calculatedMondayDay: mondayDay,
    calculatedSundayDay: sundayDay,
    mondayCalculated: mondayDate.toISOString().split('T')[0],
    sundayCalculated: sundayDate.toISOString().split('T')[0]
  });
  
  // Return Monday as weekStart, Sunday as weekEnd for Monday-based week system
  console.log('🔍 Final week dates (Monday-based):', {
    weekStartFinal: mondayDate.toISOString().split('T')[0],
    weekEndFinal: sundayDate.toISOString().split('T')[0]
  });
  
  return { weekStart: mondayDate, weekEnd: sundayDate };
};

// Validation schema for macro targets
export const macroTargetsSchema = z.object({
  calories: z.number().min(1000).max(6000),
  protein: z.number().min(50).max(300),
  fat: z.number().min(30).max(200),
  carbs: z.number().min(100).max(800),
});

export type MacroTargetsInput = z.infer<typeof macroTargetsSchema>;