// Simplified OpenAI service that uses server endpoint
import { MealPlan, MealPlanRequest } from '@/types';

class OpenAIService {
  hasApiKey(): boolean {
    return true; // Server handles the API key
  }

  async generateMealPlan(request: MealPlanRequest): Promise<MealPlan> {
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const mealPlan: MealPlan = await response.json();
      return mealPlan;
    } catch (error) {
      throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWeeklyMealPlan(request: MealPlanRequest): Promise<MealPlan[]> {
    const weeklyPlans: MealPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      try {
        const dailyPlan = await this.generateMealPlan(request);
        dailyPlan.date = date.toISOString().split('T')[0];
        dailyPlan.id = `${dailyPlan.id}-day-${i}`;
        
        weeklyPlans.push(dailyPlan);
        
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        
        throw error;
      }
    }
    
    return weeklyPlans;
  }
}

export const openAIService = new OpenAIService();