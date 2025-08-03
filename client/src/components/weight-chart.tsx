import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { WeightLog } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface WeightChartProps {
  weightLogs: WeightLog[];
}

export default function WeightChart({ weightLogs }: WeightChartProps) {
  const sortedLogs = [...weightLogs]
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-14); // Last 14 days

  const chartData = sortedLogs.map(log => ({
    date: format(parseISO(log.logDate), 'MMM dd'),
    weight: parseFloat(log.weight),
  }));

  const weightTrend = sortedLogs.length >= 2 
    ? parseFloat(sortedLogs[sortedLogs.length - 1].weight) - parseFloat(sortedLogs[0].weight)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weight Trend</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-primary">7D</Button>
            <Button variant="ghost" size="sm" className="text-gray-500">14D</Button>
            <Button variant="ghost" size="sm" className="text-gray-500">30D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="date" 
                className="text-gray-500 text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                className="text-gray-500 text-xs"
                tick={{ fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={3}
                dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(142, 76%, 36%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-gray-600">
              Weight: 
              <span className={`font-medium ml-1 ${weightTrend >= 0 ? 'text-secondary' : 'text-red-500'}`}>
                {weightTrend >= 0 ? '+' : ''}{weightTrend.toFixed(1)} lbs
              </span>
            </span>
          </div>
          <div className="text-gray-500">Last {sortedLogs.length} days</div>
        </div>
      </CardContent>
    </Card>
  );
}
