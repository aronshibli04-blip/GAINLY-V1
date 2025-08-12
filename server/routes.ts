import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWeightLogSchema, 
  insertMealLogSchema, 
  insertActivityLogSchema,
  insertAiAnalysisSchema 
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

  // Food search routes
  app.get("/api/foods/search", async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const foods = await storage.searchFoodItems(query);
      res.json(foods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const food = await storage.getFoodItemById(req.params.id);
      res.json(food || null);
    } catch (error: any) {
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
      } catch (openAIError) {
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

  const httpServer = createServer(app);
  return httpServer;
}
