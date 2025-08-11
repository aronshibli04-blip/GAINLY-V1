import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  dailyWeights: { date: string; weight: number }[];
  averageWeight: number;
  weeklyChange: number;
  totalChange: number;
  isComplete: boolean;
}

export function WeeklyWeightAnalysis() {
  const { weightEntries } = useUserStore();

  // Group weight entries into weekly periods (7-day chunks)
  const getWeeklyData = (): WeeklyData[] => {
    if (weightEntries.length === 0) return [];

    // Sort entries by date (oldest first)
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const weeks: WeeklyData[] = [];
    let currentWeekData: { date: string; weight: number }[] = [];
    let weekStartDate: Date | null = null;

    sortedEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.date);
      
      // Start new week if needed
      if (!weekStartDate) {
        weekStartDate = entryDate;
        currentWeekData = [];
      }

      currentWeekData.push({ date: entry.date, weight: entry.weight });

      // Check if we've completed a 7-day period or reached the end
      const daysSinceStart = Math.floor(
        (entryDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isLastEntry = index === sortedEntries.length - 1;
      const shouldCompleteWeek = daysSinceStart >= 6 || isLastEntry;

      if (shouldCompleteWeek && currentWeekData.length > 0) {
        const weekEndDate = entryDate;
        const averageWeight = currentWeekData.reduce((sum, d) => sum + d.weight, 0) / currentWeekData.length;
        
        // Calculate weekly change
        let weeklyChange = 0;
        if (weeks.length > 0) {
          weeklyChange = averageWeight - weeks[weeks.length - 1].averageWeight;
        }

        // Calculate total change from first week
        const totalChange = weeks.length > 0 
          ? averageWeight - weeks[0].averageWeight
          : currentWeekData[currentWeekData.length - 1].weight - currentWeekData[0].weight;

        weeks.push({
          weekStart: weekStartDate.toISOString().split('T')[0],
          weekEnd: weekEndDate.toISOString().split('T')[0],
          dailyWeights: [...currentWeekData],
          averageWeight: Math.round(averageWeight * 10) / 10,
          weeklyChange: Math.round(weeklyChange * 10) / 10,
          totalChange: Math.round(totalChange * 10) / 10,
          isComplete: daysSinceStart >= 6
        });

        // Reset for next week (only if not last entry)
        if (!isLastEntry) {
          weekStartDate = null;
        }
      }
    });

    return weeks;
  };

  const weeklyData = getWeeklyData();
  const totalGain = weeklyData.length > 0 
    ? weeklyData[weeklyData.length - 1].averageWeight - weeklyData[0].averageWeight 
    : 0;

  if (weeklyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Start logging daily weights to see weekly analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress Summary */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {totalGain > 0 ? '+' : ''}{totalGain.toFixed(1)}kg
              </div>
              <p className="text-sm text-muted-foreground">Total Gain</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {weeklyData.length} wk{weeklyData.length !== 1 ? 's' : ''}
              </div>
              <p className="text-sm text-muted-foreground">Tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Weekly Breakdown</h3>
        {weeklyData.map((week, index) => {
          const weekNumber = index + 1;
          const startDate = new Date(week.weekStart).toLocaleDateString('no-NO', { 
            day: 'numeric', 
            month: 'long' 
          });
          const endDate = new Date(week.weekEnd).toLocaleDateString('no-NO', { 
            day: 'numeric', 
            month: 'long' 
          });

          return (
            <Card key={index} className="border-l-4 border-l-primary/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">Uke {weekNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      {startDate} - {endDate}
                    </p>
                  </div>
                  <Badge variant={week.isComplete ? "default" : "secondary"}>
                    {week.isComplete ? "Complete" : "Ongoing"}
                  </Badge>
                </div>

                {/* Daily Weights */}
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Daglige målinger:</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {week.dailyWeights.map((day, dayIndex) => {
                      const dayDate = new Date(day.date).toLocaleDateString('no-NO', { 
                        day: 'numeric',
                        month: 'numeric'
                      });
                      return (
                        <div key={dayIndex} className="text-center p-1 bg-muted rounded">
                          <div className="font-mono">{day.weight}kg</div>
                          <div className="text-muted-foreground">{dayDate}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Week Summary */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-muted">
                  <div className="text-center">
                    <div className="font-semibold text-primary">
                      {week.averageWeight}kg
                    </div>
                    <p className="text-xs text-muted-foreground">Gjennomsnitt</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-semibold flex items-center justify-center gap-1 ${
                      week.totalChange >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {week.totalChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {week.totalChange > 0 ? '+' : ''}{week.totalChange}kg
                    </div>
                    <p className="text-xs text-muted-foreground">Uke resultat</p>
                  </div>

                  {index > 0 && (
                    <div className="text-center">
                      <div className={`font-semibold flex items-center justify-center gap-1 ${
                        week.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {week.weeklyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {week.weeklyChange > 0 ? '+' : ''}{week.weeklyChange}kg
                      </div>
                      <p className="text-xs text-muted-foreground">Vs forrige uke</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}