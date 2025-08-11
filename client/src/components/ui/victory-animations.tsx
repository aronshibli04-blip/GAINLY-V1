import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { 
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface VictoryState {
  type: 'first_kg' | 'weekly_goal' | 'streak_milestone' | 'consistency' | null;
  message: string;
  icon: any;
  color: string;
}

export function VictoryAnimations() {
  const { weightEntries, calorieEntries } = useUserStore();
  const [victory, setVictory] = useState<VictoryState | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Check for victories
    const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
    const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
    const totalGain = currentWeight - startWeight;
    
    const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
    const weeklyGain = totalDays >= 7 ? (totalGain / totalDays) * 7 : 0;

    // Check for first kilogram
    if (totalGain >= 1.0 && !localStorage.getItem('victory_first_kg')) {
      setVictory({
        type: 'first_kg',
        message: 'Gratulerer! Du har gått opp din første kilo! 🎉',
        icon: Trophy,
        color: 'from-yellow-400 to-orange-500'
      });
      localStorage.setItem('victory_first_kg', 'true');
      setShowAnimation(true);
    }
    // Check for weekly goal achievement
    else if (weeklyGain >= 1.0 && !localStorage.getItem('victory_weekly_goal')) {
      setVictory({
        type: 'weekly_goal',
        message: 'Fantastisk! Du nådde målet på 1kg per uke! 🔥',
        icon: Target,
        color: 'from-green-400 to-emerald-500'
      });
      localStorage.setItem('victory_weekly_goal', 'true');
      setShowAnimation(true);
    }
    // Check for consistency milestone
    else if (totalDays >= 14 && !localStorage.getItem('victory_consistency')) {
      setVictory({
        type: 'consistency',
        message: 'Utrolig! 2 uker med konsekvent tracking! 💪',
        icon: Crown,
        color: 'from-purple-400 to-pink-500'
      });
      localStorage.setItem('victory_consistency', 'true');
      setShowAnimation(true);
    }

  }, [weightEntries, calorieEntries]);

  useEffect(() => {
    if (showAnimation && victory) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setTimeout(() => setVictory(null), 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, victory]);

  if (!victory || !showAnimation) return null;

  const IconComponent = victory.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      {/* Confetti-like sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
        ))}
      </div>

      {/* Victory Card */}
      <Card className={`max-w-md mx-4 border-2 animate-in zoom-in duration-700 bg-gradient-to-br ${victory.color} p-1`}>
        <div className="bg-slate-900 rounded-lg m-1">
          <CardContent className="p-8 text-center">
            {/* Animated Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-yellow-400 animate-spin" 
                   style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                <IconComponent className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>

            {/* Victory Message */}
            <h2 className="text-2xl font-black text-white mb-4">
              SEIER!
            </h2>
            
            <p className="text-lg text-primary/90 mb-6 font-semibold">
              {victory.message}
            </p>

            {/* Success Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                  Fremgang
                </div>
                <p className="text-sm text-muted-foreground">Oppnådd</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  <Star className="h-6 w-6 mx-auto mb-1" />
                  Belønning
                </div>
                <p className="text-sm text-muted-foreground">Låst opp</p>
              </div>
            </div>

            {/* Continue Button */}
            <Button 
              onClick={() => {
                setShowAnimation(false);
                setTimeout(() => setVictory(null), 500);
              }}
              className="bg-primary text-black hover:bg-primary/90 font-bold px-8"
              size="lg"
            >
              Fortsett reisen! 🚀
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}