import { useEffect } from "react";
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
import { GoalWeightCard } from "@/components/ui/goal-weight-card";
import { AchievementSystem } from "@/components/ui/achievement-system";
import { MotivationBoost } from "@/components/ui/motivation-boost";
import { ProgressStreaks } from "@/components/ui/progress-streaks";
import { VictoryAnimations } from "@/components/ui/victory-animations";
import { PowerUpSystem } from "@/components/ui/power-up-system";
import { GamificationSystem } from "@/components/ui/gamification-system";
import { PointsCelebration } from "@/components/ui/points-celebration";
import { DailyChallenges } from "@/components/ui/daily-challenges";
import { ProgressCelebration } from "@/components/ui/progress-celebration";
import { useUserStore } from "@/store/userStore";
import { Zap, TrendingUp, Target, Activity, RotateCcw, Ruler } from "lucide-react";
import { Link } from "wouter";
import { SmartNotifications } from "@/components/ui/smart-notifications";
import { AggressiveSurplusTracker } from "@/components/ui/aggressive-surplus-tracker";

export default function MobileHome() {
  const { 
    weightEntries, 
    calorieEntries, 
    activityEntries, 
    currentPhase,
    user,
    clearUserData
  } = useUserStore();

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
    <div className="mobile-container">
      {/* Smart Notifications */}
      <SmartNotifications />
      
      <div className="content-with-bottom-nav p-4 space-y-4 pb-28">

        {/* Aggressive 1kg/Week Surplus Tracker */}
        <AggressiveSurplusTracker />
        
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold grok-text-gradient">
              GAINLY
            </h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered bulk companion
            </p>
          </div>
          <div className="w-12 h-12 rounded-full grok-gradient flex items-center justify-center">
            <Zap className="h-6 w-6 text-black" />
          </div>
        </div>

        {/* Phase Status - Enhanced Grok-style indicator */}
        <div className="flex items-center space-x-3 py-2">
          <div className={`w-3 h-3 rounded-full ${phaseInfo.color.includes('grok-gradient') ? 'grok-gradient' : phaseInfo.color} ${phaseInfo.color.includes('animate-pulse') ? 'animate-pulse' : ''}`} 
               style={phaseInfo.color.includes('grok-gradient') ? { 
                 boxShadow: '0 0 10px hsla(147, 100%, 45%, 0.6)' 
               } : {}} />
          <p className="text-xs font-medium text-primary/90">{phaseInfo.subtitle}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="grok-glow-hover">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Today's Weight</p>
              <p className="text-lg font-bold text-white">
                {todayWeight ? `${todayWeight.weight}kg` : "Not logged"}
              </p>
            </CardContent>
          </Card>

          <Card className="grok-glow-hover">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Today's Calories</p>
              <p className="text-lg font-bold text-white">
                {todayCalories > 0 ? `${todayCalories}` : "Not logged"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/statistics">
            <Card className="grok-glow-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Advanced</p>
                <p className="text-sm font-semibold text-white">Statistics</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/measurements">
            <Card className="grok-glow-hover cursor-pointer">
              <CardContent className="p-4 text-center">
                <Ruler className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Body</p>
                <p className="text-sm font-semibold text-white">Measurements</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Goal Weight Tracking */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Weight Goal</h3>
          <GoalWeightCard />
        </div>

        {/* Daily Weight Logging */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Today's Weight</h3>
          <WeightLogger />
        </div>

        {/* AI Analysis - Always visible and updating */}
        {totalDays >= 7 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
            <TdeeAnalysisCard />
          </div>
        )}

        {/* Weight Progress Chart */}
        {weightEntries.length >= 3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
            <WeightChart />
          </div>
        )}

        {/* Weekly Weight Analysis */}
        {weightEntries.length >= 7 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Weekly Analysis</h3>
            <WeeklyWeightAnalysis />
          </div>
        )}

        {/* Progress Celebration */}
        <ProgressCelebration />

        {/* Daily Challenges */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Daily Challenges</h3>
          <DailyChallenges />
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <AchievementSystem />
        </div>

        {/* Enhanced Motivation System */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Motivasjon & Fremgang</h3>
          <MotivationBoost />
        </div>

        {/* Gamification System */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Ditt Nivå & Poeng</h3>
          <GamificationSystem />
        </div>

        {/* Progress Streaks */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Din Streak</h3>
          <ProgressStreaks />
        </div>

        {/* Power-up System */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Power-ups</h3>
          <PowerUpSystem />
        </div>

        {/* Power-up System */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Power-ups</h3>
          <PowerUpSystem />
        </div>

        {/* Recent Activity */}
        {totalDays > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tracking Days</span>
                  <Badge variant="secondary">{totalDays} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Data Quality</span>
                  <Badge 
                    variant={totalDays >= 7 ? "default" : "outline"}
                    className={totalDays >= 7 ? "grok-gradient text-black" : ""}
                  >
                    {totalDays >= 7 ? "Ready for AI" : "Building..."}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Development Reset Button */}
        <div className="space-y-3 border-t border-primary/20 pt-4">
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

      {/* Victory Animations */}
      <VictoryAnimations />

      {/* Points Celebration */}
      <PointsCelebration />

      <BottomNav />
    </div>
  );
}