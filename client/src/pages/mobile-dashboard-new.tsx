import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { EnhancedWeeklyNutritionCalendar } from "@/components/ui/enhanced-weekly-nutrition-calendar";
import { WeightTrendMiniChart } from "@/components/ui/weight-trend-mini-chart";
import { ExpenditureMiniChart } from "@/components/ui/expenditure-mini-chart";
import { EnhancedHabitGrid } from "@/components/ui/enhanced-habit-grid";
import { AdvancedProgressCard } from "@/components/ui/advanced-progress-card";
import { EnhancedWeeklyStatsCard } from "@/components/ui/enhanced-weekly-stats-card";
import { SmartGoalTrackingCard } from "@/components/ui/smart-goal-tracking-card";
import { EnhancedQuickActionsCard } from "@/components/ui/enhanced-quick-actions-card";
import { useUserStore } from "@/store/userStore";
import { useSideMenu } from "@/hooks/use-side-menu";
import { Link } from "wouter";
import { Plus, Zap, Target, TrendingUp } from "lucide-react";

export default function MobileDashboardNew() {
  const { openMenu } = useSideMenu();
  const { currentTdeeAnalysis, calorieEntries, weightEntries } = useUserStore();
  
  // Calculate target calories from TDEE analysis or use default
  const targetCalories = currentTdeeAnalysis ? currentTdeeAnalysis.tdee + 1100 : 3200;
  
  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);
    
  const todayWeight = weightEntries
    .filter(w => w.date === today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const caloriesRemaining = Math.max(0, targetCalories - todayCalories);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-24 relative">
      {/* Mobile Header */}
      <MobileHeader 
        title="Dashboard" 
        onOpenMenu={openMenu}
      />

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 px-4 pt-20 pb-6 max-w-md mx-auto">

        {/* Date Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <h1 className="text-xl font-bold text-white mt-1">Dashboard</h1>
        </div>

        {/* 1. HERO SECTION - Enhanced Weekly Nutrition Calendar */}
        <div className="mb-6">
          <EnhancedWeeklyNutritionCalendar targetCalories={targetCalories} />
        </div>

        {/* 2. ANALYTICS CARDS - 2 Column Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Insights & Analytics</h2>
            <Button variant="ghost" size="sm" className="text-emerald-400 text-xs">
              See All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <WeightTrendMiniChart />
            <ExpenditureMiniChart />
          </div>
        </div>

        {/* 3. ENHANCED HABIT TRACKING - MacroFactor Style */}
        <div className="mb-6">
          <EnhancedHabitGrid />
        </div>

        {/* 4. ADVANCED PROGRESS CARD - MacroFactor Style */}
        <div className="mb-6">
          <AdvancedProgressCard targetCalories={targetCalories} />
        </div>

        {/* 5. ENHANCED QUICK ACTIONS - MacroFactor Style */}
        <div className="mb-6">
          <EnhancedQuickActionsCard targetCalories={targetCalories} />
        </div>

        {/* 6. ENHANCED WEEKLY ANALYTICS - MacroFactor Style */}
        <div className="mb-6">
          <EnhancedWeeklyStatsCard targetCalories={targetCalories} />
        </div>

        {/* 7. SMART GOAL TRACKING - FFMI & Weight Milestones */}
        <div className="mb-6">
          <SmartGoalTrackingCard targetCalories={targetCalories} />
        </div>

      </div>

      <BottomNav />
    </div>
  );
}