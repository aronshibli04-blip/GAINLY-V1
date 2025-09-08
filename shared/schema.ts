import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  age: integer("age").notNull(),
  height: decimal("height", { precision: 5, scale: 2 }).notNull(), // in cm
  goalWeight: decimal("goal_weight", { precision: 5, scale: 1 }).notNull(), // in kg
  activityLevel: text("activity_level").notNull(), // sedentary, lightly_active, moderately_active, very_active
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weightLogs = pgTable("weight_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 1 }).notNull(), // in kg
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealLogs = pgTable("meal_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  calories: integer("calories").notNull(),
  description: text("description"),
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // training, work, rest
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  calculatedTdee: integer("calculated_tdee").notNull(),
  recommendedSurplus: integer("recommended_surplus").notNull(),
  targetCalories: integer("target_calories").notNull(),
  analysisDate: date("analysis_date").notNull(),
  dataPoints: integer("data_points").notNull(), // number of days analyzed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  calories: integer("calories").notNull(), // per serving
  protein: decimal("protein", { precision: 5, scale: 2 }).notNull(),
  carbs: decimal("carbs", { precision: 5, scale: 2 }).notNull(),
  fat: decimal("fat", { precision: 5, scale: 2 }).notNull(),
  serving: text("serving").notNull(), // e.g., "100g", "1 medium", "1 cup"
  barcode: text("barcode"), // optional for barcode scanning
  category: text("category").notNull(), // e.g., "protein", "grain", "dairy", "fruit", "vegetable"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyRoutines = pgTable("daily_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull().default(25),
  category: text("category").notNull(), // health, fitness, productivity, nutrition
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyRoutineCompletions = pgTable("daily_routine_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  routineId: varchar("routine_id").references(() => dailyRoutines.id).notNull(),
  completedDate: date("completed_date").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  totalPoints: integer("total_points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  level: integer("level").notNull().default(1),
  lastCompletionDate: date("last_completion_date"),
  // Subscription and tier data
  subscriptionTier: text("subscription_tier").notNull().default('free'), // 'free' | 'premium'
  subscriptionType: text("subscription_type"), // 'monthly' | 'yearly' | 'lifetime'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  isTrialing: boolean("is_trialing").notNull().default(false),
  // Gamification
  totalBadgesEarned: integer("total_badges_earned").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sleepLogs = pgTable("sleep_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quality: integer("quality").notNull(), // 1-5 scale (1=poor, 5=excellent)
  hours: decimal("hours", { precision: 3, scale: 1 }), // 7.5 hours, optional
  notes: text("notes"), // optional user notes
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stressLogs = pgTable("stress_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  level: integer("level").notNull(), // 1-5 scale (1=very relaxed, 5=very stressed)
  triggers: text("triggers"), // optional stress triggers/notes
  logDate: date("log_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  weightLogs: many(weightLogs),
  mealLogs: many(mealLogs),
  activityLogs: many(activityLogs),
  aiAnalysis: many(aiAnalysis),
  dailyRoutines: many(dailyRoutines),
  routineCompletions: many(dailyRoutineCompletions),
  userStats: one(userStats),
  sleepLogs: many(sleepLogs),
  stressLogs: many(stressLogs),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
}));

export const mealLogsRelations = relations(mealLogs, ({ one }) => ({
  user: one(users, {
    fields: [mealLogs.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  user: one(users, {
    fields: [aiAnalysis.userId],
    references: [users.id],
  }),
}));

export const dailyRoutinesRelations = relations(dailyRoutines, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyRoutines.userId],
    references: [users.id],
  }),
  completions: many(dailyRoutineCompletions),
}));

export const dailyRoutineCompletionsRelations = relations(dailyRoutineCompletions, ({ one }) => ({
  user: one(users, {
    fields: [dailyRoutineCompletions.userId],
    references: [users.id],
  }),
  routine: one(dailyRoutines, {
    fields: [dailyRoutineCompletions.routineId],
    references: [dailyRoutines.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const sleepLogsRelations = relations(sleepLogs, ({ one }) => ({
  user: one(users, {
    fields: [sleepLogs.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMealLogSchema = createInsertSchema(mealLogs).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
}).extend({
  protein: z.union([z.string(), z.number()]).transform(val => String(val)),
  carbs: z.union([z.string(), z.number()]).transform(val => String(val)),
  fat: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertDailyRoutineSchema = createInsertSchema(dailyRoutines).omit({
  id: true,
  createdAt: true,
});

export const insertDailyRoutineCompletionSchema = createInsertSchema(dailyRoutineCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertSleepLogSchema = createInsertSchema(sleepLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  hours: z.union([z.string(), z.number(), z.null()]).transform(val => 
    val === null || val === undefined || val === "" ? null : String(val)
  ).optional(),
  notes: z.string().nullable().optional(),
});

export const insertStressLogSchema = createInsertSchema(stressLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  triggers: z.string().nullable().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWeightLog = z.infer<typeof insertWeightLogSchema>;
export type WeightLog = typeof weightLogs.$inferSelect;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type MealLog = typeof mealLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertDailyRoutine = z.infer<typeof insertDailyRoutineSchema>;
export type DailyRoutine = typeof dailyRoutines.$inferSelect;
export type InsertDailyRoutineCompletion = z.infer<typeof insertDailyRoutineCompletionSchema>;
export type DailyRoutineCompletion = typeof dailyRoutineCompletions.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertStressLog = z.infer<typeof insertStressLogSchema>;
export type StressLog = typeof stressLogs.$inferSelect;
