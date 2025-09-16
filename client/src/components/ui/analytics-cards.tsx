import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface WeightTrendCardProps {
  className?: string;
}

export function WeightTrendCard({ className }: WeightTrendCardProps) {
  const { weightEntries } = useUserStore();
  
  // Get last 7 days of weight data
  const last7Days = [...weightEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
    
  const currentWeight = last7Days[0]?.weight || 0;
  const previousWeight = last7Days[6]?.weight || currentWeight;
  const weightChange = currentWeight - previousWeight;
  const isPositiveChange = weightChange > 0;

  // Create mini trend line data - with safety checks
  const trendData = last7Days.reverse().map(entry => entry.weight);
  
  // Safety checks for empty or single data points
  if (trendData.length === 0) {
    return (
      <Card className={cn("glass-ultra card-float ultra-smooth magnetic-hover border-premium", className)}>
        <CardHeader className="pb-1">
          <CardTitle className="heading-3 text-white flex items-center justify-between">
            <span className="premium-subtitle">Weight Trend</span>
            <Calendar className="h-4 w-4 text-primary-cyan pulse-glow" />
          </CardTitle>
          <p className="caption-text text-text-secondary">Last 7 Days</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-center text-text-secondary text-sm py-4">
            No weight data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const maxWeight = Math.max(...trendData);
  const minWeight = Math.min(...trendData);
  const range = maxWeight - minWeight || 1;

  return (
    <Card className={cn("glass-ultra card-float ultra-smooth magnetic-hover", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="heading-3 text-white flex items-center justify-between">
          <span className="premium-subtitle">Weight Trend</span>
          <Calendar className="h-4 w-4 text-primary-cyan pulse-glow" />
        </CardTitle>
        <p className="caption-text text-text-secondary">Last 7 Days</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Mini Chart */}
        <div className="relative h-5 w-full">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            {/* Trend Line - only render if we have multiple points */}
            {trendData.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={trendData.map((weight, index) => {
                  const x = trendData.length === 1 ? 50 : (index / (trendData.length - 1)) * 100;
                  const y = 40 - ((weight - minWeight) / range) * 40;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {/* Data Points */}
            {trendData.map((weight, index) => {
              const x = trendData.length === 1 ? 50 : (index / (trendData.length - 1)) * 100;
              const y = 40 - ((weight - minWeight) / range) * 40;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#10b981"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>

        {/* Current Weight */}
        <div>
          <div className="text-lg font-bold text-white">
            {currentWeight.toFixed(1)} kg
          </div>
          <div className={cn(
            "flex items-center text-xs font-medium",
            isPositiveChange ? "text-emerald-400" : "text-red-400"
          )}>
            {isPositiveChange ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isPositiveChange ? '+' : ''}{weightChange.toFixed(1)}kg this week
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CalorieTrendCardProps {
  className?: string;
  targetCalories?: number;
}

export function CalorieTrendCard({ className, targetCalories = 3200 }: CalorieTrendCardProps) {
  const { calorieEntries } = useUserStore();
  
  // Get last 7 days of calorie data
  const today = new Date();
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayCalories = calorieEntries
      .filter(entry => entry.date === dateStr)
      .reduce((sum, entry) => sum + entry.calories, 0);
      
    last7Days.push({ date: dateStr, calories: dayCalories });
  }

  const avgCalories = last7Days.reduce((sum, day) => sum + day.calories, 0) / 7;
  const surplus = avgCalories - targetCalories;
  const isPositiveSurplus = surplus > 0;

  // Create mini chart data - with safety checks
  const trendData = last7Days.map(day => day.calories);
  const nonZeroCalories = trendData.filter(c => c > 0);
  
  // Safety checks for empty data
  if (nonZeroCalories.length === 0) {
    return (
      <Card className={cn("glass-ultra card-float ultra-smooth magnetic-hover border-premium", className)}>
        <CardHeader className="pb-1">
          <CardTitle className="heading-3 text-white flex items-center justify-between">
            <span className="premium-subtitle">Calorie Average</span>
            <Calendar className="h-4 w-4 text-secondary-magenta pulse-glow" />
          </CardTitle>
          <p className="caption-text text-text-secondary">Last 7 Days</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-center text-text-secondary text-sm py-4">
            No calorie data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const maxCalories = Math.max(...trendData, targetCalories);
  const minCalories = Math.min(...nonZeroCalories, targetCalories * 0.5);
  const range = maxCalories - minCalories || 1;

  return (
    <Card className={cn("glass-ultra card-float ultra-smooth magnetic-hover", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="heading-3 text-white flex items-center justify-between">
          <span className="premium-subtitle">Calorie Average</span>
          <Calendar className="h-4 w-4 text-secondary-magenta pulse-glow" />
        </CardTitle>
        <p className="caption-text text-text-secondary">Last 7 Days</p>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Mini Chart */}
        <div className="relative h-5 w-full">
          <svg viewBox="0 0 100 40" className="w-full h-full">
            {/* Target Line */}
            <line
              x1="0"
              y1={40 - ((targetCalories - minCalories) / range) * 40}
              x2="100"
              y2={40 - ((targetCalories - minCalories) / range) * 40}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.7"
            />
            {/* Trend Line - only render if we have multiple points */}
            {trendData.length > 1 && (
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                points={trendData.map((calories, index) => {
                  const x = trendData.length === 1 ? 50 : (index / (trendData.length - 1)) * 100;
                  const y = calories > 0 
                    ? 40 - ((calories - minCalories) / range) * 40
                    : 40;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {/* Data Points */}
            {trendData.map((calories, index) => {
              if (calories === 0) return null;
              const x = trendData.length === 1 ? 50 : (index / (trendData.length - 1)) * 100;
              const y = 40 - ((calories - minCalories) / range) * 40;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#f97316"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>

        {/* Average Calories */}
        <div>
          <div className="text-lg font-bold text-white">
            {Math.round(avgCalories)} kcal
          </div>
          <div className={cn(
            "flex items-center text-xs font-medium",
            isPositiveSurplus ? "text-emerald-400" : "text-orange-400"
          )}>
            {isPositiveSurplus ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isPositiveSurplus ? '+' : ''}{Math.round(surplus)} surplus
          </div>
          <div className="caption-text text-text-secondary">
            Target: {targetCalories} kcal/day
          </div>
        </div>
      </CardContent>
    </Card>
  );
}