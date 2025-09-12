import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/userStore";
import { 
  Trophy, 
  Star, 
  Crown, 
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  Medal,
  Gem,
  Shield
} from "lucide-react";

interface PointsBreakdown {
  dailyLogging: number;
  weightGain: number;
  consistency: number;
  milestones: number;
  bonus: number;
}

interface Level {
  level: number;
  name: string;
  minPoints: number;
  color: string;
  badge: any;
  perks: string[];
}

export function GamificationSystem() {
  const { user, weightEntries, calorieEntries } = useUserStore();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsBreakdown, setPointsBreakdown] = useState<PointsBreakdown>({
    dailyLogging: 0,
    weightGain: 0,
    consistency: 0,
    milestones: 0,
    bonus: 0
  });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showPointsAnimation, setShowPointsAnimation] = useState<number | null>(null);

  const levels: Level[] = [
    { level: 1, name: "Nybegynner", minPoints: 0, color: "text-gray-400", badge: Star, perks: ["Grunnleggende tracking"] },
    { level: 2, name: "Dedikert", minPoints: 100, color: "text-blue-400", badge: Shield, perks: ["Daglige tips", "Progress alerts"] },
    { level: 3, name: "Konsistent", minPoints: 300, color: "text-green-400", badge: Target, perks: ["Streak bonuser", "Ukentlige rapporter"] },
    { level: 4, name: "Målrettet", minPoints: 600, color: "text-purple-400", badge: Medal, perks: ["Custom goals", "Progress insights"] },
    { level: 5, name: "Ekspert", minPoints: 1000, color: "text-yellow-400", badge: Crown, perks: ["Advanced analytics", "Priority support"] },
    { level: 6, name: "Mester", minPoints: 1500, color: "text-orange-400", badge: Trophy, perks: ["Premium features", "Community access"] },
    { level: 7, name: "Legende", minPoints: 2500, color: "text-red-400", badge: Gem, perks: ["Exclusive content", "Beta features"] }
  ];

  // Calculate points based on user activity
  useEffect(() => {
    const calculatePoints = () => {
      const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
      const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user?.weight || 0;
      const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user?.weight || 0;
      const totalGain = currentWeight - startWeight;
      
      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const dates = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]);
      let currentStreak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        if (dates.has(dateString)) {
          currentStreak++;
        } else {
          break;
        }
      }

      const breakdown: PointsBreakdown = {
        // 10 points per day of logging
        dailyLogging: totalDays * 10,
        
        // 100 points per kg gained (minimum 0)
        weightGain: Math.max(0, Math.floor(totalGain * 100)),
        
        // Streak bonuses: 5 extra points per day after day 7
        consistency: currentStreak >= 7 ? (currentStreak - 6) * 5 : 0,
        
        // Milestone bonuses
        milestones: (
          (totalDays >= 7 ? 50 : 0) +    // Week milestone
          (totalDays >= 14 ? 75 : 0) +   // 2 weeks
          (totalDays >= 30 ? 150 : 0) +  // Month
          (totalGain >= 1 ? 100 : 0) +   // First kg
          (totalGain >= 3 ? 200 : 0) +   // 3kg milestone
          (totalGain >= 5 ? 300 : 0) +   // 5kg milestone
          (currentStreak >= 14 ? 100 : 0) // 2-week streak
        ),
        
        // Weekly goal bonuses
        bonus: totalDays >= 7 && (totalGain / totalDays) * 7 >= 1.0 ? 200 : 0
      };

      const total = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
      
      // Check for level up
      const newLevel = levels.findIndex(l => total < l.minPoints);
      const level = newLevel === -1 ? levels.length : newLevel;
      
      if (level > currentLevel) {
        // Level up tracked silently - no popup animation
      }
      
      setPointsBreakdown(breakdown);
      setTotalPoints(total);
      setCurrentLevel(level);
    };

    calculatePoints();
  }, [weightEntries, calorieEntries, user, currentLevel, totalPoints]);

  // Hide points animation after delay
  useEffect(() => {
    if (showPointsAnimation !== null) {
      const timer = setTimeout(() => setShowPointsAnimation(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPointsAnimation]);

  const getCurrentLevelInfo = () => {
    return levels[currentLevel - 1] || levels[0];
  };

  const getNextLevelInfo = () => {
    return levels[currentLevel] || null;
  };

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = getNextLevelInfo();
  const progressToNext = nextLevelInfo 
    ? ((totalPoints - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100
    : 100;

  const CurrentBadge = currentLevelInfo.badge;

  return (
    <div className="space-y-4">


      {/* Current Level & Progress */}
      <Card className={`bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 ${currentLevelInfo.color.replace('text-', 'border-')}/50`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-primary/30 to-orange-500/30 flex items-center justify-center`}>
                <CurrentBadge className={`h-8 w-8 ${currentLevelInfo.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{currentLevelInfo.name}</h2>
                <p className="text-sm text-muted-foreground">Nivå {currentLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary">{totalPoints.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total poeng</p>
            </div>
          </div>

          {nextLevelInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fremgang til {nextLevelInfo.name}</span>
                <span className="text-white font-semibold">
                  {Math.round(progressToNext)}% ({nextLevelInfo.minPoints - totalPoints} poeng igjen)
                </span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>
          )}

          {/* Current Level Perks */}
          <div className="mt-4 p-3 rounded-lg bg-black/20 border border-primary/20">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Dine fordeler
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentLevelInfo.perks.map((perk, index) => (
                <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  {perk}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <Card className="bg-slate-800/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Poeng Oversikt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-white">Daglig logging</span>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {pointsBreakdown.dailyLogging} poeng
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-white">Vektøkning</span>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                {pointsBreakdown.weightGain} poeng
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-white">Konsistens bonus</span>
              </div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                {pointsBreakdown.consistency} poeng
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-black/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-white">Milepæler</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                {pointsBreakdown.milestones} poeng
              </Badge>
            </div>

            {pointsBreakdown.bonus > 0 && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-white font-semibold">Ukentlig mål bonus</span>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {pointsBreakdown.bonus} poeng
                </Badge>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-black text-primary">
                {totalPoints.toLocaleString()} poeng
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progression */}
      <Card className="bg-slate-800/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-orange-400" />
            Nivå Oversikt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {levels.slice(0, Math.min(currentLevel + 2, levels.length)).map((level, index) => {
              const LevelBadge = level.badge;
              const isUnlocked = currentLevel >= level.level;
              const isCurrent = currentLevel === level.level;
              
              return (
                <div key={level.level} className={`flex items-center gap-3 p-3 rounded-lg ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-primary/20 to-orange-500/20 border border-primary/30' 
                    : isUnlocked 
                    ? 'bg-slate-700/50' 
                    : 'bg-slate-800/50 opacity-60'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isUnlocked ? 'bg-primary/30' : 'bg-slate-600/50'
                  }`}>
                    <LevelBadge className={`h-5 w-5 ${isUnlocked ? level.color : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {level.name}
                      </span>
                      {isCurrent && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          Nåværende
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {level.minPoints.toLocaleString()} poeng kreves
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}