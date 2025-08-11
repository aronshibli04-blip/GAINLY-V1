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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" 
                 style={{ animationDuration: '15s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              STATISTICS
            </span>
          </h1>
          <p className="text-primary/70">Advanced progress analytics</p>
        </div>

        {/* Period Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-800/50 rounded-lg p-1 border border-primary/20">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: 'all', label: 'All Time' }
            ].map((period) => (
              <Button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                variant={selectedPeriod === period.key ? "default" : "ghost"}
                size="sm"
                className={selectedPeriod === period.key 
                  ? "bg-primary text-black" 
                  : "text-slate-400 hover:text-white"
                }
                data-testid={`button-period-${period.key}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/30 rounded-lg mx-auto mb-2">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {stats.weightGained >= 0 ? '+' : ''}{stats.weightGained.toFixed(1)}kg
              </div>
              <div className="text-sm text-slate-400">Total Gained</div>
              <div className="text-xs text-primary/70 mt-1">
                {stats.weightGainRate.toFixed(2)}kg/week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/30 rounded-lg mx-auto mb-2">
                <Target className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {stats.progressToGoal.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Goal Progress</div>
              <div className="text-xs text-cyan-400/70 mt-1">
                {(stats.goalWeight - stats.currentWeight).toFixed(1)}kg to go
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/30 rounded-lg mx-auto mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.avgSurplus > 0 ? '+' : ''}{stats.avgSurplus}
              </div>
              <div className="text-sm text-slate-400">Avg Surplus</div>
              <div className="text-xs text-yellow-400/70 mt-1">
                {stats.avgCaloriesPerDay} cal/day
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/30 rounded-lg mx-auto mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {stats.consistencyScore.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-400">Consistency</div>
              <div className="text-xs text-purple-400/70 mt-1">
                {stats.totalDaysTracked} days logged
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Progress Chart */}
        <Card className="mb-8 bg-slate-800/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
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

        {/* Calorie Intake Chart */}
        <Card className="mb-8 bg-slate-800/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Utensils className="h-5 w-5" />
              Calorie Intake Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
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

        {/* Performance Insights */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Brain className="h-5 w-5" />
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

        {/* Weekly Summary */}
        <Card className="bg-slate-800/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
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
          <Card className="bg-slate-800/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5" />
                Weekly Weight Breakdown
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