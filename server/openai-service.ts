import OpenAI from 'openai';

interface MealPlanRequest {
  targetCalories: number;
  dietaryPreferences: string[];
  preferredFoods: string[];
  maxMealsPerDay: number;
  maxPrepTime: number;
  cookingExperience: string;
  userId: string;
}

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    calories: number;
  }>;
  instructions: string[];
  prepTime: number;
  cookTime: number;
}

interface MealPlan {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  shoppingList: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    category: string;
    purchased: boolean;
  }>;
  createdAt: string;
}

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateMealPlan(request: MealPlanRequest): Promise<MealPlan> {
    const systemPrompt = `You are an elite nutrition specialist and meal planning expert with 15+ years of experience helping hardgainers achieve aggressive weight gain goals. You understand the unique challenges of gaining 1kg per week and specialize in high-calorie, nutrient-dense meal plans.

Key principles:
- Hardgainers need aggressive calorie surplus (1100+ kcal above TDEE)
- Focus on calorie-dense, easy-to-digest foods
- Minimize food volume while maximizing calories
- Account for low appetite with strategic meal timing
- Emphasize liquid calories and healthy fats
- Provide practical, time-efficient recipes

Always respond with valid JSON only, no markdown or additional text.`;

    const userPrompt = `Create an optimized hardgainer meal plan for aggressive weight gain:

Target: ${request.targetCalories} kcal (1100+ kcal surplus for 1kg/week gain)
Dietary preferences: ${request.dietaryPreferences.join(', ') || 'None'}
Preferred foods: ${request.preferredFoods.join(', ') || 'Varied'}
Max meals: ${request.maxMealsPerDay} per day
Max prep time: ${request.maxPrepTime} minutes per meal
Cooking experience: ${request.cookingExperience}

HARDGAINER-SPECIFIC REQUIREMENTS:
- Prioritize calorie-dense foods (nuts, oils, dried fruits, protein powders)
- Include liquid calories (smoothies, protein shakes, milk-based drinks)
- Minimize fiber-heavy foods that cause satiety
- Focus on healthy fats (30-35% of total calories)
- Strategic meal timing (every 2-3 hours)
- Easy-to-digest options for low appetite periods

Respond with JSON in this exact format:
{
  "meals": [
    {
      "id": "meal-1",
      "name": "High-Calorie Protein Smoothie",
      "type": "breakfast",
      "calories": 800,
      "protein": 40,
      "carbs": 80,
      "fat": 30,
      "ingredients": [
        {
          "id": "ing-1",
          "name": "Whole milk",
          "amount": 300,
          "unit": "ml",
          "calories": 200
        },
        {
          "id": "ing-2",
          "name": "Protein powder",
          "amount": 30,
          "unit": "g",
          "calories": 120
        },
        {
          "id": "ing-3",
          "name": "Peanut butter",
          "amount": 30,
          "unit": "g",
          "calories": 180
        },
        {
          "id": "ing-4",
          "name": "Banana",
          "amount": 100,
          "unit": "g",
          "calories": 90
        },
        {
          "id": "ing-5",
          "name": "Oats",
          "amount": 40,
          "unit": "g",
          "calories": 150
        },
        {
          "id": "ing-6",
          "name": "Olive oil",
          "amount": 10,
          "unit": "ml",
          "calories": 90
        }
      ],
      "instructions": [
        "Blend all ingredients until smooth",
        "Add ice if desired for consistency",
        "Consume immediately for best taste"
      ],
      "prepTime": 3,
      "cookTime": 0
    }
  ],
  "shoppingList": [
    {
      "id": "shop-1",
      "name": "Whole milk",
      "amount": 1,
      "unit": "L",
      "category": "Dairy",
      "purchased": false
    }
  ]
}

CRITICAL REQUIREMENTS:
- Each meal must be calorie-dense and hardgainer-optimized
- Include specific Norwegian ingredients when possible
- Calories must add up precisely to target (±50 kcal tolerance)
- Prioritize quick-prep options for busy schedules
- Include at least 2 liquid calorie sources per day
- Optimize for minimal food volume, maximum caloric density
- Provide realistic portions and practical cooking instructions`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

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
    } catch (error) {
      console.error('OpenAI meal plan generation error:', error);
      throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}