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
        <CardHeader className="pb-0">
          <div className="flex items-center space-x-1">
            <div className="p-0.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded">
              <Activity className="h-2 w-2 text-white" />
            </div>
            <div className="text-base text-white font-medium leading-tight">
              Weight Progress
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-1 space-y-0.5">
          {/* Chart */}
          <div className="h-5 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={weightChartData} 
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="day" hide={true} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide={true} />
                
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Simple weight number */}
          <div className="text-center">
            <div className="text-sm font-bold text-white leading-tight">
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
      "hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 h-full",
      className
    )}>
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-1">
          <div className="p-0.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded">
            <Activity className="h-2 w-2 text-white" />
          </div>
          <div className="text-base text-white font-medium leading-tight">
            Weight Progress
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-1.5 space-y-1">
        {/* Chart */}
        <div className="h-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="day" hide={true} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide={true} />
              
              <Line
                type="monotone"
                dataKey="weight"
                stroke={currentColors.primary}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Simple weight number */}
        <div className="text-center">
          <div className="text-xs font-bold text-white">
            <AnimatedCounter value={currentWeight} suffix=" kg" decimals={1} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}