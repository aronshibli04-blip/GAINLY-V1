/**
 * Centralized calorie calculation functions
 * Single source of truth for TDEE + surplus calculations
 */

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
  // 1kg of body weight ≈ 7700 calories
  // Daily surplus = (goal in kg/week × 7700 calories) ÷ 7 days
  const surplus = Math.round((weightGainGoal * 7700) / 7);
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

/**
 * Get calorie surplus examples for different goals
 * Useful for UI displays and user education
 */
export const WEIGHT_GAIN_EXAMPLES = {
  '0.5': { label: '0.5kg/week (Conservative)', surplus: 550, description: 'Slower but steady gains' },
  '1.0': { label: '1kg/week (Standard)', surplus: 1100, description: 'Recommended for hardgainers' },
  '1.5': { label: '1.5kg/week (Aggressive)', surplus: 1650, description: 'Maximum sustainable rate' }
} as const;

/**
 * Validate weight gain goal is within reasonable bounds
 * @param weightGainGoal - Weight gain goal in kg per week
 * @returns true if valid, false if outside reasonable range
 */
export function isValidWeightGainGoal(weightGainGoal: number): boolean {
  return weightGainGoal >= 0.25 && weightGainGoal <= 2.0;
}