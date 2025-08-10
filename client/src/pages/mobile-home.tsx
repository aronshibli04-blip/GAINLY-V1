import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/ui/bottom-nav";
import { WeightLogger } from "@/components/ui/weight-logger";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { WeightChart } from "@/components/ui/weight-chart";
import { MotivationCard } from "@/components/ui/motivation-card";
import { GoalWeightCard } from "@/components/ui/goal-weight-card";
import { AchievementSystem } from "@/components/ui/achievement-system";
import { DailyChallenges } from "@/components/ui/daily-challenges";
import { ProgressCelebration } from "@/components/ui/progress-celebration";
import { useUserStore } from "@/store/userStore";
import { Zap, TrendingUp, Target, Activity, RotateCcw } from "lucide-react";
import { Link } from "wouter";

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
          title: "Initialization",
          subtitle: "Complete biometric calibration to begin",
          color: "bg-blue-500",
          progress: 25
        };
      case 'calibration':
        return {
          title: "Calibration Phase",
          subtitle: `Day ${totalDays} - AI neural networks learning your metabolism`,
          color: "bg-yellow-500",
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
          subtitle: "Welcome to Hardgainer AI",
          color: "bg-gray-500",
          progress: 0
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="mobile-container">
      <div className="content-with-bottom-nav p-4 space-y-4 pb-28">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold grok-text-gradient">
              Hardgainer AI
            </h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered bulk companion
            </p>
          </div>
          <div className="w-12 h-12 rounded-full grok-gradient flex items-center justify-center">
            <Zap className="h-6 w-6 text-black" />
          </div>
        </div>

        {/* Phase Status - Subtle indicator */}
        <div className="flex items-center space-x-2 py-2">
          <div className={`w-2 h-2 rounded-full ${phaseInfo.color}`} />
          <p className="text-xs text-muted-foreground">{phaseInfo.subtitle}</p>
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

        {/* Daily Motivation */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Daily Motivation</h3>
          <MotivationCard />
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

      <BottomNav />
    </div>
  );
}