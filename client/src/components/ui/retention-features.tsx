import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Flame, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

// Mock data for streaks and progress previews
const WEEKLY_CHALLENGES = [
  { id: 1, title: "Log meals 7 days", description: "Track every meal this week", progress: 5, target: 7, xp: 500 },
  { id: 2, title: "Hit calorie goal daily", description: "Meet your calorie target 6/7 days", progress: 4, target: 6, xp: 300 },
  { id: 3, title: "Complete 3 workouts", description: "Finish 3 training sessions", progress: 2, target: 3, xp: 400 },
];

const PROGRESS_PREVIEWS = [
  { week: 1, weight: 65, muscle: "+0.2kg", strength: "+5%" },
  { week: 4, weight: 68, muscle: "+1.1kg", strength: "+15%" },
  { week: 8, weight: 72, muscle: "+2.8kg", strength: "+30%" },
  { week: 12, weight: 75, muscle: "+4.2kg", strength: "+45%" },
];

export function RetentionFeatures() {
  const { currentStreak, longestStreak, xp, level } = useUserStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-400";
    if (streak >= 14) return "text-yellow-400";
    if (streak >= 7) return "text-emerald-400";
    return "text-blue-400";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Legendary streak! 🏆";
    if (streak >= 14) return "On fire! 🔥";
    if (streak >= 7) return "Great momentum! ⚡";
    if (streak >= 3) return "Building habits! 📈";
    return "Just getting started! 🚀";
  };

  return (
    <div className="space-y-6">
      {/* Streak Tracker */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-400">
            <Flame className="h-6 w-6 mr-2" />
            Streak Power
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-6xl font-black mb-2 ${getStreakColor(currentStreak)}`}>
                {currentStreak}
              </div>
              <p className="text-slate-400">Days in a row</p>
              <p className={`text-sm font-medium ${getStreakColor(currentStreak)}`}>
                {getStreakMessage(currentStreak)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xl font-bold text-purple-400">{longestStreak}</p>
                <p className="text-xs text-slate-400">Best Streak</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xl font-bold text-emerald-400">{Math.ceil(currentStreak / 7)}</p>
                <p className="text-xs text-slate-400">Weeks Strong</p>
              </div>
            </div>

            {/* Streak Milestones */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Next Milestones</h4>
              {[7, 14, 30, 60, 100].map((milestone) => {
                const isCompleted = currentStreak >= milestone;
                const progress = Math.min((currentStreak / milestone) * 100, 100);
                
                return (
                  <div key={milestone} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className={isCompleted ? 'text-emerald-400' : 'text-slate-400'}>
                          {milestone} day streak
                        </span>
                        <span className="text-slate-400">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-400">
            <Target className="h-6 w-6 mr-2" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {WEEKLY_CHALLENGES.map((challenge) => {
              const progress = (challenge.progress / challenge.target) * 100;
              const isCompleted = challenge.progress >= challenge.target;
              
              return (
                <div key={challenge.id} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                        {challenge.title}
                        {isCompleted && <CheckCircle className="inline h-4 w-4 ml-2" />}
                      </h4>
                      <p className="text-sm text-slate-400">{challenge.description}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${isCompleted ? 'border-emerald-500/40 text-emerald-400' : 'border-blue-500/40 text-blue-400'}`}
                    >
                      +{challenge.xp} XP
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        {challenge.progress}/{challenge.target} completed
                      </span>
                      <span className={isCompleted ? 'text-emerald-400' : 'text-blue-400'}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Preview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <TrendingUp className="h-6 w-6 mr-2" />
            Your Transformation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {(['week', 'month', 'year'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="space-y-3">
              {PROGRESS_PREVIEWS.map((preview, index) => {
                const isCurrentWeek = preview.week <= Math.ceil(currentStreak / 7);
                
                return (
                  <motion.div
                    key={preview.week}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      isCurrentWeek 
                        ? 'bg-purple-500/10 border-purple-500/30' 
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrentWeek ? 'bg-purple-500' : 'bg-slate-600'
                        }`}>
                          <span className="text-white text-sm font-bold">{preview.week}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentWeek ? 'text-purple-400' : 'text-slate-400'}`}>
                            Week {preview.week}
                          </p>
                          <p className="text-sm text-slate-500">Expected progress</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className={`text-lg font-bold ${isCurrentWeek ? 'text-white' : 'text-slate-400'}`}>
                            {preview.weight}kg
                          </p>
                          <p className="text-xs text-slate-500">Weight</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${isCurrentWeek ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {preview.muscle}
                          </p>
                          <p className="text-xs text-slate-500">Muscle</p>
                        </div>
                        <div>
                          <p className={`text-lg font-bold ${isCurrentWeek ? 'text-orange-400' : 'text-slate-400'}`}>
                            {preview.strength}
                          </p>
                          <p className="text-xs text-slate-500">Strength</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="font-medium text-white">Stay consistent and watch the magic happen!</p>
                  <p className="text-sm text-purple-300">Each day brings you closer to your transformation</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}