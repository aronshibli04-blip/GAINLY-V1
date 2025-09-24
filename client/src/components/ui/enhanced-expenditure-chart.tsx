import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Zap } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";

interface ExpenditureDataPoint {
  day: number;
  expenditure: number;
  date: string;
  dayName: string;
}

interface EnhancedExpenditureChartProps {
  className?: string;
  targetCalories: number;
}

// Animated counter component
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
  }, [value]);
  
  return (
    <span>
      {displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export function EnhancedExpenditureChart({ className, targetCalories }: EnhancedExpenditureChartProps) {
  const { weightEntries, calorieEntries, currentTdeeAnalysis } = useUserStore();
  
  // Simple TDEE calculation
  const chartData = useMemo(() => {
    const tdeeEstimate = currentTdeeAnalysis?.tdee || Math.max(targetCalories - 1100, 2200);
    
    // Create flat TDEE line for 7 days
    return Array.from({ length: 7 }, (_, i) => ({
      day: i,
      expenditure: tdeeEstimate,
      date: '',
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
    }));
  }, [currentTdeeAnalysis, targetCalories]);
  
  const tdee = chartData[0]?.expenditure || 2200;

  return (
    <Card className={cn(
      "bg-slate-900/80 border-slate-700/50 backdrop-blur-sm group transition-all duration-300",
      "hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 h-full",
      className
    )}>
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-1">
          <div className="p-0.5 bg-gradient-to-br from-orange-500 to-red-500 rounded">
            <Zap className="h-2 w-2 text-white" />
          </div>
          <div className="text-xs text-white font-medium">
            TDEE
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-1.5 space-y-1">
        {/* Chart */}
        <div className="h-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="day" hide={true} />
              <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide={true} />
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="tdeeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <Area
                type="monotone"
                dataKey="expenditure"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#tdeeGradient)"
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Simple TDEE number */}
        <div className="text-center">
          <div className="text-xs font-bold text-white">
            <AnimatedCounter value={tdee} suffix=" kcal" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}