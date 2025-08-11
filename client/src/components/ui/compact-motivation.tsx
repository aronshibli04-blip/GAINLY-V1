import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { 
  TrendingUp, 
  Target, 
  Flame,
  CheckCircle,
  Clock
} from "lucide-react";

export function CompactMotivation() {
  const { weightEntries, calorieEntries } = useUserStore();

  // Calculate key metrics
  const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const totalGain = currentWeight - startWeight;
  const weeklyGain = totalDays >= 7 ? (totalGain / totalDays) * 7 : 0;

  // Calculate current streak
  const today = new Date();
  const dates = new Set([
    ...weightEntries.map(w => w.date),
    ...calorieEntries.map(c => c.date)
  ]);
  
  let currentStreak = 0;
  const todayString = today.toISOString().split('T')[0];
  if (dates.has(todayString)) {
    currentStreak = 1;
    // Count backwards from today
    for (let i = 1; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateString = checkDate.toISOString().split('T')[0];
      if (dates.has(checkDateString)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return (
    <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Total Progress */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">+{totalGain.toFixed(1)}kg</span>
            </div>
            <p className="text-xs text-muted-foreground">Total økning</p>
          </div>

          {/* Weekly Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className={`h-4 w-4 ${weeklyGain >= 1.0 ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className={`text-lg font-bold ${weeklyGain >= 1.0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {weeklyGain.toFixed(1)}kg
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Per uke</p>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-lg font-bold">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Dager streak</p>
          </div>
        </div>

        {/* Progress Status */}
        <div className="mt-3 p-2 rounded-lg bg-black/20 border border-primary/20">
          <div className="flex items-center gap-2">
            {weeklyGain >= 1.0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-400">Perfekt! Du treffer målet på 1kg/uke! 🎯</p>
              </>
            ) : weeklyGain >= 0.5 ? (
              <>
                <Target className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <p className="text-sm font-medium text-yellow-400">Bra fremgang! Øk litt mer kaloriinntaket</p>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm font-medium text-primary">Tid for å øke intensiteten! 💪</p>
              </>
            )}
          </div>
        </div>

        {/* Today's Achievement */}
        {dates.has(todayString) && (
          <div className="mt-2 text-center">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              ✓ Data logget i dag!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}