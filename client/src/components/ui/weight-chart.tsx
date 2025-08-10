import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export function WeightChart() {
  const { weightEntries } = useUserStore();

  // Prepare chart data - group by date and get latest weight per day
  const chartData = weightEntries
    .reduce((acc, entry) => {
      const existingEntry = acc.find(item => item.date === entry.date);
      if (existingEntry) {
        existingEntry.weight = entry.weight; // Use latest weight for the day
      } else {
        acc.push({
          date: entry.date,
          weight: entry.weight,
          displayDate: new Date(entry.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      return acc;
    }, [] as Array<{ date: string; weight: number; displayDate: string }>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length < 2) {
    return null;
  }

  const minWeight = Math.min(...chartData.map(d => d.weight)) - 0.5;
  const maxWeight = Math.max(...chartData.map(d => d.weight)) + 0.5;

  return (
    <Card className="grok-glow-hover">
      <CardContent className="p-4">
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <YAxis 
                domain={[minWeight, maxWeight]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 6%)',
                  border: '1px solid hsl(0, 0%, 15%)',
                  borderRadius: '0.75rem',
                  color: 'hsl(210, 40%, 98%)'
                }}
                formatter={(value: number) => [`${value}kg`, 'Weight']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(147, 100%, 45%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(147, 100%, 45%)', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 4, fill: 'hsl(147, 100%, 45%)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Weight gain summary */}
        {chartData.length >= 2 && (
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-muted-foreground">
              Start: {chartData[0].weight}kg
            </span>
            <span className="text-primary font-medium">
              {chartData[chartData.length - 1].weight > chartData[0].weight ? '+' : ''}
              {(chartData[chartData.length - 1].weight - chartData[0].weight).toFixed(1)}kg
            </span>
            <span className="text-muted-foreground">
              Latest: {chartData[chartData.length - 1].weight}kg
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}