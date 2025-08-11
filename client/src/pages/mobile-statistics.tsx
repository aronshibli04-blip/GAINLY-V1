import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Target,
  Zap,
  Activity,
  Clock,
  Award,
  Brain,
  Scale,
  Utensils
} from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { WeeklyWeightAnalysis } from "@/components/ui/weekly-weight-analysis";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export default function MobileStatistics() {
  const { 
    user, 
    weightEntries, 
    calorieEntries,
    currentTdeeAnalysis 
  } = useUserStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    if (!user) return null;

    const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user.weight;
    const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user.weight;
    const weightGained = currentWeight - startWeight;
    const goalWeight = user.goalWeight || currentWeight + 10;
    
    const totalDaysTracked = new Set([
      ...weightEntries.map(w => w.date),
      ...calorieEntries.map(c => c.date)
    ]).size;

    const avgCaloriesPerDay = calorieEntries.length > 0 
      ? Math.round(calorieEntries.reduce((sum, entry) => sum + entry.calories, 0) / calorieEntries.length)
      : 0;

    const currentTdee = currentTdeeAnalysis?.tdee || 2400;
    const avgSurplus = avgCaloriesPerDay - currentTdee;
    
    // Weight gain rate (kg per week)
    const weightGainRate = totalDaysTracked > 0 ? (weightGained / totalDaysTracked) * 7 : 0;
    
    // Progress to goal
    const progressToGoal = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
    
    // Consistency score (percentage of days with data)
    const daysSinceStart = weightEntries.length > 0 
      ? Math.max(1, Math.ceil((new Date().getTime() - new Date(weightEntries[weightEntries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const consistencyScore = (totalDaysTracked / daysSinceStart) * 100;

    return {
      currentWeight,
      startWeight,
      weightGained,
      goalWeight,
      totalDaysTracked,
      avgCaloriesPerDay,
      currentTdee,
      avgSurplus,
      weightGainRate,
      progressToGoal: Math.max(0, Math.min(100, progressToGoal)),
      consistencyScore: Math.min(100, consistencyScore),
      daysSinceStart
    };
  }, [user, weightEntries, calorieEntries, currentTdeeAnalysis]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const weightData = weightEntries
      .slice(-30)
      .reverse()
      .map((entry, index) => ({
        date: entry.date,
        weight: entry.weight,
        day: index + 1
      }));

    const calorieData = calorieEntries
      .slice(-30)
      .reverse()
      .map((entry, index) => ({
        date: entry.date,
        calories: entry.calories,
        day: index + 1
      }));

    return { weightData, calorieData };
  }, [weightEntries, calorieEntries]);

  if (!user || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Cleaner Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Statistics</h1>
          <p className="text-slate-400 text-sm">Your progress analytics</p>
        </div>

        {/* Compact Period Selection */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-800/80 rounded-xl p-1 border border-slate-700">
            {[
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: 'all', label: 'All' }
            ].map((period) => (
              <Button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                variant="ghost"
                size="sm"
                className={selectedPeriod === period.key 
                  ? "bg-primary text-black hover:bg-primary/90 font-medium" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }
                data-testid={`button-period-${period.key}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics Overview - Cleaner Design */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Weight Progress */}
          <Card className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-sm text-slate-300">Weight Gained</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.weightGained >= 0 ? '+' : ''}{stats.weightGained.toFixed(1)}kg
              </div>
              <div className="text-xs text-slate-400">
                {stats.weightGainRate.toFixed(2)}kg/week
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress */}
          <Card className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Goal Progress</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.progressToGoal.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">
                {(stats.goalWeight - stats.currentWeight).toFixed(1)}kg left
              </div>
            </CardContent>
          </Card>

          {/* Daily Surplus */}
          <Card className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-slate-300">Avg Surplus</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.avgSurplus > 0 ? '+' : ''}{stats.avgSurplus}
              </div>
              <div className="text-xs text-slate-400">
                {stats.avgCaloriesPerDay} cal/day
              </div>
            </CardContent>
          </Card>

          {/* Consistency */}
          <Card className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-300">Consistency</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {stats.consistencyScore.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">
                {stats.totalDaysTracked} days logged
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Progress Chart - Simplified */}
        <Card className="mb-6 bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weight Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#22c55e"
                    fill="url(#weightGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Calorie Intake Chart - Simplified */}
        <Card className="mb-6 bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Utensils className="h-5 w-5 text-primary" />
              Calorie Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="#22c55e"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights - Cleaner Design */}
        <Card className="mb-6 bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.weightGainRate > 0.7 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                  <Award className="h-4 w-4" />
                  Excellent Progress
                </div>
                <p className="text-sm text-green-300/80">
                  You're gaining weight at an optimal rate of {stats.weightGainRate.toFixed(2)}kg/week. This indicates your calorie surplus is well-balanced for lean mass gain.
                </p>
              </div>
            )}

            {stats.consistencyScore < 70 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-1">
                  <Clock className="h-4 w-4" />
                  Consistency Opportunity
                </div>
                <p className="text-sm text-yellow-300/80">
                  Your tracking consistency is {stats.consistencyScore.toFixed(0)}%. Try to log data daily for more accurate AI recommendations.
                </p>
              </div>
            )}

            {stats.avgSurplus < 300 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-orange-400 font-semibold mb-1">
                  <Zap className="h-4 w-4" />
                  Surplus Adjustment
                </div>
                <p className="text-sm text-orange-300/80">
                  Your average surplus is {stats.avgSurplus} calories. Consider increasing to 500+ calories for faster weight gain.
                </p>
              </div>
            )}

            {stats.progressToGoal > 80 && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
                  <Target className="h-4 w-4" />
                  Goal Achievement
                </div>
                <p className="text-sm text-purple-300/80">
                  You're {stats.progressToGoal.toFixed(0)}% towards your goal! Consider setting a new target to maintain momentum.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI TDEE Analysis - Moved from Home Page */}
        {stats.totalDaysTracked >= 7 && (
          <div className="mb-8">
            <TdeeAnalysisCard />
          </div>
        )}

        {/* Weekly Summary - Simplified */}
        <Card className="mb-6 bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Days Active</div>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.totalDaysTracked % 7) / 7 * 100} className="flex-1 h-2" />
                  <span className="text-sm font-semibold">{stats.totalDaysTracked % 7}/7</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-400">TDEE Accuracy</div>
                <div className="flex items-center gap-2">
                  <Progress value={stats.totalDaysTracked >= 7 ? 100 : (stats.totalDaysTracked / 7) * 100} className="flex-1 h-2" />
                  <span className="text-sm font-semibold">
                    {stats.totalDaysTracked >= 7 ? '100%' : `${Math.round((stats.totalDaysTracked / 7) * 100)}%`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.currentTdee}</div>
                  <div className="text-xs text-slate-400">Current TDEE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{stats.daysSinceStart}</div>
                  <div className="text-xs text-slate-400">Days Since Start</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {((stats.goalWeight - stats.currentWeight) / Math.max(0.1, stats.weightGainRate)).toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">Weeks to Goal</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Weight Analysis - Moved from Home Page */}
        {stats.totalDaysTracked >= 7 && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyWeightAnalysis />
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}