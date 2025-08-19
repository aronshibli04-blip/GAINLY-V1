import { 
  type User, 
  type InsertUser,
  type WeightLog,
  type InsertWeightLog,
  type MealLog,
  type InsertMealLog,
  type ActivityLog,
  type InsertActivityLog,
  type AiAnalysis,
  type InsertAiAnalysis,
  type FoodItem,
  type InsertFoodItem,
  type DailyRoutine,
  type InsertDailyRoutine,
  type DailyRoutineCompletion,
  type InsertDailyRoutineCompletion,
  type UserStats,
  users,
  weightLogs,
  mealLogs,
  activityLogs,
  aiAnalysis,
  foodItems,
  dailyRoutines,
  dailyRoutineCompletions,
  userStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Weight log methods
  createWeightLog(weightLog: InsertWeightLog): Promise<WeightLog>;
  getWeightLogsByUser(userId: string, limit?: number): Promise<WeightLog[]>;
  getWeightLogByDate(userId: string, date: string): Promise<WeightLog | undefined>;

  // Meal log methods
  createMealLog(mealLog: InsertMealLog): Promise<MealLog>;
  getMealLogsByUser(userId: string, limit?: number): Promise<MealLog[]>;
  getMealLogsByDate(userId: string, date: string): Promise<MealLog[]>;
  getDailyCaloriesByUser(userId: string, limit?: number): Promise<{ logDate: string; totalCalories: number }[]>;

  // Activity log methods
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUser(userId: string, limit?: number): Promise<ActivityLog[]>;
  getActivityLogByDate(userId: string, date: string): Promise<ActivityLog | undefined>;

  // AI analysis methods
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getLatestAiAnalysis(userId: string): Promise<AiAnalysis | undefined>;

  // Data collection progress
  getDataCollectionProgress(userId: string): Promise<{
    weightLogs: number;
    mealDays: number;
    activityLogs: number;
    totalDays: number;
  }>;

  // Food search methods
  searchFoodItems(query: string): Promise<FoodItem[]>;
  getFoodItemById(id: string): Promise<FoodItem | undefined>;

  // Meal log edit methods
  updateMealLog(mealId: string, updates: Partial<InsertMealLog>): Promise<MealLog>;
  deleteMealLog(mealId: string): Promise<void>;
  deleteMealLogsByDescription(userId: string, description: string): Promise<void>;
  deleteWeightLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createWeightLog(weightLog: InsertWeightLog): Promise<WeightLog> {
    const [log] = await db
      .insert(weightLogs)
      .values(weightLog)
      .returning();
    return log;
  }

  async getWeightLogsByUser(userId: string, limit: number = 30): Promise<WeightLog[]> {
    return await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.logDate))
      .limit(limit);
  }

  async getWeightLogByDate(userId: string, date: string): Promise<WeightLog | undefined> {
    const [log] = await db
      .select()
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), eq(weightLogs.logDate, date)));
    return log || undefined;
  }

  async createMealLog(mealLog: InsertMealLog): Promise<MealLog> {
    const [log] = await db
      .insert(mealLogs)
      .values(mealLog)
      .returning();
    return log;
  }

  async getMealLogsByUser(userId: string, limit: number = 100): Promise<MealLog[]> {
    return await db
      .select()
      .from(mealLogs)
      .where(eq(mealLogs.userId, userId))
      .orderBy(desc(mealLogs.createdAt))
      .limit(limit);
  }

  async getMealLogsByDate(userId: string, date: string): Promise<MealLog[]> {
    return await db
      .select()
      .from(mealLogs)
      .where(and(eq(mealLogs.userId, userId), eq(mealLogs.logDate, date)))
      .orderBy(desc(mealLogs.createdAt));
  }

  async getDailyCaloriesByUser(userId: string, limit: number = 30): Promise<{ logDate: string; totalCalories: number }[]> {
    const result = await db
      .select({
        logDate: mealLogs.logDate,
        totalCalories: sql<number>`sum(${mealLogs.calories})::int`,
      })
      .from(mealLogs)
      .where(eq(mealLogs.userId, userId))
      .groupBy(mealLogs.logDate)
      .orderBy(desc(mealLogs.logDate))
      .limit(limit);
    
    return result;
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(activityLog)
      .returning();
    return log;
  }

  async getActivityLogsByUser(userId: string, limit: number = 30): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.logDate))
      .limit(limit);
  }

  async getActivityLogByDate(userId: string, date: string): Promise<ActivityLog | undefined> {
    const [log] = await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), eq(activityLogs.logDate, date)));
    return log || undefined;
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [result] = await db
      .insert(aiAnalysis)
      .values(analysis)
      .returning();
    return result;
  }

  async getLatestAiAnalysis(userId: string): Promise<AiAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.userId, userId))
      .orderBy(desc(aiAnalysis.createdAt))
      .limit(1);
    return analysis || undefined;
  }

  async getDataCollectionProgress(userId: string): Promise<{
    weightLogs: number;
    mealDays: number;
    activityLogs: number;
    totalDays: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [weightCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), gte(weightLogs.logDate, thirtyDaysAgoStr)));

    const [mealDayCount] = await db
      .select({ count: sql<number>`count(distinct ${mealLogs.logDate})::int` })
      .from(mealLogs)
      .where(and(eq(mealLogs.userId, userId), gte(mealLogs.logDate, thirtyDaysAgoStr)));

    const [activityCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), gte(activityLogs.logDate, thirtyDaysAgoStr)));

    // Calculate total days since first log
    const [firstLog] = await db
      .select({ firstDate: sql<string>`min(${weightLogs.logDate})` })
      .from(weightLogs)
      .where(eq(weightLogs.userId, userId));

    let totalDays = 1;
    if (firstLog?.firstDate) {
      const firstDate = new Date(firstLog.firstDate);
      const today = new Date();
      totalDays = Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    return {
      weightLogs: weightCount?.count || 0,
      mealDays: mealDayCount?.count || 0,
      activityLogs: activityCount?.count || 0,
      totalDays,
    };
  }

  async searchFoodItems(query: string): Promise<FoodItem[]> {
    if (!query.trim()) return [];
    
    const searchResults = await db
      .select()
      .from(foodItems)
      .where(sql`LOWER(${foodItems.name}) LIKE LOWER(${'%' + query + '%'})`)
      .limit(20);
    
    return searchResults;
  }

  async getFoodItemById(id: string): Promise<FoodItem | undefined> {
    const [foodItem] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return foodItem || undefined;
  }

  async createFoodItem(foodData: InsertFoodItem): Promise<FoodItem> {
    const [foodItem] = await db.insert(foodItems).values(foodData).returning();
    return foodItem;
  }

  async createDailyRoutine(routineData: InsertDailyRoutine): Promise<DailyRoutine> {
    const [routine] = await db.insert(dailyRoutines).values(routineData).returning();
    return routine;
  }

  async getDailyRoutinesByUser(userId: string): Promise<DailyRoutine[]> {
    return db.select()
      .from(dailyRoutines)
      .where(and(eq(dailyRoutines.userId, userId), eq(dailyRoutines.isActive, true)))
      .orderBy(dailyRoutines.order, dailyRoutines.createdAt);
  }

  async createDailyRoutineCompletion(completionData: InsertDailyRoutineCompletion): Promise<DailyRoutineCompletion> {
    const [completion] = await db.insert(dailyRoutineCompletions).values(completionData).returning();
    return completion;
  }

  async getDailyRoutineCompletionsByDate(userId: string, date: string): Promise<DailyRoutineCompletion[]> {
    return db.select()
      .from(dailyRoutineCompletions)
      .where(and(
        eq(dailyRoutineCompletions.userId, userId),
        eq(dailyRoutineCompletions.completedDate, date)
      ));
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    const [stats] = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    
    if (!stats) {
      // Only create user stats if user exists
      const user = await this.getUser(userId);
      if (!user) {
        return null;
      }
      const [newStats] = await db.insert(userStats).values({ userId }).returning();
      return newStats;
    }
    
    return stats;
  }

  async updateUserStats(userId: string, pointsEarned: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create user stats
    let stats = await this.getUserStats(userId);
    if (!stats) return;

    // Calculate new values
    const newTotalPoints = stats.totalPoints + pointsEarned;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;
    
    // Check if this is a new completion day for streak calculation
    let newCurrentStreak = stats.currentStreak;
    let newLongestStreak = stats.longestStreak;
    
    if (stats.lastCompletionDate) {
      const lastDate = new Date(stats.lastCompletionDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newCurrentStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newCurrentStreak = 1;
      }
      // If daysDiff === 0, it's the same day, keep current streak
    } else {
      // First completion ever
      newCurrentStreak = 1;
    }
    
    newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

    await db.update(userStats)
      .set({
        totalPoints: newTotalPoints,
        level: newLevel,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletionDate: today,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, userId));
  }

  async updateMealLog(mealId: string, updates: Partial<InsertMealLog>): Promise<MealLog> {
    const [meal] = await db
      .update(mealLogs)
      .set(updates)
      .where(eq(mealLogs.id, mealId))
      .returning();
    
    if (!meal) {
      throw new Error('Meal log not found');
    }
    
    return meal;
  }

  async deleteMealLog(mealId: string): Promise<void> {
    const result = await db
      .delete(mealLogs)
      .where(eq(mealLogs.id, mealId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Meal log not found');
    }
  }

  async deleteMealLogsByDescription(userId: string, description: string): Promise<void> {
    await db.delete(mealLogs)
      .where(and(
        eq(mealLogs.userId, userId),
        sql`${mealLogs.description} LIKE ${'%' + description + '%'}`
      ));
  }

  async deleteWeightLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<void> {
    await db.delete(weightLogs)
      .where(and(
        eq(weightLogs.userId, userId),
        gte(weightLogs.logDate, startDate),
        sql`${weightLogs.logDate} <= ${endDate}`
      ));
  }
}

export const storage = new DatabaseStorage();
