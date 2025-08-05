import { MealPlanRequest, MealPlan } from '../types';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenAIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  constructor() {
    // Load API key from localStorage on initialization
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
    }
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generateMealPlan(request: MealPlanRequest): Promise<MealPlan> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const systemPrompt = `You are a nutrition expert specializing in weight gain meal plans for hardgainers. 
    Create detailed, practical meal plans with accurate calorie and macro calculations. 
    Always respond with valid JSON only, no additional text or markdown.`;

    const userPrompt = `Create a daily meal plan for:
    - Target calories: ${request.targetCalories} kcal
    - Dietary preferences: ${request.dietaryPreferences.join(', ') || 'None'}
    - Preferred foods: ${request.preferredFoods.join(', ') || 'Varied'}
    - Max meals per day: ${request.maxMealsPerDay}
    - Max prep time per meal: ${request.maxPrepTime} minutes
    - Cooking experience: ${request.cookingExperience}

    Respond with JSON in this exact format:
    {
      "meals": [
        {
          "id": "meal-1",
          "name": "Protein Pancakes",
          "type": "breakfast",
          "calories": 650,
          "protein": 35,
          "carbs": 70,
          "fat": 18,
          "ingredients": [
            {
              "id": "ing-1",
              "name": "Oats",
              "amount": 80,
              "unit": "g",
              "calories": 300
            }
          ],
          "instructions": [
            "Mix oats with protein powder",
            "Add eggs and milk",
            "Cook on medium heat"
          ],
          "prepTime": 5,
          "cookTime": 15
        }
      ],
      "shoppingList": [
        {
          "id": "shop-1",
          "name": "Oats",
          "amount": 1,
          "unit": "kg",
          "category": "Grains",
          "purchased": false
        }
      ]
    }

    Make sure calories add up correctly and provide practical, achievable recipes.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result: OpenAIResponse = await response.json();
      const content = result.choices[0].message.content;

      // Parse the JSON response
      const mealPlanData = JSON.parse(content);
      
      // Calculate totals
      const totalCalories = mealPlanData.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0);
      const totalProtein = mealPlanData.meals.reduce((sum: number, meal: any) => sum + meal.protein, 0);
      const totalCarbs = mealPlanData.meals.reduce((sum: number, meal: any) => sum + meal.carbs, 0);
      const totalFat = mealPlanData.meals.reduce((sum: number, meal: any) => sum + meal.fat, 0);

      // Create the meal plan object
      const mealPlan: MealPlan = {
        id: Date.now().toString(),
        userId: request.userId,
        date: new Date().toISOString().split('T')[0],
        meals: mealPlanData.meals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        shoppingList: mealPlanData.shoppingList,
        createdAt: new Date().toISOString(),
      };

      return mealPlan;
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      if (error.message.includes('401')) {
        throw new Error('Invalid OpenAI API key. Please check your key and try again.');
      } else if (error.message.includes('429')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to generate meal plan. Please try again.');
      }
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
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating meal plan for day ${i + 1}:`, error);
        // Continue with other days even if one fails
      }
    }
    
    return weeklyPlans;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }
}

export const openAIService = new OpenAIService();