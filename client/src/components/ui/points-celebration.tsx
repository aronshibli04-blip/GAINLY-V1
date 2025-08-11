import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { 
  Trophy, 
  Star, 
  Sparkles,
  Crown,
  Medal,
  Award
} from "lucide-react";

interface CelebrationEvent {
  type: 'points' | 'level_up' | 'milestone' | 'achievement';
  points?: number;
  level?: number;
  levelName?: string;
  message: string;
  icon: any;
  color: string;
}

export function PointsCelebration() {
  const { weightEntries, calorieEntries, user } = useUserStore();
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [lastCheckedPoints, setLastCheckedPoints] = useState(0);

  useEffect(() => {
    const calculateCurrentPoints = () => {
      const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
      const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user?.weight || 0;
      const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user?.weight || 0;
      const totalGain = currentWeight - startWeight;
      
      const points = (totalDays * 10) + Math.max(0, Math.floor(totalGain * 100));
      return points;
    };

    const currentPoints = calculateCurrentPoints();
    const pointsGained = currentPoints - lastCheckedPoints;
    
    if (pointsGained > 0 && lastCheckedPoints > 0) {
      // Show points celebration
      if (pointsGained >= 100) {
        setCelebration({
          type: 'points',
          points: pointsGained,
          message: `Fantastisk! Du fikk ${pointsGained} poeng!`,
          icon: Trophy,
          color: 'from-yellow-400 to-orange-500'
        });
      } else if (pointsGained >= 50) {
        setCelebration({
          type: 'points',
          points: pointsGained,
          message: `Bra jobbet! +${pointsGained} poeng!`,
          icon: Star,
          color: 'from-blue-400 to-purple-500'
        });
      }
      
      // Auto-hide after 3 seconds
      setTimeout(() => setCelebration(null), 3000);
    }
    
    setLastCheckedPoints(currentPoints);
  }, [weightEntries, calorieEntries, user, lastCheckedPoints]);

  if (!celebration) return null;

  const IconComponent = celebration.icon;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-500">
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random()}s`,
              animationDuration: '1.5s'
            }}
          >
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
        ))}
      </div>

      <Card className={`bg-gradient-to-r ${celebration.color} p-1 shadow-2xl`}>
        <div className="bg-slate-900/95 rounded-lg m-1">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-yellow-400 flex items-center justify-center animate-bounce">
              <IconComponent className="h-8 w-8 text-black" />
            </div>
            
            <div className="space-y-2">
              {celebration.points && (
                <div className="text-3xl font-black text-primary animate-pulse">
                  +{celebration.points} POENG!
                </div>
              )}
              
              <p className="text-white font-bold text-lg">
                {celebration.message}
              </p>
              
              {celebration.level && (
                <div className="mt-3 p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <p className="text-primary font-bold">
                    Nivå {celebration.level}: {celebration.levelName}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}