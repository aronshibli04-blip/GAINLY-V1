// User Types
export interface DietaryPreference {
  id: string;
  name: string;
  type: 'restriction' | 'preference';
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for frontend use
  firstName: string;
  age: number;
  sex?: 'male' | 'female'; // Optional for frontend
  height: number; // cm (converted from backend)
  weight?: number; // kg (frontend working weight)
  activityLevel: string; // Free text description of activity level
  dietaryPreferences?: DietaryPreference[]; // Optional for frontend
  createdAt: string;
  calibrationStartDate?: string; // When user started 7-day calibration
  hasCompletedCalibration?: boolean; // True after 7 days of data entry
  
  // FFMI-based scientific goal setting system
  bodyFatPercentage?: number; // Body fat percentage (10-25%)
  targetFFMI?: number; // Target Fat-Free Mass Index (18-25 typically)
  calculatedTargetWeight?: number; // Scientifically calculated target weight based on FFMI
  timelineMonths?: number; // Realistic timeline to reach target (6-24 months)
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

// Utility Types
export type UserPhase = 'onboarding' | 'calibration' | 'meal_planning' | 'tracking';
export type DataQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ActivityType = 'steps' | 'light' | 'moderate' | 'heavy';
export type CookingExperience = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';