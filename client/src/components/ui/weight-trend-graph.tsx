import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";
import { TrendingUp, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightTrendGraphProps {
  className?: string;
}

export function WeightTrendGraph({ className }: WeightTrendGraphProps) {
  const [userId, setUserId] = useState<string | null>(null);

  // Get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  // Fetch weight logs for the last 30 days
  const { data: weightLogs = [], isLoading } = useQuery({
    queryKey: ['/api/weight-logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/weight-logs/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch weight logs');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Process weight data for the last 14 days
  const chartData = useMemo(() => {
    const days = 14;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    // If no weight data, show flat baseline at 70kg
    if (!weightLogs.length) {
      return Array.from({ length: days }, (_, i) => {
        const date = subDays(endDate, days - 1 - i);
        return {
          date: format(date, 'MMM dd'),
          weight: 70, // Baseline weight
          hasData: false,
          fullDate: format(date, 'yyyy-MM-dd')
        };
      });
    }

    // Sort weight logs by date
    const sortedLogs = [...weightLogs].sort((a, b) => 
      new Date(a.logDate).getTime() - new Date(b.logDate).getTime()
    );

    // Get the first weight as baseline
    const baselineWeight = sortedLogs.length > 0 ? parseFloat(sortedLogs[0].weight) : 70;
    
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(endDate, days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find weight log for this date
      const logForDate = sortedLogs.find(log => log.logDate === dateStr);
      
      if (logForDate) {
        return {
          date: format(date, 'MMM dd'),
          weight: parseFloat(logForDate.weight),
          hasData: true,
          fullDate: dateStr
        };
      } else {
        // Use last known weight or baseline
        const lastKnownLog = sortedLogs
          .filter(log => new Date(log.logDate) <= date)
          .pop();
          
        return {
          date: format(date, 'MMM dd'),
          weight: lastKnownLog ? parseFloat(lastKnownLog.weight) : baselineWeight,
          hasData: !!lastKnownLog,
          fullDate: dateStr
        };
      }
    });
  }, [weightLogs]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return { value: 0, text: "Ikke nok data" };
    
    const dataWithLogs = chartData.filter(d => d.hasData);
    if (dataWithLogs.length < 2) return { value: 0, text: "Ikke nok data" };
    
    const first = dataWithLogs[0];
    const last = dataWithLogs[dataWithLogs.length - 1];
    const change = last.weight - first.weight;
    
    if (Math.abs(change) < 0.1) return { value: change, text: "Stabil" };
    return { 
      value: change, 
      text: change > 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`
    };
  }, [chartData]);

  const hasRealData = weightLogs.length > 0;

  return (
    <Card className={cn("bg-slate-800/70 border-slate-700/70 backdrop-blur-xl shadow-2xl", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-orange-400" />
            <h3 className="text-white text-sm font-semibold">Vekt Trend</h3>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">14 dager</div>
            <div className={cn(
              "text-xs font-medium",
              trend.value > 0 ? "text-green-400" :
              trend.value < 0 ? "text-red-400" : "text-slate-400"
            )}>
              {trend.text}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-24 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              
              {/* Baseline reference if no data */}
              {!hasRealData && (
                <ReferenceLine 
                  y={70} 
                  stroke="#475569" 
                  strokeDasharray="2 2" 
                  opacity={0.5}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke={hasRealData ? "#fb7185" : "#64748b"}
                strokeWidth={hasRealData ? 2 : 1}
                dot={false}
                opacity={hasRealData ? 1 : 0.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {!hasRealData ? (
            <p className="text-slate-400 text-xs">
              Start å logge vekt for å se trending 📈
            </p>
          ) : weightLogs.length === 1 ? (
            <p className="text-slate-400 text-xs">
              Logg mer vekt for å se trend-utvikling
            </p>
          ) : (
            <p className="text-slate-300 text-xs">
              {chartData.filter(d => d.hasData).length} dager med data
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}