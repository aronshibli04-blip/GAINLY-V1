/**
 * Centralized Weight Gain Configuration
 * Single source of truth for all weight gain goals and calorie calculations
 */

export const WEIGHT_GAIN_CONSTANTS = {
  // Scientific constant: 1kg of body weight ≈ 7700 calories
  CALORIES_PER_KG: 7700,
  DAYS_PER_WEEK: 7
} as const;

/**
 * Calculate daily calorie surplus needed for specific kg/week weight gain goal
 * @param kgPerWeek - Target weight gain in kg per week (e.g., 0.5, 1.0, 1.5)
 * @returns Daily calorie surplus needed
 */
export function calculateDailySurplus(kgPerWeek: number): number {
  return Math.round((kgPerWeek * WEIGHT_GAIN_CONSTANTS.CALORIES_PER_KG) / WEIGHT_GAIN_CONSTANTS.DAYS_PER_WEEK);
}

/**
 * Predefined weight gain goal configurations
 * Each goal includes the kg/week target and calculated daily surplus
 */
export const WEIGHT_GAIN_GOALS = {
  conservative: {
    kgPerWeek: 0.5,
    dailySurplus: calculateDailySurplus(0.5), // = 550 calories
    label: "Conservative (0.5kg/week)",
    description: "Slower but steady gains"
  },
  standard: {
    kgPerWeek: 1.0,
    dailySurplus: calculateDailySurplus(1.0), // = 1100 calories
    label: "Standard (1kg/week)",
    description: "Recommended for hardgainers"
  },
  aggressive: {
    kgPerWeek: 1.5,
    dailySurplus: calculateDailySurplus(1.5), // = 1650 calories
    label: "Aggressive (1.5kg/week)",
    description: "Maximum sustainable rate"
  }
} as const;

/**
 * Default app-wide weight gain goal
 * CHANGE THIS ONE LINE TO UPDATE THE ENTIRE APP
 */
export const DEFAULT_WEIGHT_GAIN_GOAL = WEIGHT_GAIN_GOALS.standard;

/**
 * Get weight gain goal by key
 * @param goalKey - Key from WEIGHT_GAIN_GOALS
 * @returns Weight gain goal configuration
 */
export function getWeightGainGoal(goalKey: keyof typeof WEIGHT_GAIN_GOALS) {
  return WEIGHT_GAIN_GOALS[goalKey];
}

/**
 * Get weight gain goal from kg/week value
 * @param kgPerWeek - Target kg per week
 * @returns Matching weight gain goal or creates a custom one
 */
export function getWeightGainGoalByRate(kgPerWeek: number) {
  // Check if it matches a predefined goal
  for (const [key, goal] of Object.entries(WEIGHT_GAIN_GOALS)) {
    if (Math.abs(goal.kgPerWeek - kgPerWeek) < 0.01) {
      return goal;
    }
  }

  // Create custom goal for non-standard rates
  return {
    kgPerWeek,
    dailySurplus: calculateDailySurplus(kgPerWeek),
    label: `Custom (${kgPerWeek}kg/week)`,
    description: "Custom weight gain rate"
  };
}

/**
 * Validate weight gain goal is within reasonable bounds
 * @param kgPerWeek - Weight gain goal in kg per week
 * @returns true if valid, false if outside reasonable range
 */
export function isValidWeightGainGoal(kgPerWeek: number): boolean {
  return kgPerWeek >= 0.25 && kgPerWeek <= 2.0;
}

/**
 * Get all available weight gain goals as array
 * @returns Array of weight gain goal configurations
 */
export function getAllWeightGainGoals() {
  return Object.values(WEIGHT_GAIN_GOALS);
}

export type WeightGainGoal = typeof WEIGHT_GAIN_GOALS[keyof typeof WEIGHT_GAIN_GOALS];
export type WeightGainGoalKey = keyof typeof WEIGHT_GAIN_GOALS;