import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWeightLogSchema, 
  insertMealLogSchema, 
  insertActivityLogSchema,
  insertAiAnalysisSchema,
  insertFoodItemSchema,
  insertDailyRoutineSchema,
  insertDailyRoutineCompletionSchema
} from "@shared/schema";
import { calculateTdeeAndPlan } from "./ai-analysis";
import { OpenAIService } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Weight log routes
  app.post("/api/weight-logs", async (req, res) => {
    try {
      const weightLogData = insertWeightLogSchema.parse(req.body);
      const weightLog = await storage.createWeightLog(weightLogData);
      res.json(weightLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/weight-logs/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const weightLogs = await storage.getWeightLogsByUser(req.params.userId, limit);
      res.json(weightLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weight-logs/:userId/:date", async (req, res) => {
    try {
      const weightLog = await storage.getWeightLogByDate(req.params.userId, req.params.date);
      res.json(weightLog || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Meal log routes
  app.post("/api/meal-logs", async (req, res) => {
    try {
      const mealLogData = insertMealLogSchema.parse(req.body);
      const mealLog = await storage.createMealLog(mealLogData);
      res.json(mealLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/meal-logs/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const mealLogs = await storage.getMealLogsByUser(req.params.userId, limit);
      res.json(mealLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/meal-logs/:userId/:date", async (req, res) => {
    try {
      const mealLogs = await storage.getMealLogsByDate(req.params.userId, req.params.date);
      res.json(mealLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/daily-calories/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const dailyCalories = await storage.getDailyCaloriesByUser(req.params.userId, limit);
      res.json(dailyCalories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity log routes
  app.post("/api/activity-logs", async (req, res) => {
    try {
      const activityLogData = insertActivityLogSchema.parse(req.body);
      const activityLog = await storage.createActivityLog(activityLogData);
      res.json(activityLog);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/activity-logs/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activityLogs = await storage.getActivityLogsByUser(req.params.userId, limit);
      res.json(activityLogs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/activity-logs/:userId/:date", async (req, res) => {
    try {
      const activityLog = await storage.getActivityLogByDate(req.params.userId, req.params.date);
      res.json(activityLog || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Data collection progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getDataCollectionProgress(req.params.userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Analysis routes
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if user has enough data (minimum 7 days)
      const progress = await storage.getDataCollectionProgress(userId);
      const minDays = 7;
      
      if (progress.weightLogs < minDays || progress.mealDays < minDays) {
        return res.status(400).json({ 
          message: `Insufficient data. Need at least ${minDays} days of weight and meal logs.`,
          progress 
        });
      }

      // Get user data for analysis
      const weightLogs = await storage.getWeightLogsByUser(userId, 21);
      const dailyCalories = await storage.getDailyCaloriesByUser(userId, 21);
      
      // Calculate TDEE and plan
      const analysis = calculateTdeeAndPlan(weightLogs, dailyCalories);
      
      // Save analysis
      const analysisData = insertAiAnalysisSchema.parse({
        userId,
        calculatedTdee: analysis.tdee,
        recommendedSurplus: analysis.surplus,
        targetCalories: analysis.targetCalories,
        analysisDate: new Date().toISOString().split('T')[0],
        dataPoints: Math.min(progress.weightLogs, progress.mealDays)
      });

      const savedAnalysis = await storage.createAiAnalysis(analysisData);
      res.json({ ...savedAnalysis, ...analysis });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ai-analysis/:userId", async (req, res) => {
    try {
      const analysis = await storage.getLatestAiAnalysis(req.params.userId);
      res.json(analysis || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Coach Chat endpoint
  app.post("/api/ai-coach/chat", async (req, res) => {
    try {
      const { message, userId, userData } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ message: "Message and userId are required" });
      }

      const { AICoachService } = await import('./ai-coach-service');
      const response = await AICoachService.getPersonalizedResponse(message, userData);
      
      res.json({ response });
    } catch (error: any) {
      console.error('AI Coach chat error:', error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Food items CRUD routes
  app.post("/api/food-items", async (req, res) => {
    try {
      const foodData = insertFoodItemSchema.parse(req.body);
      const foodItem = await storage.createFoodItem(foodData);
      res.json(foodItem);
    } catch (error: any) {
      console.error('Food item creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Daily routines routes
  app.post("/api/daily-routines", async (req, res) => {
    try {
      const routineData = insertDailyRoutineSchema.parse(req.body);
      const routine = await storage.createDailyRoutine(routineData);
      res.json(routine);
    } catch (error: any) {
      console.error('Daily routine creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/daily-routines/:userId", async (req, res) => {
    try {
      const routines = await storage.getDailyRoutinesByUser(req.params.userId);
      res.json(routines);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Daily routine completions routes
  app.post("/api/daily-routine-completions", async (req, res) => {
    try {
      const completionData = insertDailyRoutineCompletionSchema.parse(req.body);
      const completion = await storage.createDailyRoutineCompletion(completionData);
      
      // Update user stats
      await storage.updateUserStats(completionData.userId, completionData.pointsEarned);
      
      res.json(completion);
    } catch (error: any) {
      console.error('Daily routine completion error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/daily-routine-completions/:userId/:date", async (req, res) => {
    try {
      const completions = await storage.getDailyRoutineCompletionsByDate(req.params.userId, req.params.date);
      res.json(completions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User stats route
  app.get("/api/user-stats/:userId", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Food search routes - now using FatSecret API
  app.get("/api/foods/search", async (req, res) => {
    try {
      const query = req.query.q as string || '';
      
      // Try FatSecret API first for comprehensive database
      const { fatSecretService } = await import('./fatsecret-service');
      const fatSecretFoods = await fatSecretService.searchFoods(query);
      
      if (fatSecretFoods.length > 0) {
        res.json(fatSecretFoods);
        return;
      }
      
      // Fallback to local database if FatSecret has no results
      const localFoods = await storage.searchFoodItems(query);
      res.json(localFoods);
    } catch (error: any) {
      console.error('Food search error:', error);
      
      // Fallback to local database on API error
      try {
        const localFoods = await storage.searchFoodItems(req.query.q as string || '');
        res.json(localFoods);
      } catch (fallbackError: any) {
        res.status(500).json({ message: fallbackError.message });
      }
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      // Try FatSecret API first if ID looks like FatSecret format
      if (req.params.id.match(/^\d+$/)) {
        const { fatSecretService } = await import('./fatsecret-service');
        const fatSecretFood = await fatSecretService.getFoodDetails(req.params.id);
        if (fatSecretFood) {
          res.json(fatSecretFood);
          return;
        }
      }
      
      // Fallback to local database
      const food = await storage.getFoodItemById(req.params.id);
      res.json(food || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Barcode search endpoint
  app.get("/api/foods/barcode/:barcode", async (req, res) => {
    try {
      const { fatSecretService } = await import('./fatsecret-service');
      const food = await fatSecretService.searchByBarcode(req.params.barcode);
      res.json(food);
    } catch (error: any) {
      console.error('Barcode search error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // AI Meal Plan Generation with fallback
  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const mealPlanRequest = {
        targetCalories: req.body.targetCalories || 6000,
        dietaryPreferences: req.body.dietaryPreferences || [],
        preferredFoods: req.body.preferredFoods || [],
        maxMealsPerDay: req.body.maxMealsPerDay || 6,
        maxPrepTime: req.body.maxPrepTime || 15,
        cookingExperience: req.body.cookingExperience || 'Beginner',
        userId: req.body.userId || 'user1'
      };

      // Try OpenAI first, with fallback for reliability
      let mealPlan;
      try {
        const openAIService = new OpenAIService();
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI timeout')), 45000)
        );
        
        mealPlan = await Promise.race([
          openAIService.generateMealPlan(mealPlanRequest),
          timeout
        ]);
        
        console.log('Successfully generated meal plan with OpenAI GPT-4o');
      } catch (openAIError: any) {
        console.log('OpenAI failed, using hardgainer fallback:', openAIError.message);
        mealPlan = generateHardgainerFallbackMealPlan(mealPlanRequest);
      }

      res.json(mealPlan);
    } catch (error: any) {
      console.error('Meal plan generation error:', error);
      res.status(500).json({ 
        message: `Failed to generate meal plan: ${error.message}`,
        error: error.message 
      });
    }
  });

  // Update meal log
  app.patch("/api/meal-logs/:id", async (req, res) => {
    try {
      const mealId = req.params.id;
      const updates = req.body;
      const updatedMeal = await storage.updateMealLog(mealId, updates);
      res.json(updatedMeal);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete meal log
  app.delete("/api/meal-logs/:id", async (req, res) => {
    try {
      const mealId = req.params.id;
      await storage.deleteMealLog(mealId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI nutrition label scanning
  app.post("/api/scan-nutrition", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ message: "Base64 image data required" });
      }

      const openaiService = new OpenAIService();
      const nutritionData = await openaiService.scanNutritionLabel(image);

      res.json(nutritionData);
    } catch (error: any) {
      console.error("Nutrition scanning error:", error);
      res.status(500).json({ message: "Failed to scan nutrition label" });
    }
  });

  // Clear test data from database
  app.post("/api/clear-test-data", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Clear old meal logs with test data patterns
      const testDescriptions = ['Dates', 'Whole Egg', 'Medjool'];
      for (const desc of testDescriptions) {
        await storage.deleteMealLogsByDescription(userId, desc);
      }
      
      // Clear old weight logs from August test period
      await storage.deleteWeightLogsByDateRange(userId, '2025-08-01', '2025-08-31');
      
      res.json({ message: "Test data cleared successfully" });
    } catch (error: any) {
      console.error("Error clearing test data:", error);
      res.status(500).json({ 
        message: "Failed to clear test data", 
        error: error.message 
      });
    }
  });

  function generateHardgainerFallbackMealPlan(request: any) {
    const avoidOatmeal = request.dietaryPreferences.some((pref: string) => 
      pref.toLowerCase().includes('oat') || pref.toLowerCase().includes('oat meal')
    );
    const avoidProteinShake = request.dietaryPreferences.some((pref: string) => 
      pref.toLowerCase().includes('protein shake') || pref.toLowerCase().includes('liquid protein')
    );
    
    const targetPerMeal = Math.floor(request.targetCalories / request.maxMealsPerDay);
    
    return {
      id: Date.now().toString(),
      userId: request.userId,
      date: new Date().toISOString().split('T')[0],
      meals: [
        {
          id: "breakfast",
          name: avoidOatmeal ? "High-Calorie Breakfast Bowl" : "Hardgainer Breakfast",
          type: "breakfast",
          calories: targetPerMeal,
          protein: 45,
          carbs: 65,
          fat: 35,
          ingredients: avoidOatmeal ? [
            { id: "eggs", name: "Whole eggs", amount: 3, unit: "pieces", calories: 210 },
            { id: "bread", name: "Whole grain bread", amount: 2, unit: "slices", calories: 160 },
            { id: "butter", name: "Butter", amount: 20, unit: "g", calories: 144 },
            { id: "banana", name: "Banana", amount: 150, unit: "g", calories: 135 },
            { id: "nuts", name: "Mixed nuts", amount: 30, unit: "g", calories: 180 },
            { id: "milk", name: "Whole milk", amount: 200, unit: "ml", calories: 130 }
          ] : [
            { id: "oatmeal", name: "Oatmeal", amount: 120, unit: "g", calories: 450 },
            { id: "banana", name: "Banana", amount: 2, unit: "medium", calories: 210 },
            { id: "protein-powder", name: "Protein powder", amount: 40, unit: "g", calories: 160 },
            { id: "peanut-butter", name: "Peanut butter", amount: 30, unit: "g", calories: 180 },
            { id: "milk", name: "Whole milk", amount: 300, unit: "ml", calories: 200 }
          ],
          instructions: avoidOatmeal ? [
            "Scramble eggs with butter in a pan",
            "Toast bread and spread remaining butter",
            "Slice banana and sprinkle nuts on top",
            "Serve with a glass of whole milk"
          ] : [
            "Mix oatmeal with protein powder and milk, add sliced bananas and peanut butter"
          ],
          prepTime: 8,
          cookTime: 5
        },
        {
          id: "lunch",
          name: "Power-Packed Chicken Rice Bowl",
          type: "lunch",
          calories: targetPerMeal,
          protein: 55,
          carbs: 80,
          fat: 25,
          ingredients: [
            { id: "chicken", name: "Chicken breast", amount: 200, unit: "g", calories: 330 },
            { id: "rice", name: "Basmati rice", amount: 100, unit: "g", calories: 350 },
            { id: "avocado", name: "Avocado", amount: 100, unit: "g", calories: 160 },
            { id: "olive-oil", name: "Olive oil", amount: 15, unit: "ml", calories: 135 },
            { id: "vegetables", name: "Mixed vegetables", amount: 150, unit: "g", calories: 75 }
          ],
          instructions: [
            "Cook rice according to package instructions",
            "Season and grill chicken breast with olive oil",
            "Steam mixed vegetables",
            "Serve chicken over rice with sliced avocado and vegetables"
          ],
          prepTime: 10,
          cookTime: 15
        },
        {
          id: "snack1",
          name: "Energy-Dense Nut Mix",
          type: "snack",
          calories: Math.floor(targetPerMeal * 0.8),
          protein: 25,
          carbs: 35,
          fat: 45,
          ingredients: [
            { id: "almonds", name: "Almonds", amount: 40, unit: "g", calories: 240 },
            { id: "dates", name: "Dates", amount: 50, unit: "g", calories: 140 },
            { id: "peanut-butter", name: "Peanut butter", amount: 25, unit: "g", calories: 150 },
            { id: "dark-chocolate", name: "Dark chocolate", amount: 20, unit: "g", calories: 110 }
          ],
          instructions: [
            "Mix almonds with chopped dates",
            "Add small portions of peanut butter",
            "Include dark chocolate pieces",
            "Eat as energy-dense snack"
          ],
          prepTime: 3,
          cookTime: 0
        },
        {
          id: "dinner",
          name: "Calorie-Rich Salmon & Quinoa",
          type: "dinner",
          calories: targetPerMeal,
          protein: 50,
          carbs: 55,
          fat: 40,
          ingredients: [
            { id: "salmon", name: "Salmon fillet", amount: 180, unit: "g", calories: 365 },
            { id: "quinoa", name: "Quinoa", amount: 80, unit: "g", calories: 290 },
            { id: "sweet-potato", name: "Sweet potato", amount: 150, unit: "g", calories: 130 },
            { id: "coconut-oil", name: "Coconut oil", amount: 15, unit: "ml", calories: 135 },
            { id: "spinach", name: "Spinach", amount: 100, unit: "g", calories: 25 }
          ],
          instructions: [
            "Cook quinoa in vegetable broth",
            "Roast sweet potato with coconut oil",
            "Pan-sear salmon until crispy",
            "Sauté spinach briefly",
            "Serve salmon over quinoa with roasted sweet potato"
          ],
          prepTime: 12,
          cookTime: 18
        },
        {
          id: "snack2",
          name: "High-Calorie Smoothie Bowl",
          type: "snack",
          calories: Math.floor(targetPerMeal * 0.9),
          protein: 30,
          carbs: 65,
          fat: 25,
          ingredients: [
            { id: "protein-powder", name: avoidProteinShake ? "Greek yogurt" : "Protein powder", amount: avoidProteinShake ? 200 : 30, unit: avoidProteinShake ? "g" : "g", calories: avoidProteinShake ? 180 : 120 },
            { id: "full-fat-milk", name: "Whole milk", amount: 300, unit: "ml", calories: 195 },
            { id: "berries", name: "Mixed berries", amount: 100, unit: "g", calories: 85 },
            { id: "honey", name: "Honey", amount: 25, unit: "g", calories: 82 },
            { id: "granola", name: "Granola", amount: 40, unit: "g", calories: 180 }
          ],
          instructions: [
            avoidProteinShake ? "Blend Greek yogurt with milk and berries" : "Blend protein powder with milk and berries",
            "Add honey for sweetness",
            "Pour into bowl",
            "Top with granola for crunch"
          ],
          prepTime: 5,
          cookTime: 0
        }
      ],
      totalCalories: request.targetCalories,
      totalProtein: 205,
      totalCarbs: 300,
      totalFat: 170,
      shoppingList: [
        { id: "eggs", name: "Whole eggs", amount: 12, unit: "pieces", category: "Dairy", purchased: false },
        { id: "chicken", name: "Chicken breast", amount: 500, unit: "g", category: "Meat", purchased: false },
        { id: "salmon", name: "Salmon fillet", amount: 400, unit: "g", category: "Fish", purchased: false },
        { id: "rice", name: "Basmati rice", amount: 500, unit: "g", category: "Grains", purchased: false },
        { id: "quinoa", name: "Quinoa", amount: 500, unit: "g", category: "Grains", purchased: false },
        { id: "bread", name: "Whole grain bread", amount: 1, unit: "loaf", category: "Bakery", purchased: false },
        { id: "milk", name: "Whole milk", amount: 1, unit: "L", category: "Dairy", purchased: false },
        { id: "nuts", name: "Mixed nuts", amount: 200, unit: "g", category: "Snacks", purchased: false },
        { id: "avocado", name: "Avocado", amount: 3, unit: "pieces", category: "Produce", purchased: false },
        { id: "vegetables", name: "Mixed vegetables", amount: 500, unit: "g", category: "Produce", purchased: false }
      ],
      createdAt: new Date().toISOString(),
    };
  }

  // AI Reward Generation route
  app.post("/api/generate-rewards", async (req, res) => {
    try {
      const { goalWeight, userPreferences, currentReward } = req.body;
      
      if (!goalWeight || !userPreferences) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const { generatePersonalizedRewards } = await import('./reward-generator');
      const rewards = await generatePersonalizedRewards(goalWeight, userPreferences, currentReward);
      res.json({ rewards });
    } catch (error: any) {
      console.error("Reward generation error:", error);
      res.status(500).json({ message: "Failed to generate rewards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
