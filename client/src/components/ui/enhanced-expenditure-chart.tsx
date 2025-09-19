import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Zap, Activity } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateTdee } from "@/utils/tdee";

interface ExpenditureDataPoint {
  day: number;
  expenditure: number;
  date: string;
  dayName: string;
  surplus?: number;
}

interface EnhancedExpenditureChartProps {
  className?: string;
  targetCalories: number;
}

// Custom tooltip component with premium styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-xl"
      >
        <p className="text-slate-300 text-xs font-medium">{data.dayName}</p>
        <p className="text-white text-sm font-semibold">
          {Math.round(data.expenditure)} kcal
        </p>
        {data.surplus !== undefined && (
          <p className={cn(
            "text-xs font-medium",
            data.surplus > 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {data.surplus > 0 ? '+' : ''}{Math.round(data.surplus)} surplus
          </p>
        )}
      </motion.div>
    );
  }
  return null;
};

// Animated counter component with proper lifecycle management
const AnimatedCounter = ({ value, suffix = "", decimals = 0 }: { 
  value: number; 
  suffix?: string; 
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]); // Restart animation when value changes
  
  return (
    <span>
      {displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export function EnhancedExpenditureChart({ className, targetCalories }: EnhancedExpenditureChartProps) {
  const { weightEntries, calorieEntries, currentTdeeAnalysis } = useUserStore();
  const [hoveredPoint, setHoveredPoint] = useState<ExpenditureDataPoint | null>(null);
  
  // Enhanced data processing with calorie analysis
  const expenditureAnalysis = useMemo(() => {
    const today = new Date();
    const last7Days = [];
    
    // Calculate real expenditure for each day
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get daily calorie intake for surplus calculation
      const dailyCalories = calorieEntries
        .filter(entry => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.calories, 0);
      
      // Calculate daily expenditure
      let dailyExpenditure = currentTdeeAnalysis?.tdee || 0;
      
      // If no TDEE analysis, try to estimate from recent data
      if (!dailyExpenditure && weightEntries.length > 1 && calorieEntries.length > 0) {
        try {
          const tdeeResult = calculateTdee(weightEntries, calorieEntries, "user1");
          dailyExpenditure = tdeeResult.tdee;
        } catch (error) {
          // Fallback to estimated TDEE based on target calories
          dailyExpenditure = Math.max(targetCalories - 500, 2000); // Conservative estimate
        }
      }
      
      // Calculate surplus
      const surplus = dailyCalories - dailyExpenditure;
      
      last7Days.push({
        day: 6 - i,
        expenditure: dailyExpenditure,
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        surplus: dailyCalories > 0 ? surplus : undefined
      });
    }
    
    if (last7Days.every(day => day.expenditure === 0)) return null;
    
    // Calculate averages and trends with proper handling
    const avgExpenditure = last7Days.reduce((sum, day) => sum + day.expenditure, 0) / 7;
    
    // Fix avgSurplus calculation - divide by actual count, not 7
    const daysWithSurplus = last7Days.filter(day => day.surplus !== undefined);
    const avgSurplus = daysWithSurplus.length > 0 
      ? daysWithSurplus.reduce((sum, day) => sum + (day.surplus || 0), 0) / daysWithSurplus.length
      : 0;
    
    // Metabolic efficiency calculation
    const metabolicEfficiency = avgExpenditure > 0 ? (targetCalories / avgExpenditure) * 100 : 0;
    
    // Weekly expenditure trend
    const firstHalf = last7Days.slice(0, 3);
    const secondHalf = last7Days.slice(-3);
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.expenditure, 0) / 3;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.expenditure, 0) / 3;
    const expenditureTrend = secondHalfAvg - firstHalfAvg;
    
    return {
      chartData: last7Days,
      avgExpenditure,
      avgSurplus,
      metabolicEfficiency,
      expenditureTrend,
      isMetabolicAdaptation: expenditureTrend < -50, // Significant decrease suggests adaptation
      surplusConsistency: last7Days.filter(d => d.surplus !== undefined && d.surplus > 0).length,
      totalSurplusDays: daysWithSurplus.length
    };
  }, [weightEntries, calorieEntries, currentTdeeAnalysis, targetCalories]);
  
  if (!expenditureAnalysis) {
    return (
      <Card className={cn("bg-slate-900/80 border-slate-700/50 backdrop-blur-sm group hover:border-slate-600/50 transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base text-white font-semibold">
                  Energy Balance
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-center text-slate-400 text-sm py-8">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Track calories to see energy balance
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { 
    chartData, 
    avgExpenditure, 
    avgSurplus, 
    metabolicEfficiency,
    expenditureTrend,
    isMetabolicAdaptation,
    surplusConsistency 
  } = expenditureAnalysis;
  
  const isPositiveSurplus = avgSurplus > 0;
  const isSurplusTarget = Math.abs(avgSurplus - 500) < 200; // Within 200 kcal of ideal surplus
  
  // Color scheme based on surplus status
  const surplusColors = {
    excellent: { 
      primary: "#10b981", 
      secondary: "#059669",
      accent: "text-emerald-400",
      bg: "from-emerald-500/20 to-green-500/20" 
    },
    good: { 
      primary: "#f59e0b", 
      secondary: "#d97706",
      accent: "text-amber-400",
      bg: "from-amber-500/20 to-orange-500/20" 
    },
    deficit: { 
      primary: "#ef4444", 
      secondary: "#dc2626",
      accent: "text-red-400",
      bg: "from-red-500/20 to-pink-500/20" 
    }
  };
  
  const currentColors = isSurplusTarget ? surplusColors.excellent : 
                       isPositiveSurplus ? surplusColors.good : 
                       surplusColors.deficit;
  
  return (
    <Card className={cn(
      "bg-slate-900/80 border-slate-700/50 backdrop-blur-sm group transition-all duration-300",
      "hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-lg transition-transform group-hover:scale-110",
              "bg-gradient-to-br from-orange-500 to-red-500"
            )}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base text-white font-semibold">
                Energy Balance
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPositiveSurplus ? '📈 Surplus' : '📉 Deficit'} • Last 7 days
              </p>
            </div>
          </div>
          
          {/* Efficiency Badge */}
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            "bg-slate-800/50 border",
            metabolicEfficiency > 110 ? "text-emerald-400 border-emerald-400/30" :
            metabolicEfficiency > 90 ? "text-amber-400 border-amber-400/30" :
            "text-red-400 border-red-400/30"
          )}>
            {metabolicEfficiency.toFixed(0)}% efficiency
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-4">
        {/* Enhanced Area Chart */}
        <div className="h-20 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              onMouseMove={(e: any) => {
                if (e.activePayload && e.activePayload[0]) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <XAxis dataKey="day" hide={true} />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide={true} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="expenditureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColors.primary} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={currentColors.primary} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={currentColors.primary} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <Area
                type="monotone"
                dataKey="expenditure"
                stroke={currentColors.primary}
                strokeWidth={3}
                fill="url(#expenditureGradient)"
                dot={{ fill: currentColors.primary, strokeWidth: 0, r: 3 }}
                activeDot={{ 
                  r: 6, 
                  fill: currentColors.secondary, 
                  strokeWidth: 2, 
                  stroke: "white",
                  style: { filter: `drop-shadow(0 0 6px ${currentColors.primary})` }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Hover Data Overlay */}
          <AnimatePresence>
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-2 right-2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 text-xs"
              >
                <div className="text-slate-300">{hoveredPoint.dayName}</div>
                <div className="text-white font-semibold">{Math.round(hoveredPoint.expenditure)} kcal</div>
                {hoveredPoint.surplus !== undefined && (
                  <div className={cn(
                    "font-medium",
                    hoveredPoint.surplus > 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {hoveredPoint.surplus > 0 ? '+' : ''}{Math.round(hoveredPoint.surplus)} surplus
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average TDEE */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 group-hover:border-slate-600/30 transition-all">
            <div className="text-xs text-slate-400 font-medium mb-1">Avg TDEE</div>
            <div className="text-xl font-bold text-white">
              <AnimatedCounter value={avgExpenditure} suffix=" kcal" />
            </div>
          </div>
          
          {/* Average Surplus */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 group-hover:border-slate-600/30 transition-all">
            <div className="text-xs text-slate-400 font-medium mb-1">Avg Surplus</div>
            <div className={cn("text-xl font-bold flex items-center", currentColors.accent)}>
              {isPositiveSurplus ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {isPositiveSurplus ? '+' : ''}<AnimatedCounter value={avgSurplus} suffix=" kcal" />
            </div>
          </div>
        </div>
        
        {/* Smart Energy Insights */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          "bg-gradient-to-r", currentColors.bg,
          "border-current/20"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className={cn("h-4 w-4", currentColors.accent)} />
              <span className={cn("text-sm font-medium", currentColors.accent)}>
                Metabolic Insights
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {surplusConsistency}/7 days positive
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            {isMetabolicAdaptation ? 
              `Possible metabolic adaptation detected. TDEE decreased by ${Math.abs(expenditureTrend)}kcal this week.` :
             isSurplusTarget ?
              `Excellent energy balance! You're hitting the ideal 400-600kcal surplus for lean gains.` :
             isPositiveSurplus ?
              `Good surplus maintained. Consider tracking consistency to optimize lean mass gains.` :
              'Currently in a deficit. Increase calorie intake to support muscle growth and weight gain.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}