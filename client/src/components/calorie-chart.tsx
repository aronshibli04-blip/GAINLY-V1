import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface CalorieChartProps {
  dailyCalories: { logDate: string; totalCalories: number }[];
}

export default function CalorieChart({ dailyCalories }: CalorieChartProps) {
  const sortedData = [...dailyCalories]
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .slice(-7); // Last 7 days

  const chartData = sortedData.map(day => ({
    date: format(parseISO(day.logDate), 'EEE'),
    calories: day.totalCalories,
  }));

  const avgCalories = sortedData.length > 0 
    ? Math.round(sortedData.reduce((sum, day) => sum + day.totalCalories, 0) / sortedData.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Calories</CardTitle>
          <div className="text-sm text-gray-500">
            Avg: <span className="font-medium text-amber-500">{avgCalories.toLocaleString()}</span> kcal/day
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="date" 
                className="text-gray-500 text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 200', 'dataMax + 200']}
                className="text-gray-500 text-xs"
                tick={{ fontSize: 12 }}
              />
              <Bar 
                dataKey="calories" 
                fill="hsl(45, 93%, 47%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600">Target: <span className="font-medium text-amber-500">2,500 kcal</span></span>
          </div>
          <div className="text-gray-500">Last 7 days</div>
        </div>
      </CardContent>
    </Card>
  );
}
