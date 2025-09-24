import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WeightDataPoint {
  day: number;
  weight: number;
  date: string;
  dayName: string;
}

interface EnhancedWeightTrendChartProps {
  className?: string;
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
          {data.weight.toFixed(1)} kg
        </p>
      </motion.div>
    );
  }
  return null;
};

// Animated counter component with proper lifecycle management
const AnimatedCounter = ({ value, suffix = "", decimals = 1 }: { 
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

export function EnhancedWeightTrendChart({ className }: EnhancedWeightTrendChartProps) {
  const { weightEntries, user } = useUserStore();
  const [hoveredPoint, setHoveredPoint] = useState<WeightDataPoint | null>(null);
  
  // Enhanced data processing with trend analysis
  const chartAnalysis = useMemo(() => {
    // Get last 7 days of weight data
    const last7Days = [...weightEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .reverse();
    
    if (last7Days.length === 0) return null;
    
    const chartData: WeightDataPoint[] = last7Days.map((entry, index) => {
      const date = new Date(entry.date);
      return {
        day: index,
        weight: entry.weight,
        date: entry.date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
    
    const currentWeight = last7Days[last7Days.length - 1]?.weight || 0;
    const previousWeight = last7Days[0]?.weight || currentWeight;
    const weightChange = currentWeight - previousWeight;
    const percentChange = previousWeight > 0 ? (weightChange / previousWeight) * 100 : 0;
    
    // Calculate trend slope with edge case handling
    const n = chartData.length;
    let slope = 0;
    let weeklyProjection = 0;
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (n >= 2) {
      const sumX = chartData.reduce((sum, _, i) => sum + i, 0);
      const sumY = chartData.reduce((sum, point) => sum + point.weight, 0);
      const sumXY = chartData.reduce((sum, point, i) => sum + i * point.weight, 0);
      const sumXX = chartData.reduce((sum, _, i) => sum + i * i, 0);
      
      const denominator = n * sumXX - sumX * sumX;
      if (denominator !== 0) {
        slope = (n * sumXY - sumX * sumY) / denominator;
        trendDirection = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
        weeklyProjection = slope * 7;
      }
    }
    
    return {
      chartData,
      currentWeight,
      previousWeight,
      weightChange,
      percentChange,
      trendDirection,
      weeklyProjection,
      volatility: Math.abs(weightChange / 7) // Daily volatility
    };
  }, [weightEntries]);
  
  if (!chartAnalysis) {
    // Get user's current weight from profile
    const currentWeight = user?.weight || 70; // Default to 70kg if no weight set
    
    // Create flat line chart data using current weight
    const weightChartData = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      weight: currentWeight,
      date: '',
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
    }));
    
    return (
      <Card className={cn(
        "bg-slate-900/80 border-slate-700/50 backdrop-blur-sm group transition-all duration-300",
        "hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 h-full",
        className
      )}>
        <CardHeader className="pb-0.5">
          <div className="flex items-center space-x-1.5">
            <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Activity className="h-2.5 w-2.5 text-white" />
            </div>
            <CardTitle className="text-xs text-white font-semibold">
              Weight Progress
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2 space-y-1.5">
          {/* Chart */}
          <div className="h-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={weightChartData} 
                margin={{ top: 1, right: 1, left: 1, bottom: 1 }}
              >
                <XAxis dataKey="day" hide={true} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide={true} />
                
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Simple weight number */}
          <div className="text-center">
            <div className="text-sm font-bold text-white">
              <AnimatedCounter value={currentWeight} suffix=" kg" decimals={1} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { 
    chartData, 
    currentWeight, 
    weightChange, 
    percentChange, 
    trendDirection,
    weeklyProjection,
    volatility 
  } = chartAnalysis;
  
  const isPositiveChange = weightChange > 0;
  const isStrongTrend = Math.abs(weeklyProjection) > 0.3;
  
  // Color scheme based on trend
  const trendColors = {
    increasing: { 
      primary: "#10b981", 
      secondary: "#059669", 
      accent: "text-emerald-400",
      bg: "from-emerald-500/20 to-green-500/20" 
    },
    decreasing: { 
      primary: "#ef4444", 
      secondary: "#dc2626", 
      accent: "text-red-400",
      bg: "from-red-500/20 to-orange-500/20" 
    },
    stable: { 
      primary: "#06b6d4", 
      secondary: "#0891b2", 
      accent: "text-cyan-400",
      bg: "from-cyan-500/20 to-blue-500/20" 
    }
  };
  
  const currentColors = trendColors[trendDirection as keyof typeof trendColors];
  
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
              `bg-gradient-to-br from-blue-500 to-cyan-500`
            )}>
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base text-white font-semibold">
                Weight Progress
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {trendDirection === 'increasing' ? '📈 Gaining' : 
                 trendDirection === 'decreasing' ? '📉 Losing' : '➡️ Stable'} • Last 7 days
              </p>
            </div>
          </div>
          
          {/* Trend Indicator */}
          {isStrongTrend && (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              "bg-slate-800/50 border",
              currentColors.accent,
              "border-current/30"
            )}>
              {Math.abs(weeklyProjection) > 0.5 ? 'Strong' : 'Moderate'} trend
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-4">
        {/* Enhanced Chart with Gradient */}
        <div className="h-20 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              onMouseMove={(e: any) => {
                if (e.activePayload && e.activePayload[0]) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <XAxis 
                dataKey="day" 
                hide={true}
              />
              <YAxis 
                domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColors.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={currentColors.primary} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <Line
                type="monotone"
                dataKey="weight"
                stroke={currentColors.primary}
                strokeWidth={3}
                dot={{ fill: currentColors.primary, strokeWidth: 0, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  fill: currentColors.secondary, 
                  strokeWidth: 2, 
                  stroke: "white",
                  style: { filter: `drop-shadow(0 0 6px ${currentColors.primary})` }
                }}
                fill="url(#weightGradient)"
                fillOpacity={1}
              />
            </LineChart>
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
                <div className="text-white font-semibold">{hoveredPoint.weight.toFixed(1)} kg</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Weight */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 group-hover:border-slate-600/30 transition-all">
            <div className="text-xs text-slate-400 font-medium mb-1">Current</div>
            <div className="text-xl font-bold text-white">
              <AnimatedCounter value={currentWeight} suffix=" kg" />
            </div>
          </div>
          
          {/* Change */}
          <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 group-hover:border-slate-600/30 transition-all">
            <div className="text-xs text-slate-400 font-medium mb-1">Change</div>
            <div className={cn("text-xl font-bold flex items-center", currentColors.accent)}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {isPositiveChange ? '+' : ''}{weightChange.toFixed(1)}kg
            </div>
          </div>
        </div>
        
        {/* Smart Insights */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          "bg-gradient-to-r", currentColors.bg,
          "border-current/20"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className={cn("h-4 w-4", currentColors.accent)} />
              <span className={cn("text-sm font-medium", currentColors.accent)}>
                7-Day Analysis
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Volatility: {volatility > 0.2 ? 'High' : 'Low'}
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            {weeklyProjection > 0.5 ? 
              `Strong upward trend. Projected +${weeklyProjection.toFixed(1)}kg/week if maintained.` :
             weeklyProjection < -0.5 ?
              `Downward trend detected. Projected ${weeklyProjection.toFixed(1)}kg/week change.` :
              'Weight remaining relatively stable. Consider increasing calorie surplus for gains.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}