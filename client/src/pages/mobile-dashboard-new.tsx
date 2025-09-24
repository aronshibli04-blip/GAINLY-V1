import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { TrackingCardsCarousel } from "@/components/ui/tracking-cards-carousel";
import { WeightTrendMiniChart } from "@/components/ui/weight-trend-mini-chart";
import { ExpenditureMiniChart } from "@/components/ui/expenditure-mini-chart";
import { EnhancedHabitGrid } from "@/components/ui/enhanced-habit-grid";
import { AdvancedProgressCard } from "@/components/ui/advanced-progress-card";
import { EnhancedWeeklyStatsCard } from "@/components/ui/enhanced-weekly-stats-card";
import { SmartGoalTrackingCard } from "@/components/ui/smart-goal-tracking-card";
import { EnhancedQuickActionsCard } from "@/components/ui/enhanced-quick-actions-card";
import { EnhancedWeightTrendChart } from "@/components/ui/enhanced-weight-trend-chart";
import { EnhancedExpenditureChart } from "@/components/ui/enhanced-expenditure-chart";
import { useUserStore } from "@/store/userStore";
import { useSideMenu } from "@/hooks/use-side-menu";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Link } from "wouter";
import { Plus, Zap, Target, TrendingUp } from "lucide-react";
import { calculateCalorieTargets } from '@shared/calorie-calculations';

export default function MobileDashboardNew() {
  const { openMenu } = useSideMenu();
  const { currentTdeeAnalysis, calorieEntries, weightEntries, user } = useUserStore();
  const { isVisible: isHeaderVisible } = useScrollDirection(50);
  
  // Calculate target calories using centralized calculation
  const userWeightGoal = (user as any)?.weightGainGoal || 1.0;
  const targetCalories = currentTdeeAnalysis 
    ? calculateCalorieTargets(currentTdeeAnalysis.tdee, userWeightGoal).targetCalories
    : calculateCalorieTargets(3200, userWeightGoal).targetCalories;
  
  // Safety checks for data availability
  const hasCalorieData = calorieEntries && calorieEntries.length > 0;
  const hasWeightData = weightEntries && weightEntries.length > 0;
  const hasUserData = user && user.id;
  
  // Get today's data with nullish safety
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = (calorieEntries ?? [])
    .filter(c => c && c.date === today)
    .reduce((sum, c) => sum + (c.calories || 0), 0);
    
  const todayWeight = (weightEntries ?? [])
    .filter(w => w && w.date === today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const caloriesRemaining = Math.max(0, targetCalories - todayCalories);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pb-24 relative">
      {/* Mobile Header with Auto-Hide */}
      <MobileHeader 
        title="Dashboard" 
        onOpenMenu={openMenu}
        isVisible={isHeaderVisible}
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
        </div>

        {/* 1. HERO SECTION - Tracking Cards Carousel */}
        <div className="mb-6">
          <TrackingCardsCarousel />
        </div>

        {/* 2. ANALYTICS CARDS - 2 Column Grid with fallbacks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Insights & Analytics</h2>
            <Button variant="ghost" size="sm" className="text-emerald-400 text-xs">
              See All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Enhanced charts with error boundaries */}
            <div className="min-h-[120px]">
              <EnhancedWeightTrendChart />
            </div>
            
            <div className="min-h-[120px]">
              <EnhancedExpenditureChart targetCalories={targetCalories} />
            </div>
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
        
        {/* 8. Mobile Layout Test - Ensure bottom spacing */}
        <div className="mb-8">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <p className="text-slate-400 text-sm">
                🎯 Dashboard Complete • {hasUserData ? 'User Data: ✅' : 'User Data: ⚠️'} • {hasCalorieData ? 'Calories: ✅' : 'Calories: ⚠️'} • {hasWeightData ? 'Weight: ✅' : 'Weight: ⚠️'}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Target: {targetCalories} kcal • Use ?test=true to bypass onboarding
              </p>
            </CardContent>
          </Card>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}