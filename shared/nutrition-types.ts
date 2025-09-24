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

// Helper function to get Norwegian day letter
export const getDayLetter = (dayIndex: number): DayLetter => {
  const letters: DayLetter[] = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
  return letters[dayIndex] || 'M';
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
  
  // Calculate Monday's date using more reliable date arithmetic
  // For Monday-based week: go back (day === 0 ? 6 : day - 1) days from current day
  const daysBackToMonday = day === 0 ? 6 : day - 1;
  
  // Use date arithmetic instead of constructor to avoid month boundary issues
  const mondayDate = new Date(d);
  mondayDate.setDate(mondayDate.getDate() - daysBackToMonday);
  
  console.log('🔍 Fixed calculation:', {
    todayString: d.toISOString().split('T')[0],
    dayOfWeek: day,
    daysBackToMonday,
    mondayCalculated: mondayDate.toISOString().split('T')[0]
  });
  const sundayDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + 6);
  
  console.log('🐛 Calculated week boundaries:', {
    mondayCalculated: mondayDate.toISOString().split('T')[0],
    sundayCalculated: sundayDate.toISOString().split('T')[0]
  });
  
  // Reset time to start/end of day
  mondayDate.setHours(0, 0, 0, 0);
  sundayDate.setHours(23, 59, 59, 999);
  
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