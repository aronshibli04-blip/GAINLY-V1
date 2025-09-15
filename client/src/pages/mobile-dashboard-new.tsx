import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { WeeklyCalorieGrid } from "@/components/ui/weekly-calorie-grid";
import { WeightTrendCard, CalorieTrendCard } from "@/components/ui/analytics-cards";
import { MealLoggingHabitCard, WeightTrackingHabitCard } from "@/components/ui/habit-tracking-cards";
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

        {/* 1. HERO SECTION - Weekly Calorie Grid */}
        <div className="mb-6">
          <WeeklyCalorieGrid targetCalories={targetCalories} />
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
            <WeightTrendCard />
            <CalorieTrendCard targetCalories={targetCalories} />
          </div>
        </div>

        {/* 3. HABIT TRACKING - 2 Column Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Habits</h2>
            <Button variant="ghost" size="sm" className="text-emerald-400 text-xs">
              See All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* <MealLoggingHabitCard /> */}
            {/* <WeightTrackingHabitCard /> */}
            <div className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm rounded-lg p-4 text-center text-gray-400">
              Habit cards temporarily disabled
            </div>
            <div className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm rounded-lg p-4 text-center text-gray-400">
              Fixing components...
            </div>
          </div>
        </div>

        {/* 4. TODAY'S SUMMARY & QUICK ACTIONS - 2 Column Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Today</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
          {/* Today's Progress Card */}
          <Card className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white flex items-center">
                <Target className="h-4 w-4 mr-2 text-emerald-400" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Calorie Progress */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-white">
                    {todayCalories.toLocaleString()} / {targetCalories.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">kcal consumed</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">
                    {Math.round((todayCalories / targetCalories) * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">of target</div>
                </div>
              </div>

              {/* Remaining Calories */}
              {caloriesRemaining > 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="text-sm text-orange-400 font-medium">
                    Still need: <span className="font-bold">{caloriesRemaining} kcal</span>
                  </div>
                </div>
              )}

              {/* Weight */}
              {todayWeight && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
                  <div className="text-sm text-gray-400">Today's Weight</div>
                  <div className="text-lg font-semibold text-white">
                    {todayWeight.weight} kg
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white flex items-center">
                <Zap className="h-4 w-4 mr-2 text-orange-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Log Meal Button */}
              <Link href="/meals">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-semibold h-12">
                  <Plus className="h-5 w-5 mr-2" />
                  Log Meal
                </Button>
              </Link>

              {/* Add Weight Button */}
              <Button 
                variant="outline" 
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 h-10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Weight
              </Button>

              {/* View Plan Button */}
              <Link href="/ai-coach">
                <Button 
                  variant="outline" 
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 h-10"
                >
                  View AI Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* 5. WEEKLY STATS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Weekly Stats</h2>
            <Link href="/progress">
              <Button variant="ghost" size="sm" className="text-emerald-400 text-xs">
                See All
              </Button>
            </Link>
          </div>
          <Card className="bg-slate-800/40 border-slate-600/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Weekly Summary */}
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <div className="text-base font-bold text-emerald-400">
                  {Math.round(
                    calorieEntries
                      .filter(entry => {
                        const entryDate = new Date(entry.date);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return entryDate >= oneWeekAgo;
                      })
                      .reduce((sum, entry) => sum + entry.calories, 0) / 7
                  )}
                </div>
                <div className="text-xs text-gray-400">Avg Calories</div>
              </div>

              {/* Streak */}
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <div className="text-base font-bold text-blue-400">
                  {calorieEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return entryDate >= oneWeekAgo && entry.calories > 0;
                  }).length}
                </div>
                <div className="text-xs text-gray-400">Days Logged</div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}