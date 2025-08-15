import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Target, TrendingUp, Calendar, Flame, Sparkles } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export function MicroCelebration() {
  const { user, weightEntries } = useUserStore();
  const [dailyStreak, setDailyStreak] = useState(0);
  
  // Get current weight and calculate progress
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : 70;
    
  const targetWeight = user?.goalWeight || 85;
  const startWeight = 70; // This should come from user's initial weight
  
  // Calculate next major milestone (every 2kg)
  const nextMajorMilestone = Math.ceil(currentWeight / 2) * 2;
  const nextMilestoneAdjusted = nextMajorMilestone <= currentWeight 
    ? nextMajorMilestone + 2 
    : nextMajorMilestone;
  
  const progressToNext = ((currentWeight - Math.floor(currentWeight / 2) * 2) / 2) * 100;
  const totalProgress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
  const daysToGoal = Math.ceil((targetWeight - currentWeight) / (1000 / 1100)); // 1100 kcal surplus ≈ 1kg/week
  
  // Micro-achievements (0.5kg increments)
  const microAchievements = [];
  const currentHalfKg = Math.floor(currentWeight * 2) / 2;
  
  for (let weight = currentHalfKg; weight >= currentHalfKg - 2; weight -= 0.5) {
    if (weight > startWeight) {
      microAchievements.push({
        weight,
        completed: currentWeight >= weight,
        isRecent: currentWeight >= weight && currentWeight < weight + 0.5
      });
    }
  }
  
  // Mock daily streak (in real app, this would come from meal logging data)
  useEffect(() => {
    setDailyStreak(Math.floor(Math.random() * 7) + 1);
  }, []);
  
  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-4 w-4 text-orange-400 mr-1" />
              <span className="text-sm font-semibold text-orange-400">{dailyStreak}</span>
            </div>
            <div className="text-xs text-slate-300">Dagers streak</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-400/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-blue-400 mr-1" />
              <span className="text-sm font-semibold text-blue-400">{nextMilestoneAdjusted}kg</span>
            </div>
            <div className="text-xs text-slate-300">Neste mål</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/20">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-purple-400 mr-1" />
              <span className="text-sm font-semibold text-purple-400">{daysToGoal}</span>
            </div>
            <div className="text-xs text-slate-300">Dager til mål</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress to Next Milestone */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Fremgang til {nextMilestoneAdjusted}kg</span>
            <span className="text-sm text-blue-400">{(nextMilestoneAdjusted - currentWeight).toFixed(1)}kg igjen</span>
          </div>
          <Progress value={progressToNext} className="h-2 mb-2" />
          <div className="text-xs text-slate-400">
            {progressToNext.toFixed(0)}% av neste store belønning
          </div>
        </CardContent>
      </Card>
      
      {/* Micro Achievements (0.5kg increments) */}
      <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-400/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Siste Micro-Seire</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {microAchievements.reverse().map((achievement, index) => (
              <Badge 
                key={achievement.weight}
                variant={achievement.completed ? "default" : "outline"}
                className={`text-xs ${
                  achievement.completed 
                    ? achievement.isRecent 
                      ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40 animate-pulse'
                      : 'bg-green-400/20 text-green-400 border-green-400/40'
                    : 'text-slate-400 border-slate-600'
                }`}
              >
                {achievement.completed && <Trophy className="h-3 w-3 mr-1" />}
                {achievement.weight}kg
              </Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Hver 0.5kg teller! Små fremskritt bygger store resultater 💪
          </p>
        </CardContent>
      </Card>
      
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border-indigo-400/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-400">Total Fremgang</span>
            <span className="text-sm text-indigo-400">{(currentWeight - startWeight).toFixed(1)}kg vunnet</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <div className="text-xs text-slate-400 mt-2">
            {totalProgress.toFixed(0)}% av målet ({startWeight}kg → {targetWeight}kg)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}