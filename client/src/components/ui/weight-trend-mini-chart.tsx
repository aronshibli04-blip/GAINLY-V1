import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface WeightTrendMiniChartProps {
  className?: string;
}

export function WeightTrendMiniChart({ className }: WeightTrendMiniChartProps) {
  const { weightEntries } = useUserStore();
  
  // Get last 7 days of weight data
  const last7Days = [...weightEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse(); // Reverse to show chronological order
    
  const currentWeight = last7Days[last7Days.length - 1]?.weight || 0;
  const previousWeight = last7Days[0]?.weight || currentWeight;
  const weightChange = currentWeight - previousWeight;
  const isPositiveChange = weightChange > 0;

  // Prepare chart data
  const chartData = last7Days.map((entry, index) => ({
    day: index,
    weight: entry.weight
  }));
  
  // Safety check for empty data
  if (chartData.length === 0) {
    return (
      <Card className={cn("bg-slate-800/60 border-slate-700", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-base font-medium">Weight Trend</CardTitle>
              <p className="text-slate-400 text-sm">Last 7 Days</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-center text-slate-400 text-sm py-4">
            No weight data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-slate-800/60 border-slate-700", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-base font-medium">Weight Trend</CardTitle>
            <p className="text-slate-400 text-sm">Last 7 Days</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {/* MacroFactor-style Mini Chart */}
        <div className="h-16 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ fill: "#a855f7", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 4, fill: "#a855f7", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Weight Display - MacroFactor Style */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-white">
              {currentWeight.toFixed(1)} kg
            </div>
          </div>
          <div className="text-right">
            {weightChange !== 0 && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                isPositiveChange ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {isPositiveChange ? '+' : ''}{weightChange.toFixed(1)}kg
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}