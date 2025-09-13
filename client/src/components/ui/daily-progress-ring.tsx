import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { calculateTdee } from "@/utils/tdee";
import { Flame, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function DailyProgressRing() {
  const { calorieEntries, currentTdeeAnalysis, weightEntries } = useUserStore();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieEntries
    ?.filter(c => c?.date === today)
    ?.reduce((sum, c) => sum + (c?.calories || 0), 0) || 0;
  
  // Use TDEE analysis target calories (same as aggressive surplus tracker)
  const targetCalories = currentTdeeAnalysis?.targetCalories || 4390; // Fallback
  const caloriesRemaining = Math.max(0, targetCalories - todayCalories);
  const progress = Math.min(100, (todayCalories / targetCalories) * 100);
  const isComplete = caloriesRemaining === 0;
  
  // Animate progress ring
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);
  
  // Calculate ring styling
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  
  // Get progress status
  const getProgressStatus = () => {
    if (progress >= 100) return { color: "text-green-400", bgColor: "bg-green-400/20", status: "Complete!" };
    if (progress >= 80) return { color: "text-orange-400", bgColor: "bg-orange-400/20", status: "Almost there!" };
    if (progress >= 50) return { color: "text-yellow-400", bgColor: "bg-yellow-400/20", status: "Good progress" };
    if (progress >= 25) return { color: "text-blue-400", bgColor: "bg-blue-400/20", status: "Getting started" };
    return { color: "text-gray-400", bgColor: "bg-gray-400/20", status: "Let's fuel up!" };
  };
  
  const status = getProgressStatus();
  
  return (
    <Card className="bg-gradient-to-br from-orange-900/40 via-slate-800/60 to-amber-900/40 border-orange-500/20 backdrop-blur-sm mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-400" />
              Today's Fuel
            </h3>
            <p className="text-xs text-orange-400/70">Calories for muscle building</p>
          </div>
          <Badge 
            variant="outline" 
            className={`${status.color} border-current ${status.bgColor} font-medium`}
          >
            {Math.round(progress)}%
          </Badge>
        </div>
        
        <div className="flex items-center justify-center relative mb-4">
          {/* Background ring */}
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-slate-700/40"
            />
            {/* Progress ring */}
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              className="text-orange-400"
              style={{
                strokeDasharray,
                strokeDashoffset,
                transition: "stroke-dashoffset 1s ease-in-out"
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">
                {todayCalories.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                / {targetCalories.toLocaleString()} kcal
              </div>
              <div className="flex items-center justify-center">
                <span className={`text-xs font-medium ${status.color}`}>
                  {status.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-800/40">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-orange-400 mr-1" />
              <span className="text-xs text-orange-400">Remaining</span>
            </div>
            <div className="text-lg font-bold text-white">
              {isComplete ? "0" : caloriesRemaining.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">kcal</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-slate-800/40">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-xs text-green-400">Surplus Target</span>
            </div>
            <div className="text-lg font-bold text-white">
              +1100
            </div>
            <div className="text-xs text-gray-400">kcal/day</div>
          </div>
        </div>
        
        {/* Motivational message */}
        {caloriesRemaining > 0 && (
          <div className={`mt-4 p-3 rounded-lg ${status.bgColor} border border-current ${status.color}`}>
            <div className="flex items-center justify-center">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {caloriesRemaining > 1000 
                  ? "Time for a big meal! 🍽️" 
                  : caloriesRemaining > 500 
                  ? "Perfect snack opportunity! 🥜" 
                  : "Almost there! One more bite! 💪"
                }
              </span>
            </div>
          </div>
        )}
        
        {isComplete && (
          <div className="mt-4 p-3 rounded-lg bg-green-400/20 border border-green-400/50">
            <div className="flex items-center justify-center text-green-400">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Daily goal crushed! 🎉 Your muscles thank you!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}