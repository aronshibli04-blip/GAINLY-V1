import { WeightLog } from "@shared/schema";
import { calculateCalorieTargets } from "@shared/calorie-calculations";

interface DailyCalories {
  logDate: string;
  totalCalories: number;
}

interface TdeeAnalysis {
  tdee: number;
  surplus: number;
  targetCalories: number;
  weightTrend: number;
  avgCalories: number;
  confidence: number;
}

export function calculateTdeeAndPlan(
  weightLogs: WeightLog[], 
  dailyCalories: DailyCalories[],
  weightGainGoal: number = 1.0 // kg per week, defaults to 1.0 for backwards compatibility
): TdeeAnalysis {
  // Sort by date (most recent first)
  const sortedWeights = [...weightLogs].sort((a, b) => 
    new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );
  
  const sortedCalories = [...dailyCalories].sort((a, b) => 
    new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
  );

  // Calculate weight trend (lbs per week)
  let weightTrend = 0;
  if (sortedWeights.length >= 2) {
    const latestWeight = parseFloat(sortedWeights[0].weight);
    const earliestWeight = parseFloat(sortedWeights[sortedWeights.length - 1].weight);
    const daysDiff = Math.abs(
      new Date(sortedWeights[0].logDate).getTime() - 
      new Date(sortedWeights[sortedWeights.length - 1].logDate).getTime()
    ) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 0) {
      weightTrend = ((latestWeight - earliestWeight) / daysDiff) * 7; // lbs per week
    }
  }

  // Calculate average daily calories
  const avgCalories = sortedCalories.length > 0 
    ? Math.round(sortedCalories.reduce((sum, day) => sum + day.totalCalories, 0) / sortedCalories.length)
    : 2500; // fallback

  // Calculate TDEE based on weight change and calorie intake
  let tdee = avgCalories;
  
  if (Math.abs(weightTrend) > 0.1) { // If there's significant weight change
    // 1 lb = ~3500 calories
    // Weight trend is in lbs/week, so convert to daily calorie surplus/deficit
    const dailyCalorieBalance = (weightTrend * 3500) / 7;
    tdee = Math.round(avgCalories - dailyCalorieBalance);
  } else {
    // If weight is stable, use conservative baseline - don't assume intake = TDEE  
    // Use baseline calculation to avoid showing intake as TDEE
    tdee = Math.max(1800, Math.round(avgCalories - 300)); // Conservative baseline
  }

  // Ensure TDEE is within reasonable bounds for hardgainers
  tdee = Math.max(1800, Math.min(4000, tdee));

  // Use centralized calculation based on user's weight gain goal
  const calorieTargets = calculateCalorieTargets(tdee, weightGainGoal);
  const surplus = calorieTargets.surplus;
  const targetCalories = calorieTargets.targetCalories;

  // Calculate confidence based on data quality
  const dataPoints = Math.min(weightLogs.length, dailyCalories.length);
  const dayRange = sortedWeights.length >= 2 ? 
    Math.abs(
      new Date(sortedWeights[0].logDate).getTime() - 
      new Date(sortedWeights[sortedWeights.length - 1].logDate).getTime()
    ) / (1000 * 60 * 60 * 24) : 1;
  
  let confidence = 0.5; // Base confidence
  if (dataPoints >= 14) confidence += 0.3;
  if (dataPoints >= 7) confidence += 0.2;
  if (dayRange >= 14) confidence += 0.2;
  if (Math.abs(weightTrend) < 0.5) confidence += 0.1; // Stable data is good
  
  confidence = Math.min(1, confidence);

  return {
    tdee,
    surplus,
    targetCalories,
    weightTrend,
    avgCalories,
    confidence: Math.round(confidence * 100) / 100
  };
}
