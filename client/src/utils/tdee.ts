import { WeightEntry, CalorieEntry, TdeeAnalysis } from '../types';
import { calculateCalorieTargets } from '@shared/calorie-calculations';
import { DEFAULT_WEIGHT_GAIN_GOAL } from '@shared/weight-gain-config';

export interface TdeeCalculationResult {
  tdee: number;
  surplus: number;
  targetCalories: number;
  weightTrend: number;
  averageCalories: number;
  confidence: number;
  dataQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

export function calculateTdee(
  weightEntries: WeightEntry[],
  calorieEntries: CalorieEntry[],
  userId: string,
  weightGainGoal: number = DEFAULT_WEIGHT_GAIN_GOAL.kgPerWeek // kg per week, defaults to app-wide setting
): TdeeCalculationResult {
  // Sort entries by date
  const sortedWeights = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const sortedCalories = [...calorieEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate weight trend (kg per week)
  let weightTrend = 0;
  if (sortedWeights.length >= 2) {
    const firstWeight = sortedWeights[0].weight;
    const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
    const daysDiff = Math.abs(
      new Date(sortedWeights[sortedWeights.length - 1].date).getTime() - 
      new Date(sortedWeights[0].date).getTime()
    ) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 0) {
      weightTrend = ((lastWeight - firstWeight) / daysDiff) * 7; // kg per week
    }
  }

  // Calculate average daily calories
  const dailyCaloriesByDate = new Map<string, number>();
  
  // Group calories by date to get daily totals
  calorieEntries.forEach(entry => {
    const existing = dailyCaloriesByDate.get(entry.date) || 0;
    dailyCaloriesByDate.set(entry.date, existing + entry.calories);
  });
  
  const dailyCalorieTotals = Array.from(dailyCaloriesByDate.values());
  const averageCalories = dailyCalorieTotals.length > 0 
    ? dailyCalorieTotals.reduce((sum, calories) => sum + calories, 0) / dailyCalorieTotals.length 
    : 3750; // Higher fallback for hardgainers when no data

  // Calculate TDEE based on weight change and calorie intake
  let tdee = averageCalories;
  
  if (Math.abs(weightTrend) > 0.05) { // If there's significant weight change (>50g/week)
    // 1 kg = ~7700 calories
    // Weight trend is in kg/week, so convert to daily calorie surplus/deficit
    const dailyCalorieBalance = (weightTrend * 7700) / 7;
    // TDEE = Average Intake - Daily Surplus/Deficit
    // If gaining weight (positive trend), then intake > TDEE, so TDEE = intake - surplus
    // If losing weight (negative trend), then intake < TDEE, so TDEE = intake - deficit (which is intake + positive value)
    tdee = Math.round(averageCalories - dailyCalorieBalance);
  } else {
    // If weight is stable, use baseline calculation - don't assume intake = TDEE
    // Use a conservative estimate: intake - expected surplus for hardgainers
    // This prevents showing intake as TDEE when user has stable weight
    tdee = Math.round(Math.max(3750, averageCalories - 200)); // Higher baseline for hardgainers
  }

  // Ensure TDEE is within reasonable bounds for adults
  tdee = Math.max(1200, Math.min(5000, tdee));

  // Use centralized calculation based on user's weight gain goal
  const calorieTargets = calculateCalorieTargets(tdee, weightGainGoal);
  const surplus = calorieTargets.surplus;
  const targetCalories = calorieTargets.targetCalories;

  // Calculate confidence based on data quality - more responsive for real-time calibration
  const uniqueWeightDays = new Set(weightEntries.map(e => e.date)).size;
  const uniqueCalorieDays = new Set(calorieEntries.map(e => e.date)).size;
  const dataPoints = Math.min(uniqueWeightDays, uniqueCalorieDays);
  
  let confidence = 0.2; // Base confidence starts higher for real-time feel
  if (dataPoints >= 2) confidence += 0.1; // Early data helps with calibration
  if (dataPoints >= 4) confidence += 0.2; // Building confidence
  if (dataPoints >= 7) confidence += 0.2; // Good week of data
  if (dataPoints >= 14) confidence += 0.2; // Two weeks is solid
  if (dataPoints >= 21) confidence += 0.1; // Three weeks is excellent
  if (Math.abs(weightTrend) < 0.2) confidence += 0.1; // Consistent data is good
  
  confidence = Math.min(1, confidence);

  // Determine data quality - adjusted for continuous calibration
  let dataQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
  if (dataPoints >= 21) dataQuality = 'excellent';
  else if (dataPoints >= 14) dataQuality = 'good';
  else if (dataPoints >= 7) dataQuality = 'fair';
  else if (dataPoints >= 2) dataQuality = 'poor'; // But still functional for real-time updates

  return {
    tdee,
    surplus,
    targetCalories,
    weightTrend,
    averageCalories: Math.round(averageCalories),
    confidence: Math.round(confidence * 100) / 100,
    dataQuality
  };
}

export function generateTdeeAnalysis(
  weightEntries: WeightEntry[],
  calorieEntries: CalorieEntry[],
  userId: string
): TdeeAnalysis {
  const calculation = calculateTdee(weightEntries, calorieEntries, userId);
  
  // Determine week number based on data collection
  const uniqueDays = new Set([
    ...weightEntries.map(e => e.date),
    ...calorieEntries.map(e => e.date)
  ]).size;
  
  const weekNumber = Math.ceil(uniqueDays / 7);

  return {
    id: Date.now().toString(),
    userId,
    tdee: calculation.tdee,
    surplus: calculation.surplus,
    targetCalories: calculation.targetCalories,
    confidence: calculation.confidence,
    dataPoints: Math.min(weightEntries.length, calorieEntries.length),
    weekNumber,
    createdAt: new Date().toISOString(),
  };
}

export function getProgressInsights(
  weightEntries: WeightEntry[],
  calorieEntries: CalorieEntry[],
  targetCalories?: number
): string[] {
  const insights: string[] = [];
  
  const uniqueWeightDays = new Set(weightEntries.map(e => e.date)).size;
  const uniqueCalorieDays = new Set(calorieEntries.map(e => e.date)).size;
  
  // Progress insights
  if (uniqueWeightDays < 7) {
    insights.push(`🚀 ${uniqueWeightDays} days logged! ${7 - uniqueWeightDays} more days will unlock your personalized analysis.`);
  }
  
  if (uniqueCalorieDays < 7) {
    insights.push(`💪 ${uniqueCalorieDays} days of nutrition logged! ${7 - uniqueCalorieDays} more days will unlock your analysis.`);
  }
  
  // Weight trend insights
  if (weightEntries.length >= 3) {
    const calculation = calculateTdee(weightEntries, calorieEntries, '');
    const weeklyTrend = calculation.weightTrend;
    
    if (weeklyTrend > 0.3) {
      insights.push('Great! You\'re gaining weight consistently');
    } else if (weeklyTrend > 0.1) {
      insights.push('You\'re gaining weight, but slowly. Consider increasing calories');
    } else if (weeklyTrend < -0.1) {
      insights.push('You\'re losing weight. Increase your calorie intake');
    } else {
      insights.push('Weight is stable. Time to add more calories for gains');
    }
  }
  
  // Calorie consistency insights
  if (calorieEntries.length >= 5) {
    const calories = calorieEntries.map(e => e.calories);
    const avg = calories.reduce((sum, cal) => sum + cal, 0) / calories.length;
    const variance = calories.reduce((sum, cal) => sum + Math.pow(cal - avg, 2), 0) / calories.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev > 500) {
      insights.push('Try to be more consistent with daily calorie intake');
    } else if (stdDev < 200) {
      insights.push('Great job maintaining consistent calorie intake!');
    }
    
    if (targetCalories && avg < targetCalories * 0.9) {
      insights.push(`You're averaging ${Math.round(avg)} kcal/day. Aim for ${targetCalories} kcal`);
    }
  }
  
  return insights;
}

export function formatMacroSplit(calories: number): { protein: number; carbs: number; fat: number } {
  // Optimal macro split for hardgainers
  const proteinRatio = 0.25; // 25% protein
  const fatRatio = 0.25; // 25% fat
  const carbRatio = 0.50; // 50% carbs
  
  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 kcal per gram
    carbs: Math.round((calories * carbRatio) / 4), // 4 kcal per gram
    fat: Math.round((calories * fatRatio) / 9), // 9 kcal per gram
  };
}