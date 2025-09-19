import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { Target, TrendingUp, TrendingDown, Minus, Calendar, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedProgressCardProps {
  targetCalories: number;
}

export function AdvancedProgressCard({ targetCalories }: AdvancedProgressCardProps) {
  const { calorieEntries, weightEntries, currentTdeeAnalysis } = useUserStore();
  
  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);
    
  const todayWeight = weightEntries
    .filter(w => w.date === today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Calculate advanced metrics
  const progressPercent = Math.min((todayCalories / targetCalories) * 100, 150);
  const caloriesRemaining = Math.max(0, targetCalories - todayCalories);
  const surplus = Math.max(0, todayCalories - targetCalories);
  
  // Calculate weekly averages for context
  const lastWeekEntries = calorieEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return entryDate >= oneWeekAgo;
  });
  
  const weeklyAverage = lastWeekEntries.length > 0 
    ? Math.round(lastWeekEntries.reduce((sum, entry) => sum + entry.calories, 0) / 7)
    : 0;
    
  // Calculate yesterday's intake for trend comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayCalories = calorieEntries
    .filter(c => c.date === yesterdayStr)
    .reduce((sum, c) => sum + c.calories, 0);
    
  // Determine trend vs yesterday
  const dayOverDayChange = todayCalories - yesterdayCalories;
  const trendIcon = dayOverDayChange > 100 ? TrendingUp : 
                   dayOverDayChange < -100 ? TrendingDown : Minus;
  const trendColor = dayOverDayChange > 100 ? "text-emerald-400" : 
                    dayOverDayChange < -100 ? "text-red-400" : "text-slate-400";
  
  // Advanced status determination
  const getProgressStatus = () => {
    if (todayCalories === 0) return { status: 'empty', color: 'text-slate-400', bg: 'bg-slate-600/20' };
    if (surplus > 500) return { status: 'excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (progressPercent >= 90) return { status: 'good', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (progressPercent >= 70) return { status: 'moderate', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { status: 'low', color: 'text-red-400', bg: 'bg-red-500/20' };
  };
  
  const progressStatus = getProgressStatus();
  const TrendIcon = trendIcon;

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
      {/* Background Gradient Based on Progress */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        progressStatus.status === 'excellent' ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
        progressStatus.status === 'good' ? "bg-gradient-to-br from-amber-500 to-orange-500" :
        progressStatus.status === 'moderate' ? "bg-gradient-to-br from-orange-500 to-red-500" :
        "bg-gradient-to-br from-slate-600 to-slate-700"
      )} />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Target className={cn("h-4 w-4 mr-2", progressStatus.color)} />
            <span className="text-sm font-semibold">Today's Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon className={cn("h-3 w-3", trendColor)} />
            <div className={cn("text-xs font-medium", trendColor)}>
              {dayOverDayChange > 0 ? '+' : ''}{dayOverDayChange}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4" data-testid="advanced-progress-content">
        {/* Main Progress Display - MacroFactor Style */}
        <div className="space-y-3">
          {/* Calorie Progress with Visual Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {todayCalories.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">
                  of {targetCalories.toLocaleString()} kcal target
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-lg font-bold", progressStatus.color)}>
                  {Math.round(progressPercent)}%
                </div>
                <div className="text-xs text-slate-400">complete</div>
              </div>
            </div>
            
            {/* Advanced Progress Bar */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500 relative",
                  progressStatus.status === 'excellent' ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                  progressStatus.status === 'good' ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                  progressStatus.status === 'moderate' ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                  "bg-gradient-to-r from-red-500 to-red-400"
                )}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                data-testid="progress-fill"
              >
                {/* Shimmer effect for active progress */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
              {/* Target line at 100% */}
              <div className="absolute top-0 right-0 w-px h-full bg-slate-500" />
            </div>
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Remaining/Surplus Card */}
            {caloriesRemaining > 0 ? (
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="text-xs text-orange-400 font-medium">Remaining</div>
                <div className="text-sm font-bold text-white">
                  {caloriesRemaining.toLocaleString()} kcal
                </div>
              </div>
            ) : (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="text-xs text-emerald-400 font-medium">Surplus</div>
                <div className="text-sm font-bold text-white">
                  +{surplus.toLocaleString()} kcal
                </div>
              </div>
            )}
            
            {/* Weekly Comparison */}
            <div className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 font-medium">vs Weekly Avg</div>
              <div className={cn(
                "text-sm font-bold",
                todayCalories > weeklyAverage ? "text-emerald-400" : 
                todayCalories < weeklyAverage ? "text-red-400" : "text-slate-300"
              )}>
                {todayCalories > weeklyAverage ? '+' : ''}{todayCalories - weeklyAverage} kcal
              </div>
            </div>
          </div>

          {/* Today's Weight (if logged) */}
          {todayWeight && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-slate-400" />
                <div className="text-xs text-slate-400">Today's Weight</div>
              </div>
              <div className="text-lg font-semibold text-white">
                {todayWeight.weight} kg
              </div>
            </div>
          )}
          
          {/* Smart Insight */}
          <div className={cn("p-2 rounded-lg border text-xs", progressStatus.bg, 
            progressStatus.status === 'excellent' ? "border-emerald-400/20" :
            progressStatus.status === 'good' ? "border-amber-400/20" :
            progressStatus.status === 'moderate' ? "border-orange-400/20" :
            "border-red-400/20")}>
            <div className="flex items-center gap-1">
              <Zap className={cn("h-3 w-3", progressStatus.color)} />
              <div className={cn("font-medium", progressStatus.color)}>
                {progressStatus.status === 'excellent' ? 'Excellent progress!' :
                 progressStatus.status === 'good' ? 'Great momentum!' :
                 progressStatus.status === 'moderate' ? 'Keep pushing!' :
                 progressStatus.status === 'low' ? 'Time to refuel!' :
                 'Start your day right!'}
              </div>
            </div>
            <div className="text-slate-300 mt-1">
              {progressStatus.status === 'excellent' ? `${surplus} kcal surplus achieved - perfect for gaining!` :
               progressStatus.status === 'good' ? `${targetCalories - todayCalories} kcal to hit your surplus target.` :
               progressStatus.status === 'moderate' ? `${caloriesRemaining} kcal needed to reach your goal.` :
               progressStatus.status === 'low' ? 'Focus on calorie-dense foods to catch up.' :
               'Log your first meal to get started!'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}