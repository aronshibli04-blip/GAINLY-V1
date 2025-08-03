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
  height: decimal("height", { precision: 5, scale: 2 }).notNull(), // in inches
  goalWeight: decimal("goal_weight", { precision: 5, scale: 1 }).notNull(), // in lbs
  activityLevel: text("activity_level").notNull(), // sedentary, lightly_active, moderately_active, very_active
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weightLogs = pgTable("weight_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 1 }).notNull(), // in lbs
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  weightLogs: many(weightLogs),
  mealLogs: many(mealLogs),
  activityLogs: many(activityLogs),
  aiAnalysis: many(aiAnalysis),
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
