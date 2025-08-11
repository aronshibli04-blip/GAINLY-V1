import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { 
  Flame, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export function ProgressStreaks() {
  const { weightEntries, calorieEntries } = useUserStore();

  // Calculate streaks
  const calculateStreaks = () => {
    const today = new Date();
    const dates = new Set([
      ...weightEntries.map(w => w.date),
      ...calorieEntries.map(c => c.date)
    ]);
    
    const sortedDates = Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Check current streak (from today backwards)
    const todayString = today.toISOString().split('T')[0];
    if (dates.has(todayString)) {
      currentStreak = 1;
    }
    
    // Calculate streaks
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = new Date(sortedDates[i + 1]);
      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        if (i === 0 && dates.has(todayString)) {
          currentStreak = tempStreak + 1;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak + 1);
        tempStreak = 0;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak + 1, currentStreak);
    
    return { currentStreak, longestStreak };
  };

  // Get last 7 days activity
  const getLast7Days = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const hasWeight = weightEntries.some(w => w.date === dateString);
      const hasCalories = calorieEntries.some(c => c.date === dateString);
      const hasData = hasWeight || hasCalories;
      
      last7Days.push({
        date: dateString,
        dayName: date.toLocaleDateString('no-NO', { weekday: 'short' }),
        hasData,
        isToday: i === 0
      });
    }
    
    return last7Days;
  };

  const streaks = calculateStreaks();
  const last7Days = getLast7Days();
  const weeklyConsistency = (last7Days.filter(day => day.hasData).length / 7) * 100;

  return (
    <div className="space-y-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-white">Streak</h3>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Aktiv
                </Badge>
              </div>
              <div className="text-3xl font-black text-orange-400 mb-1">
                {streaks.currentStreak} dager
              </div>
              <p className="text-orange-300/80 text-sm">
                Rekord: {streaks.longestStreak} dager
              </p>
            </div>
          </div>

          {streaks.currentStreak >= 7 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <p className="text-orange-300 font-semibold text-sm">
                🔥 Fantastisk! Du har holdt streaken i over en uke!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Activity Grid */}
      <Card className="bg-slate-800/50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Siste 7 Dager
            </h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {Math.round(weeklyConsistency)}% konsistens
            </Badge>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1 font-medium">
                  {day.dayName}
                </div>
                <div className={`w-full h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                  day.hasData
                    ? 'bg-primary/20 border-primary/50'
                    : day.isToday
                    ? 'bg-yellow-500/20 border-yellow-500/50'
                    : 'bg-slate-700/50 border-slate-600/50'
                }`}>
                  {day.hasData ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : day.isToday ? (
                    <Clock className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(day.date).getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            {weeklyConsistency === 100 ? (
              <p className="text-primary font-semibold">
                Perfekt uke! Du har logget data hver dag! 🎉
              </p>
            ) : weeklyConsistency >= 80 ? (
              <p className="text-green-400 font-semibold">
                Flott konsistens! Fortsett slik!
              </p>
            ) : (
              <p className="text-yellow-400 font-semibold">
                Prøv å logge data mer regelmessig for bedre resultater
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}