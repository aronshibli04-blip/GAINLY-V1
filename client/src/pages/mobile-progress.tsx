import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/store/userStore";
import { 
  Target, 
  TrendingUp, 
  Calendar,
  Camera,
  Scale,
  Ruler,
  Activity,
  Trophy,
  Zap,
  ChevronRight,
  Plus
} from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";
import { Link } from "wouter";

export default function MobileProgress() {
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

    const currentTdee = currentTdeeAnalysis?.tdee || 2400;
    const avgSurplus = avgCaloriesPerDay - currentTdee;
    
    // Weight gain rate (kg per week)
    const weightGainRate = totalDaysTracked > 0 ? (weightGained / totalDaysTracked) * 7 : 0;
    
    // Progress to goal
    const progressToGoal = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
    
    return {
      currentWeight,
      startWeight,
      weightGained,
      goalWeight,
      progressToGoal,
      weightGainRate,
      totalDaysTracked,
      avgCaloriesPerDay,
      avgSurplus,
      currentTdee
    };
  }, [user, weightEntries, calorieEntries, currentTdeeAnalysis]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : weightEntries.length;
    
    const weightData = weightEntries
      .slice(0, days)
      .reverse()
      .map((entry, index) => ({
        day: index + 1,
        weight: entry.weight,
        date: entry.date
      }));

    const calorieData = calorieEntries
      .slice(0, days)
      .reverse()
      .map((entry, index) => ({
        day: index + 1,
        calories: entry.calories,
        date: entry.date
      }));

    return { weightData, calorieData };
  }, [weightEntries, calorieEntries, selectedPeriod]);

  if (!user || !stats) return null;

  return (
    <div className="mobile-container">
      {/* Mobile Header */}
      <MobileHeader 
        title="Progress" 
        onOpenMenu={openMenu}
      />

      {/* Futuristic Background Effect */}
      <div className="fixed inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-slate-950 to-emerald-950/30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 content-with-bottom-nav p-4 space-y-6 pb-28">
        
        {/* Header */}
        <div className="text-center pt-4">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-spin" 
                 style={{ animationDuration: '8s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center shadow-xl">
              <TrendingUp className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              FREMGANG
            </span>
          </h1>
          <p className="text-emerald-400/70">Comprehensive progress tracking & insights</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-emerald-400/20">
            <CardContent className="p-4 text-center">
              <Scale className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.currentWeight}kg</p>
              <p className="text-xs text-slate-400">Current Weight</p>
              <p className="text-xs text-emerald-400 font-semibold">
                +{stats.weightGained.toFixed(1)}kg gained
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-emerald-400/20">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{Math.round(stats.progressToGoal)}%</p>
              <p className="text-xs text-slate-400">Progress to Goal</p>
              <Progress value={Math.min(stats.progressToGoal, 100)} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            {(['7d', '30d', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 ${selectedPeriod === period ? 'bg-emerald-600 text-black' : 'text-slate-400'}`}
              >
                {period === 'all' ? 'All' : period.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-slate-800/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            <TabsTrigger value="photos" className="text-xs">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Key Stats */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-emerald-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Activity className="h-5 w-5" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Weekly Gain Rate</p>
                    <p className="text-lg font-semibold text-white">
                      {stats.weightGainRate > 0 ? '+' : ''}{stats.weightGainRate.toFixed(2)}kg/week
                    </p>
                    <Badge variant="outline" className={
                      Math.abs(stats.weightGainRate - 1.0) < 0.3 ? 'text-emerald-400 border-emerald-400/40' : 'text-yellow-400 border-yellow-400/40'
                    }>
                      {Math.abs(stats.weightGainRate - 1.0) < 0.3 ? 'On Target' : 'Adjust Intake'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Days Tracked</p>
                    <p className="text-lg font-semibold text-white">{stats.totalDaysTracked} days</p>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/40">
                      {stats.totalDaysTracked >= 30 ? 'Excellent' : 'Building Data'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Avg Daily Calories</p>
                    <p className="text-lg font-semibold text-white">{stats.avgCaloriesPerDay.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">TDEE: {stats.currentTdee}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Daily Surplus</p>
                    <p className="text-lg font-semibold text-white">
                      {stats.avgSurplus > 0 ? '+' : ''}{stats.avgSurplus.toLocaleString()}
                    </p>
                    <Badge variant="outline" className={
                      Math.abs(stats.avgSurplus - 1100) < 200 ? 'text-emerald-400 border-emerald-400/40' : 'text-yellow-400 border-yellow-400/40'
                    }>
                      {Math.abs(stats.avgSurplus - 1100) < 200 ? 'Perfect' : 'Needs Adjustment'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/measurements">
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-purple-400/20 hover:border-purple-400/40 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Ruler className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Body Measurements</p>
                    <p className="text-xs text-slate-400">Track muscle growth</p>
                    <ChevronRight className="h-4 w-4 text-purple-400 mx-auto mt-2" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/goals">
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20 hover:border-blue-400/40 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Milestones</p>
                    <p className="text-xs text-slate-400">Track achievements</p>
                    <ChevronRight className="h-4 w-4 text-blue-400 mx-auto mt-2" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-4">
            {/* Weight Chart */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-emerald-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.weightData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                      <XAxis 
                        dataKey="day"
                        className="text-slate-500 text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={['dataMin - 1', 'dataMax + 1']}
                        className="text-slate-500 text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px' 
                        }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#10b981" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Calorie Chart */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-orange-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Zap className="h-5 w-5" />
                  Daily Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.calorieData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
                      <XAxis 
                        dataKey="day"
                        className="text-slate-500 text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        className="text-slate-500 text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar 
                        dataKey="calories" 
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            {/* Advanced Analytics from Statistics page */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20">
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalDaysTracked}</p>
                  <p className="text-xs text-slate-400">Days Tracked</p>
                  <p className="text-xs text-blue-400 font-semibold">
                    {Math.round(((stats.totalDaysTracked / Math.max(stats.totalDaysTracked, 30)) * 100))}% consistency
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-purple-400/20">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.currentTdee}</p>
                  <p className="text-xs text-slate-400">Current TDEE</p>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/40 text-xs mt-1">
                    AI Calculated
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Analysis */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-emerald-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Calendar className="h-5 w-5" />
                  Weekly Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.weightGainRate > 0 ? '+' : ''}{stats.weightGainRate.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">kg/week rate</p>
                    <Badge variant="outline" className={
                      Math.abs(stats.weightGainRate - 1.0) < 0.3 
                        ? 'text-emerald-400 border-emerald-400/40' 
                        : 'text-yellow-400 border-yellow-400/40'
                    }>
                      {Math.abs(stats.weightGainRate - 1.0) < 0.3 ? 'Perfect' : 'Adjust'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.avgSurplus > 0 ? '+' : ''}{Math.round(stats.avgSurplus)}
                    </p>
                    <p className="text-xs text-slate-400">Daily surplus</p>
                    <Badge variant="outline" className={
                      Math.abs(stats.avgSurplus - 1100) < 200 
                        ? 'text-emerald-400 border-emerald-400/40' 
                        : 'text-orange-400 border-orange-400/40'
                    }>
                      {Math.abs(stats.avgSurplus - 1100) < 200 ? 'Optimal' : 'Review'}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(stats.progressToGoal)}%
                    </p>
                    <p className="text-xs text-slate-400">Goal progress</p>
                    <Progress value={Math.min(stats.progressToGoal, 100)} className="h-2 mt-1" />
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    AI Recommendations
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Math.abs(stats.weightGainRate - 1.0) >= 0.3 && (
                      <p className="text-slate-300">
                        • {stats.weightGainRate < 0.7 
                          ? `Increase daily intake by ${Math.round((1.0 - stats.weightGainRate) * 1100)} calories` 
                          : `Reduce daily intake by ${Math.round((stats.weightGainRate - 1.0) * 1100)} calories`}
                      </p>
                    )}
                    {stats.totalDaysTracked < 14 && (
                      <p className="text-slate-300">
                        • Track consistently for {14 - stats.totalDaysTracked} more days for better AI accuracy
                      </p>
                    )}
                    {stats.avgCaloriesPerDay > 0 && Math.abs(stats.avgSurplus - 1100) >= 200 && (
                      <p className="text-slate-300">
                        • Target {stats.currentTdee + 1100} calories daily for optimal 1kg/week gain
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" className="space-y-4">
            {/* Progress Photos Section */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-purple-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Camera className="h-5 w-5" />
                  Progress Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-400 mb-2">No Progress Photos Yet</p>
                  <p className="text-sm text-slate-500 mb-6">
                    Visual progress tracking is powerful for motivation. Take photos weekly to see your transformation.
                  </p>
                  
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Take First Photo
                  </Button>
                </div>
                
                {/* Photo Guidelines */}
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-2">Tips for Great Progress Photos</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Same lighting and location each time</li>
                    <li>• Take photos at the same time of day</li>
                    <li>• Wear the same clothes or minimal clothing</li>
                    <li>• Front, side, and back angles</li>
                    <li>• Weekly consistency is key</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}