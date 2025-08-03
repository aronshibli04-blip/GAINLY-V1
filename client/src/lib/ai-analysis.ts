export interface TdeeAnalysisResult {
  tdee: number;
  surplus: number;
  targetCalories: number;
  weightTrend: number;
  avgCalories: number;
  confidence: number;
  recommendation: string;
}

export function formatAnalysisResults(analysis: any): TdeeAnalysisResult {
  const confidence = Math.round((analysis.confidence || 0.7) * 100);
  
  let recommendation = "";
  if (analysis.weightTrend > 0.5) {
    recommendation = "You're gaining weight well! Continue with current calorie target.";
  } else if (analysis.weightTrend < -0.2) {
    recommendation = "You're losing weight. Consider increasing calories by 200-300.";
  } else {
    recommendation = "Weight is stable. Increase calories gradually for consistent gains.";
  }

  return {
    tdee: analysis.calculatedTdee,
    surplus: analysis.recommendedSurplus,
    targetCalories: analysis.targetCalories,
    weightTrend: analysis.weightTrend || 0,
    avgCalories: analysis.avgCalories || 0,
    confidence: confidence,
    recommendation
  };
}

export function getMealPlanSuggestions(targetCalories: number) {
  const suggestions = {
    breakfast: Math.round(targetCalories * 0.25),
    lunch: Math.round(targetCalories * 0.30),
    dinner: Math.round(targetCalories * 0.30),
    snacks: Math.round(targetCalories * 0.15),
  };

  return {
    ...suggestions,
    foods: {
      protein: ["Chicken breast", "Lean beef", "Fish", "Eggs", "Greek yogurt", "Protein powder"],
      carbs: ["Oats", "Rice", "Pasta", "Sweet potato", "Quinoa", "Bread"],
      fats: ["Nuts", "Avocado", "Olive oil", "Peanut butter", "Seeds"],
      vegetables: ["Broccoli", "Spinach", "Bell peppers", "Carrots", "Tomatoes"]
    }
  };
}
