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
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { WeeklyWeightAnalysis } from "@/components/ui/weekly-weight-analysis";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip } from "recharts";
import { calculateTdee } from "@/utils/tdee";

export default function MobileStatistics() {
  const { 
    user, 
    weightEntries, 
    calorieEntries,
    currentTdeeAnalysis 
  } = useUserStore();
  
  const { openMenu } = useMenu();
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

    // Calculate real-time TDEE if analysis is missing
    const realtimeTdeeCalc = currentTdeeAnalysis || calculateTdee(weightEntries || [], calorieEntries || [], user?.id || '');
    const currentTdee = realtimeTdeeCalc.tdee;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Statistics" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin" 
                 style={{ animationDuration: '13s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              STATISTICS
            </span>
          </h1>
          <p className="text-blue-400/70">Advanced progress analytics & insights</p>
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
                  ? "bg-blue-400 text-black hover:bg-blue-400/90 font-medium" 
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }
                data-testid={`button-period-${period.key}`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Overview - Home Page Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="statistics-glow-hover">
            <CardContent className="p-4 text-center">
              <Scale className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Weight Gained</p>
              <p className="text-lg font-bold text-white">
                {stats.weightGained >= 0 ? '+' : ''}{stats.weightGained.toFixed(1)}kg
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {stats.weightGainRate.toFixed(2)}kg/week
              </p>
            </CardContent>
          </Card>

          <Card className="statistics-glow-hover">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Goal Progress</p>
              <p className="text-lg font-bold text-white">
                {stats.progressToGoal.toFixed(0)}%
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {(stats.goalWeight - stats.currentWeight).toFixed(1)}kg left
              </p>
            </CardContent>
          </Card>

          <Card className="statistics-glow-hover">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Daily Surplus</p>
              <p className="text-lg font-bold text-white">
                {stats.avgSurplus > 0 ? '+' : ''}{stats.avgSurplus}
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {stats.avgCaloriesPerDay} cal/day
              </p>
            </CardContent>
          </Card>

          <Card className="statistics-glow-hover">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Consistency</p>
              <p className="text-lg font-bold text-white">
                {stats.consistencyScore.toFixed(0)}%
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                {stats.totalDaysTracked} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Weight Chart - Home Page Style */}
        <Card className="statistics-glow-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(value) => `Day ${value}`}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #22c55e',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelFormatter={(value) => `Day ${value}`}
                    formatter={(value: any) => [`${value}kg`, 'Weight']}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#22c55e"
                    fill="url(#weightGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Calorie Chart - Home Page Style */}
        <Card className="statistics-glow-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Utensils className="h-5 w-5 text-blue-400" />
              Calorie Intake Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(value) => `Day ${value}`}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickFormatter={(value) => `${value} cal`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #22c55e',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelFormatter={(value) => `Day ${value}`}
                    formatter={(value: any) => [`${value} calories`, 'Intake']}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance Insights - Home Page Style */}
        <Card className="statistics-glow-hover mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-blue-400" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.weightGainRate > 0.7 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                  <Award className="h-4 w-4" />
                  Excellent Progress
                </div>
                <p className="text-sm text-blue-300/80">
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

        {/* Combined AI Analysis & Weekly Data - Home Page Style */}
        {stats.totalDaysTracked >= 7 && (
          <>
            <div className="mb-6">
              <TdeeAnalysisCard />
            </div>
            
            <Card className="statistics-glow-hover mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Weekly Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyWeightAnalysis />
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick Stats Summary - Home Page Style */}
        <Card className="statistics-glow-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-400">{stats.currentTdee}</div>
                <div className="text-xs text-muted-foreground">Current TDEE</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400">{stats.daysSinceStart}</div>
                <div className="text-xs text-muted-foreground">Days Tracked</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400">
                  {((stats.goalWeight - stats.currentWeight) / Math.max(0.1, stats.weightGainRate)).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Weeks to Goal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}