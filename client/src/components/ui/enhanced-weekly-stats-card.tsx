import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface EnhancedWeeklyStatsCardProps {
  targetCalories: number;
}

interface WeeklyMetrics {
  totalCalories: number;
  averageDaily: number;
  daysLogged: number;
  completionRate: number;
  weeklyTarget: number;
  weeklyProgress: number;
  surplusDays: number;
  deficitDays: number;
  bestDay: { date: string; calories: number } | null;
  trend: 'improving' | 'declining' | 'stable';
  streak: number;
  consistency: number;
}

export function EnhancedWeeklyStatsCard({ targetCalories }: EnhancedWeeklyStatsCardProps) {
  const { calorieEntries } = useUserStore();
  
  // Calculate comprehensive weekly metrics
  const getWeeklyMetrics = (): WeeklyMetrics => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEntries = calorieEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo;
    });
    
    // Group entries by date
    const dailyTotals = weeklyEntries.reduce((acc, entry) => {
      const date = entry.date;
      acc[date] = (acc[date] || 0) + entry.calories;
      return acc;
    }, {} as Record<string, number>);
    
    const dailyTotalValues = Object.values(dailyTotals);
    const totalCalories = dailyTotalValues.reduce((sum, cal) => sum + cal, 0);
    const daysLogged = Object.keys(dailyTotals).length;
    const averageDaily = daysLogged > 0 ? Math.round(totalCalories / 7) : 0; // Always divide by 7 for true weekly average
    const completionRate = Math.round((daysLogged / 7) * 100);
    const weeklyTarget = targetCalories * 7;
    const weeklyProgress = Math.round((totalCalories / weeklyTarget) * 100);
    
    // Calculate surplus/deficit days
    const surplusDays = dailyTotalValues.filter(cal => cal >= targetCalories).length;
    const deficitDays = dailyTotalValues.filter(cal => cal > 0 && cal < targetCalories).length;
    
    // Find best day
    const bestDay = Object.entries(dailyTotals).reduce((best, [date, calories]) => {
      if (!best || calories > best.calories) {
        return { date, calories };
      }
      return best;
    }, null as { date: string; calories: number } | null);
    
    // Calculate trend (compare first half vs second half of week)
    const sortedEntries = Object.entries(dailyTotals).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    const firstHalf = sortedEntries.slice(0, Math.ceil(sortedEntries.length / 2));
    const secondHalf = sortedEntries.slice(Math.ceil(sortedEntries.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, [, cal]) => sum + cal, 0) / (firstHalf.length || 1);
    const secondHalfAvg = secondHalf.reduce((sum, [, cal]) => sum + cal, 0) / (secondHalf.length || 1);
    
    const trendDiff = secondHalfAvg - firstHalfAvg;
    const trend: 'improving' | 'declining' | 'stable' = 
      trendDiff > 200 ? 'improving' : 
      trendDiff < -200 ? 'declining' : 'stable';
    
    // Calculate streak (consecutive days with calories logged from most recent date)
    const sortedDates = Object.keys(dailyTotals)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    if (sortedDates.length > 0) {
      // Start from the most recent logged date
      const mostRecentDate = new Date(sortedDates[0]);
      
      for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date(mostRecentDate);
        checkDate.setDate(mostRecentDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (sortedDates.includes(checkDateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate consistency (how close daily intakes are to target)
    const consistency = dailyTotalValues.length > 0 ? Math.round(
      dailyTotalValues.reduce((sum, cal) => {
        const targetDiff = Math.abs(cal - targetCalories);
        const consistencyScore = Math.max(0, 100 - (targetDiff / targetCalories) * 100);
        return sum + consistencyScore;
      }, 0) / dailyTotalValues.length
    ) : 0;
    
    return {
      totalCalories,
      averageDaily,
      daysLogged,
      completionRate,
      weeklyTarget,
      weeklyProgress,
      surplusDays,
      deficitDays,
      bestDay,
      trend,
      streak,
      consistency
    };
  };
  
  const metrics = getWeeklyMetrics();
  
  // Get trend icon and color
  const getTrendDisplay = () => {
    switch (metrics.trend) {
      case 'improving':
        return { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'declining':
        return { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' };
      default:
        return { icon: Minus, color: 'text-slate-400', bg: 'bg-slate-500/10' };
    }
  };
  
  const trendDisplay = getTrendDisplay();
  const TrendIcon = trendDisplay.icon;
  
  // Get overall performance status
  const getPerformanceStatus = () => {
    if (metrics.completionRate >= 80 && metrics.weeklyProgress >= 90) {
      return { status: 'excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    } else if (metrics.completionRate >= 60 && metrics.weeklyProgress >= 70) {
      return { status: 'good', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    } else if (metrics.completionRate >= 40) {
      return { status: 'moderate', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    } else {
      return { status: 'low', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
  };
  
  const performanceStatus = getPerformanceStatus();

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
      {/* Background Gradient Based on Performance */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        performanceStatus.status === 'excellent' ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
        performanceStatus.status === 'good' ? "bg-gradient-to-br from-amber-500 to-orange-500" :
        performanceStatus.status === 'moderate' ? "bg-gradient-to-br from-orange-500 to-red-500" :
        "bg-gradient-to-br from-slate-600 to-slate-700"
      )} />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className={cn("h-4 w-4 mr-2", performanceStatus.color)} />
            <span className="text-sm font-semibold">Weekly Analytics</span>
          </div>
          <Link href="/progress">
            <Button variant="ghost" size="sm" className="text-emerald-400 text-xs">
              View All
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4" data-testid="enhanced-weekly-stats-content">
        {/* Main Metrics Grid - MacroFactor Style */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Calories */}
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-white">
              {(metrics.totalCalories / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-400">Total Cal</div>
          </div>
          
          {/* Daily Average */}
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-emerald-400">
              {(metrics.averageDaily / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-400">Daily Avg</div>
          </div>
          
          {/* Days Logged */}
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-cyan-400">
              {metrics.daysLogged}/7
            </div>
            <div className="text-xs text-slate-400">Days</div>
          </div>
        </div>
        
        {/* Performance Indicators */}
        <div className="grid grid-cols-2 gap-2">
          {/* Weekly Progress */}
          <div className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-slate-400 font-medium">Weekly Progress</div>
              <div className={cn("text-sm font-bold", performanceStatus.color)}>
                {metrics.weeklyProgress}%
              </div>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  performanceStatus.status === 'excellent' ? "bg-emerald-500" :
                  performanceStatus.status === 'good' ? "bg-amber-500" :
                  performanceStatus.status === 'moderate' ? "bg-orange-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(metrics.weeklyProgress, 100)}%` }}
                data-testid="weekly-progress-fill"
              />
            </div>
          </div>
          
          {/* Completion Rate */}
          <div className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-slate-400 font-medium">Completion</div>
              <div className={cn(
                "text-sm font-bold",
                metrics.completionRate >= 80 ? "text-emerald-400" :
                metrics.completionRate >= 60 ? "text-amber-400" : "text-red-400"
              )}>
                {metrics.completionRate}%
              </div>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics.completionRate >= 80 ? "bg-emerald-500" :
                  metrics.completionRate >= 60 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${metrics.completionRate}%` }}
                data-testid="completion-rate-fill"
              />
            </div>
          </div>
        </div>
        
        {/* Advanced Insights Row */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {/* Surplus Days */}
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className="text-emerald-400 font-medium">{metrics.surplusDays}d</div>
            <div className="text-slate-500">surplus</div>
          </div>
          
          {/* Deficit Days */}
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className="text-red-400 font-medium">{metrics.deficitDays}d</div>
            <div className="text-slate-500">deficit</div>
          </div>
          
          {/* Streak */}
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className={cn(
              "font-medium",
              metrics.streak >= 3 ? "text-emerald-400" : 
              metrics.streak >= 1 ? "text-amber-400" : "text-slate-400"
            )}>
              {metrics.streak}d
            </div>
            <div className="text-slate-500">streak</div>
          </div>
          
          {/* Consistency */}
          <div className="text-center p-2 bg-slate-800/30 rounded">
            <div className={cn(
              "font-medium",
              metrics.consistency >= 80 ? "text-emerald-400" :
              metrics.consistency >= 60 ? "text-amber-400" : "text-red-400"
            )}>
              {metrics.consistency}%
            </div>
            <div className="text-slate-500">consistent</div>
          </div>
        </div>
        
        {/* Smart Weekly Insight */}
        <div className={cn("p-2 rounded-lg border text-xs", performanceStatus.bg, 
          performanceStatus.status === 'excellent' ? "border-emerald-400/20" :
          performanceStatus.status === 'good' ? "border-amber-400/20" :
          performanceStatus.status === 'moderate' ? "border-orange-400/20" :
          "border-red-400/20")}>
          <div className="flex items-center gap-1 mb-1">
            <TrendIcon className={cn("h-3 w-3", trendDisplay.color)} />
            <div className={cn("font-medium", performanceStatus.color)}>
              {performanceStatus.status === 'excellent' ? 'Outstanding week!' :
               performanceStatus.status === 'good' ? 'Strong progress!' :
               performanceStatus.status === 'moderate' ? 'Building momentum!' :
               'Room for improvement!'}
            </div>
          </div>
          <div className="text-slate-300">
            {metrics.bestDay ? 
              `Best day: ${metrics.bestDay.calories.toLocaleString()} kcal • ${
                metrics.trend === 'improving' ? 'Trending up this week' :
                metrics.trend === 'declining' ? 'Consider more consistency' :
                'Steady performance maintained'
              }` :
              'Start logging meals to see insights and trends!'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}