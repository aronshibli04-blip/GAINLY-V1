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
- STRICTLY FOLLOW USER DIETARY PREFERENCES - if they say "no oatmeal", never include oatmeal
- ENSURE ACCURATE CALORIE CALCULATIONS - ingredient calories must add up to meal total

CRITICAL: Always respond with valid JSON only, no markdown code blocks, no additional text.`;

    const userPrompt = `Create an optimized hardgainer meal plan for aggressive weight gain:

Target: ${request.targetCalories} kcal (1100+ kcal surplus for 1kg/week gain)
DIETARY PREFERENCES (MUST FOLLOW EXACTLY): ${request.dietaryPreferences.join(', ') || 'None'}
Preferred foods: ${request.preferredFoods.join(', ') || 'Varied'}
Max meals: ${request.maxMealsPerDay} per day
Max prep time: ${request.maxPrepTime} minutes per meal
Cooking experience: ${request.cookingExperience}

MANDATORY REQUIREMENTS:
1. STRICTLY AVOID any foods mentioned in dietary preferences (e.g., if "no oatmeal" is specified, NEVER include oatmeal)
2. ACCURATE CALORIES: Each ingredient's calories must be realistic and the sum must equal the meal total
3. Prioritize calorie-dense foods (nuts, oils, dried fruits, protein powders)
4. Focus on healthy fats (30-35% of total calories)
5. Strategic meal timing (every 2-3 hours)
6. Easy-to-digest options for low appetite periods

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
- Optimize for minimal food volume, maximum caloric density
- Provide realistic portions and practical cooking instructions
- DOUBLE-CHECK: Ingredient calories must sum to meal total exactly
- NEVER include forbidden foods from dietary preferences

Respond with raw JSON only (no markdown formatting):`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Clean the response by removing markdown code blocks if present
      let cleanContent = content.trim();
      
      // Remove markdown code blocks more aggressively
      if (cleanContent.includes('```json')) {
        const startIndex = cleanContent.indexOf('```json') + 7;
        const endIndex = cleanContent.lastIndexOf('```');
        if (endIndex > startIndex) {
          cleanContent = cleanContent.substring(startIndex, endIndex).trim();
        }
      } else if (cleanContent.includes('```')) {
        const startIndex = cleanContent.indexOf('```') + 3;
        const endIndex = cleanContent.lastIndexOf('```');
        if (endIndex > startIndex) {
          cleanContent = cleanContent.substring(startIndex, endIndex).trim();
        }
      }

      // Response cleaning complete
      
      // Additional JSON cleaning
      cleanContent = cleanContent
        .replace(/'/g, '"')  // Replace single quotes with double quotes
        .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']'); // Remove trailing commas before closing brackets

      // Parse the JSON response with better error handling
      let mealPlanData;
      try {
        mealPlanData = JSON.parse(cleanContent);
      } catch (jsonError: any) {
        // If JSON is truncated, try to find the last valid closing brace
        const lastBraceIndex = cleanContent.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          const truncatedContent = cleanContent.substring(0, lastBraceIndex + 1);
          try {
            mealPlanData = JSON.parse(truncatedContent);
            // Recovered from truncated JSON response
          } catch (secondError) {
            throw new Error('Invalid JSON response format');
          }
        } else {
          throw new Error('Invalid JSON response format');
        }
      }
      
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
      
      throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async scanNutritionLabel(base64Image: string): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert specialized in analyzing nutrition labels. Extract nutrition information from the uploaded image and return it in JSON format.

IMPORTANT RULES:
1. Extract values per 100g serving if available, otherwise per serving shown
2. Only extract these 4 core values: calories, protein, carbs, fat
3. Convert all values to numbers (remove units like "g", "kcal", etc.)
4. If multiple serving sizes shown, prioritize "per 100g" data
5. For carbs, use total carbohydrates (not net carbs)
6. Return serving size information if clearly visible

Response format (JSON only):
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servingSize": "100g" or "1 serving" etc (optional)
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this nutrition label and extract the nutrition information in JSON format. Focus on getting accurate values for calories, protein, carbs, and fat."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const nutritionData = JSON.parse(content);
      
      // Validate the response has required fields
      if (typeof nutritionData.calories !== 'number' || 
          typeof nutritionData.protein !== 'number' || 
          typeof nutritionData.carbs !== 'number' || 
          typeof nutritionData.fat !== 'number') {
        throw new Error('Invalid nutrition data format');
      }

      return {
        calories: Math.round(nutritionData.calories),
        protein: Math.round(nutritionData.protein * 10) / 10, // 1 decimal place
        carbs: Math.round(nutritionData.carbs * 10) / 10,
        fat: Math.round(nutritionData.fat * 10) / 10,
        servingSize: nutritionData.servingSize || "100g"
      };
    } catch (error) {
      
      throw new Error('Failed to analyze nutrition label');
    }
  }
}