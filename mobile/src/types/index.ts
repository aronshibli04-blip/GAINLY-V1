// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tracking: undefined;
  MealPlan: undefined;
  Progress: undefined;
  Profile: undefined;
};

// User Types
export interface DietaryPreference {
  id: string;
  name: string;
  type: 'restriction' | 'preference';
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  age: number;
  sex: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  goalWeight: number; // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  dietaryPreferences: DietaryPreference[];
  createdAt: string;
}

// Tracking Types
export interface WeightEntry {
  id: string;
  userId: string;
  weight: number; // kg
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface CalorieEntry {
  id: string;
  userId: string;
  calories: number;
  description?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  type: 'steps' | 'light' | 'moderate' | 'heavy';
  value: number; // steps or hours
  date: string; // YYYY-MM-DD
  createdAt: string;
}

// TDEE Analysis Types
export interface TdeeAnalysis {
  id: string;
  userId: string;
  tdee: number; // calculated TDEE in calories
  surplus: number; // recommended surplus
  targetCalories: number; // TDEE + surplus
  confidence: number; // 0-1, confidence in calculation
  dataPoints: number; // number of data points used
  weekNumber: number; // which week of analysis
  createdAt: string;
}

// Meal Planning Types
export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string; // g, ml, cup, etc.
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string; // 'Protein', 'Grains', 'Vegetables', etc.
  purchased: boolean;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  shoppingList: ShoppingListItem[];
  createdAt: string;
}

export interface MealPlanRequest {
  userId: string;
  targetCalories: number;
  dietaryPreferences: string[];
  preferredFoods: string[];
  maxMealsPerDay: number;
  maxPrepTime: number; // minutes per meal
  cookingExperience: 'beginner' | 'intermediate' | 'advanced';
}

// UI Types
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ProgressMetrics {
  weightEntries: number;
  calorieEntries: number;
  activityEntries: number;
  daysTracking: number;
  averageWeight: number;
  averageCalories: number;
  readyForAnalysis: boolean;
}

// Storage Types
export interface UserData {
  user: User | null;
  isOnboarded: boolean;
  weightEntries: WeightEntry[];
  calorieEntries: CalorieEntry[];
  activityEntries: ActivityEntry[];
  currentTdeeAnalysis: TdeeAnalysis | null;
  mealPlans: MealPlan[];
  currentPhase: 'onboarding' | 'calibration' | 'meal_planning' | 'tracking';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Form Types
export interface OnboardingFormData {
  firstName: string;
  age: string;
  sex: 'male' | 'female';
  height: string;
  weight: string;
  goalWeight: string;
  activityLevel: User['activityLevel'];
  dietaryPreferences: string[];
}

// Utility Types
export type UserPhase = 'onboarding' | 'calibration' | 'meal_planning' | 'tracking';
export type DataQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ActivityType = 'steps' | 'light' | 'moderate' | 'heavy';
export type CookingExperience = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Constants
export const PHASE_LABELS = {
  onboarding: 'Getting Started',
  calibration: 'TDEE Calibration',
  meal_planning: 'AI Meal Planning',
  tracking: 'Active Tracking',
} as const;

export const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
} as const;

export const ACTIVITY_LEVEL_LABELS = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
} as const;