import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/ui/bottom-nav";
import { WeightLogger } from "@/components/ui/weight-logger";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { WeightChart } from "@/components/ui/weight-chart";
import { WeeklyWeightAnalysis } from "@/components/ui/weekly-weight-analysis";
import { MotivationCard } from "@/components/ui/motivation-card";
import { MicroGoalsOverview } from "@/components/ui/micro-goals-overview";
import { AchievementSystem } from "@/components/ui/achievement-system";

import { ProgressStreaks } from "@/components/ui/progress-streaks";
import { PowerUpSystem } from "@/components/ui/power-up-system";
import { GamificationSystem } from "@/components/ui/gamification-system";
import { DailyChallenges } from "@/components/ui/daily-challenges";

import { useUserStore } from "@/store/userStore";
import { Zap, TrendingUp, Target, Activity, RotateCcw, Ruler } from "lucide-react";
import { Link } from "wouter";
import { SmartNotifications } from "@/components/ui/smart-notifications";
import { AggressiveSurplusTracker } from "@/components/ui/aggressive-surplus-tracker";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";

export default function MobileHome() {
  const { 
    weightEntries, 
    calorieEntries, 
    activityEntries, 
    currentPhase,
    user,
    clearUserData
  } = useUserStore();
  
  const { openMenu } = useMenu();

  // Redirect to calibration mode if user hasn't completed calibration
  useEffect(() => {
    if (user && !user.hasCompletedCalibration) {
      window.location.href = '/calibration';
    }
  }, [user]);

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayWeight = weightEntries.find(w => w.date === today);
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);

  // Calculate progress
  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );
  
  const progressPercent = Math.min((totalDays / 7) * 100, 100);

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'onboarding':
        return {
          title: "Neural Network Initialization",
          subtitle: "Activating AI systems for metabolic analysis",
          color: "grok-gradient",
          progress: 25
        };
      case 'calibration':
        return {
          title: "Neural Calibration Active",
          subtitle: `Day ${totalDays}/7 - AI systems analyzing metabolic patterns`,
          color: "grok-gradient animate-pulse",
          progress: progressPercent
        };
      case 'meal_planning':
        return {
          title: "Profile Active",
          subtitle: "TDEE continuously updated with each data point",
          color: "bg-green-500",
          progress: 100
        };
      case 'tracking':
        return {
          title: "Profile Active",
          subtitle: "TDEE adapting in real time to your progress",
          color: "bg-purple-500",
          progress: 100
        };
      default:
        return {
          title: "Getting Started",
          subtitle: "Welcome to GAINLY",
          color: "bg-gray-500",
          progress: 0
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/10 to-slate-950 text-white pb-24 relative overflow-hidden">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Dashboard" 
        onOpenMenu={openMenu}
      />

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Larger floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        {/* Smaller particles */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-1 h-1 bg-emerald-300/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6 space-y-6 pb-28">

        {/* Enhanced Header with GAINLY branding */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            {/* Multiple rotating rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-spin" 
                 style={{ animationDuration: '20s' }} />
            <div className="absolute inset-1 rounded-full border border-green-400/30 animate-spin" 
                 style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <div className="absolute inset-2 rounded-full border border-emerald-300/20 animate-spin" 
                 style={{ animationDuration: '25s' }} />
            
            {/* Central icon with enhanced glow */}
            <div className="relative z-10 w-18 h-18 rounded-full bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-600 flex items-center justify-center shadow-2xl" 
                 style={{ 
                   boxShadow: '0 0 40px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)' 
                 }}>
              <Zap className="h-10 w-10 text-black drop-shadow-sm" />
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent" 
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))' 
                  }}>
              GAINLY
            </span>
          </h1>
          <p className="text-emerald-400/80 text-lg font-medium tracking-wide">Your AI-powered bulk companion</p>
        </div>

        {/* Aggressive 1kg/Week Surplus Tracker */}
        <AggressiveSurplusTracker />

        {/* Enhanced Phase Status */}
        <div className="flex items-center justify-center space-x-4 py-4 px-6 bg-gradient-to-r from-slate-800/40 via-slate-700/40 to-slate-800/40 rounded-2xl border border-emerald-400/30 mb-8 backdrop-blur-sm" 
             style={{ 
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
             }}>
          <div className={`w-4 h-4 rounded-full ${phaseInfo.color.includes('grok-gradient') ? 'bg-gradient-to-r from-emerald-400 to-green-400' : phaseInfo.color} ${phaseInfo.color.includes('animate-pulse') ? 'animate-pulse' : ''}`} 
               style={phaseInfo.color.includes('grok-gradient') ? { 
                 boxShadow: '0 0 16px hsla(147, 100%, 45%, 0.8), 0 0 32px hsla(147, 100%, 45%, 0.4)' 
               } : {}} />
          <p className="text-sm font-semibold text-emerald-300 tracking-wide">{phaseInfo.subtitle}</p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 backdrop-blur-sm" 
                style={{ 
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                }}>
            <CardContent className="p-5 text-center">
              <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-emerald-400/20">
                <TrendingUp className="h-6 w-6 text-emerald-400 drop-shadow-lg" />
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Today's Weight</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">
                {todayWeight ? `${todayWeight.weight}kg` : "Not logged"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-orange-400/30 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-sm" 
                style={{ 
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                }}>
            <CardContent className="p-5 text-center">
              <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-orange-400/20">
                <Zap className="h-6 w-6 text-orange-400 drop-shadow-lg" />
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Today's Calories</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">
                {todayCalories > 0 ? `${todayCalories.toLocaleString()}` : "Not logged"}
              </p>
              {todayCalories > 0 && (
                <p className="text-xs text-orange-400 font-bold mt-2 tracking-wide">
                  +{(todayCalories - 2400).toLocaleString()} surplus
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Action Cards */}
        <div className="grid grid-cols-2 gap-6">
          <Link href="/progress">
            <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer backdrop-blur-sm" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              <CardContent className="p-5 text-center">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-cyan-400/20">
                  <Activity className="h-6 w-6 text-cyan-400 drop-shadow-lg" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Advanced</p>
                <p className="text-sm font-bold text-white tracking-tight">Progress</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/measurements">
            <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer backdrop-blur-sm" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              <CardContent className="p-5 text-center">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-purple-400/20">
                  <Ruler className="h-6 w-6 text-purple-400 drop-shadow-lg" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Body</p>
                <p className="text-sm font-bold text-white tracking-tight">Measurements</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Enhanced Micro Goals Overview */}
        <div className="space-y-5">
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="relative">
              <Target className="h-6 w-6 text-emerald-400 drop-shadow-lg" />
              <div className="absolute inset-0 animate-ping">
                <Target className="h-6 w-6 text-emerald-400/40" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              Next Milestone
            </span>
          </h3>
          <MicroGoalsOverview />
        </div>

        {/* Weight Logging Section - Only show if not logged today */}
        {!todayWeight && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Log Weight</h3>
            <WeightLogger />
          </div>
        )}

        {/* Weight Progress Chart - Keep this for quick overview */}
        {weightEntries.length >= 3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
            <WeightChart />
          </div>
        )}







        {/* Recent Activity */}
        {totalDays > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600/40">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Tracking Days</span>
                  <Badge variant="secondary">{totalDays} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Data Quality</span>
                  <Badge 
                    variant={totalDays >= 7 ? "default" : "outline"}
                    className={totalDays >= 7 ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black" : ""}
                  >
                    {totalDays >= 7 ? "Ready for AI" : "Building..."}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Development Reset Button */}
        <div className="space-y-3 border-t border-slate-700/50 pt-4">
          <Button
            onClick={() => {
              if (confirm('Reset all data and start fresh? This cannot be undone.')) {
                clearUserData();
                localStorage.clear();
                window.location.reload();
              }
            }}
            variant="outline"
            className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset App (Start Fresh)
          </Button>
        </div>

      </div>



      <BottomNav />
    </div>
  );
}