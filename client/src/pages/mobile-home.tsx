import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/ui/bottom-nav";
import { WeightLogger } from "@/components/ui/weight-logger";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { WeightChart } from "@/components/ui/weight-chart";
import { MotivationCard } from "@/components/ui/motivation-card";
import { useUserStore } from "@/store/userStore";
import { Zap, TrendingUp, Target, Activity } from "lucide-react";
import { Link } from "wouter";

export default function MobileHome() {
  const { 
    weightEntries, 
    calorieEntries, 
    activityEntries, 
    currentPhase,
    user
  } = useUserStore();

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
          title: "Getting Started",
          subtitle: "Complete your profile to begin",
          color: "bg-blue-500",
          progress: 25
        };
      case 'calibration':
        return {
          title: "Calibration Phase",
          subtitle: `Day ${totalDays}/7 - Building your profile`,
          color: "bg-yellow-500",
          progress: progressPercent
        };
      case 'meal_planning':
        return {
          title: "AI Analysis Ready",
          subtitle: "Your TDEE has been calculated",
          color: "bg-green-500",
          progress: 100
        };
      case 'tracking':
        return {
          title: "Tracking Phase",
          subtitle: "Follow your personalized plan",
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
      <div className="content-with-bottom-nav p-4 space-y-4">
        
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

        {/* Phase Status Card */}
        <Card className="grok-glow-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${phaseInfo.color}`} />
              <div>
                <h3 className="font-semibold text-white">{phaseInfo.title}</h3>
                <p className="text-sm text-muted-foreground">{phaseInfo.subtitle}</p>
              </div>
            </div>
            <Progress value={phaseInfo.progress} className="h-2" />
          </CardContent>
        </Card>

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

      </div>

      <BottomNav />
    </div>
  );
}