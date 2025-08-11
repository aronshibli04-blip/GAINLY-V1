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

  // AI Meal Plan Generation
  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const openAIService = new OpenAIService();
      const mealPlanRequest = {
        targetCalories: req.body.targetCalories || 6000,
        dietaryPreferences: req.body.dietaryPreferences || [],
        preferredFoods: req.body.preferredFoods || [],
        maxMealsPerDay: req.body.maxMealsPerDay || 6,
        maxPrepTime: req.body.maxPrepTime || 15,
        cookingExperience: req.body.cookingExperience || 'Beginner',
        userId: req.body.userId || 'user1'
      };

      const mealPlan = await openAIService.generateMealPlan(mealPlanRequest);
      res.json(mealPlan);
    } catch (error: any) {
      console.error('Meal plan generation error:', error);
      res.status(500).json({ 
        message: `Failed to generate meal plan: ${error.message}`,
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
