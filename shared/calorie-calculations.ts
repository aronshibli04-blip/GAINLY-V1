/**
 * Centralized calorie calculation functions
 * Single source of truth for TDEE + surplus calculations
 */

import { calculateDailySurplus, WEIGHT_GAIN_CONSTANTS } from './weight-gain-config';

export interface CalorieTargets {
  tdee: number;
  surplus: number;
  targetCalories: number;
  goalKgPerWeek: number;
}

export interface MacroTargets {
  calories: number; // kcal
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

/**
 * Calculate calorie targets based on TDEE and weight gain goal
 * @param tdee - Total Daily Energy Expenditure (calories)
 * @param weightGainGoal - Desired weight gain in kg per week (e.g., 0.5, 1.0, 1.5)
 * @returns CalorieTargets with calculated surplus and target calories
 */
export function calculateCalorieTargets(
  tdee: number, 
  weightGainGoal: number
): CalorieTargets {
  // Use centralized surplus calculation
  const surplus = calculateDailySurplus(weightGainGoal);
  const targetCalories = tdee + surplus;
  
  return {
    tdee,
    surplus,
    targetCalories,
    goalKgPerWeek: weightGainGoal
  };
}

/**
 * Calculate macro targets based on target calories using hardgainer ratios
 * Standard hardgainer macro ratios: 20% protein, 25% fat, 55% carbs
 * @param targetCalories - Daily calorie target
 * @returns MacroTargets with calculated protein, fat, and carb goals
 */
export function calculateMacroTargets(targetCalories: number): MacroTargets {
  // Standard hardgainer macro ratios
  const protein = Math.round((targetCalories * 0.20) / 4); // 4 cal per gram
  const fat = Math.round((targetCalories * 0.25) / 9); // 9 cal per gram  
  const carbs = Math.round((targetCalories * 0.55) / 4); // 4 cal per gram
  
  return {
    calories: targetCalories,
    protein,
    fat,
    carbs
  };
}

/**
 * Calculate complete nutrition targets from TDEE and weight gain goal
 * Combines calorie and macro calculations into one function
 * @param tdee - Total Daily Energy Expenditure
 * @param weightGainGoal - Desired weight gain in kg per week
 * @returns MacroTargets with all nutrition goals
 */
export function calculateNutritionTargets(
  tdee: number, 
  weightGainGoal: number
): MacroTargets {
  const calorieTargets = calculateCalorieTargets(tdee, weightGainGoal);
  return calculateMacroTargets(calorieTargets.targetCalories);
}

// Re-export centralized weight gain utilities for backward compatibility
export { WEIGHT_GAIN_GOALS as WEIGHT_GAIN_EXAMPLES, isValidWeightGainGoal } from './weight-gain-config';