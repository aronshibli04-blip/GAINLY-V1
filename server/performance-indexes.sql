-- Performance optimization indexes for GAINLY app
-- These indexes will significantly improve query performance

-- Weight logs indexes (frequently queried by userId and date)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weight_logs_user_date 
ON weight_logs(user_id, log_date DESC);

-- Meal logs indexes (frequently queried by userId and date)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_logs_user_date 
ON meal_logs(user_id, log_date DESC);

-- Daily routines indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_routines_user_active 
ON daily_routines(user_id, is_active) WHERE is_active = true;

-- Daily routine completions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routine_completions_user_date 
ON daily_routine_completions(user_id, completed_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_routine_completions_routine 
ON daily_routine_completions(routine_id);

-- Food items indexes for search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_items_name_search 
ON food_items USING gin(to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_items_category 
ON food_items(category);

-- AI analysis indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_analysis_user_date 
ON ai_analysis(user_id, analysis_date DESC);

-- User stats indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_user 
ON user_stats(user_id);

-- Activity logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_date 
ON activity_logs(user_id, log_date DESC);