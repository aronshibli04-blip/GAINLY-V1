import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap, 
  Crown, 
  Star,
  Flame,
  Award,
  Calendar,
  Timer
} from "lucide-react";

interface MotivationalQuote {
  text: string;
  author: string;
  category: 'strength' | 'progress' | 'mindset' | 'dedication';
}

const motivationalQuotes: MotivationalQuote[] = [
  { text: "Styrke kommer ikke fra det du kan gjøre. Den kommer fra å overvinne det du trodde du ikke kunne.", author: "Rikki Rogers", category: "strength" },
  { text: "Framgang er umulig uten forandring, og de som ikke kan forandre tankene sine kan ikke forandre noe.", author: "George Bernard Shaw", category: "progress" },
  { text: "Det er ikke størrelsen på en mann som gjør forskjellen. Det er størrelsen på hans hjerte og vilje.", author: "Clive Staples Lewis", category: "mindset" },
  { text: "Champions blir ikke laget i gymsalene. Champions blir laget av noe dypt inne i dem - en lengsel, en drøm, en visjon.", author: "Muhammad Ali", category: "dedication" },
  { text: "Du blir ikke det du ønsker, du blir det du tror du fortjener.", author: "Unknown", category: "mindset" },
  { text: "Hver ekspert var en gang en begynner. Hver proff var en gang en amatør.", author: "Robin Sharma", category: "progress" },
  { text: "Suksess er summen av små anstrengelser, gjentatt dag ut og dag inn.", author: "Robert Collier", category: "dedication" },
  { text: "Kroppen din kan gjøre det. Det er sinnet ditt du må overbevise.", author: "Unknown", category: "strength" }
];

const achievements = [
  { id: 'first_week', title: 'Første Uke', description: 'Fullførte din første uke med vektlogging', icon: Calendar, color: 'bg-blue-500' },
  { id: 'consistency_7', title: 'Konsistent', description: '7 dager på rad med logging', icon: Flame, color: 'bg-orange-500' },
  { id: 'first_kg', title: 'Første Kilo', description: 'Gikk opp din første kilo!', icon: Trophy, color: 'bg-yellow-500' },
  { id: 'goal_crusher', title: 'Målknuser', description: 'Nådde ukentlig mål på 1kg+', icon: Target, color: 'bg-green-500' },
  { id: 'dedication', title: 'Dedikasjon', description: '30 dager med konsekvent tracking', icon: Crown, color: 'bg-purple-500' },
  { id: 'strength_gains', title: 'Styrkefremgang', description: 'Økte vekten i treningen', icon: Zap, color: 'bg-red-500' }
];

export function MotivationBoost() {
  const { user, weightEntries, calorieEntries } = useUserStore();
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(motivationalQuotes[0]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate progress metrics
  const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user?.weight || 0;
  const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user?.weight || 0;
  const totalGain = currentWeight - startWeight;
  const weeklyGain = totalDays >= 7 ? (totalGain / totalDays) * 7 : 0;

  // Check for new achievements
  useEffect(() => {
    const newAchievements: string[] = [];
    
    if (totalDays >= 7 && !unlockedAchievements.includes('first_week')) {
      newAchievements.push('first_week');
    }
    
    if (totalDays >= 7 && !unlockedAchievements.includes('consistency_7')) {
      newAchievements.push('consistency_7');
    }
    
    if (totalGain >= 1.0 && !unlockedAchievements.includes('first_kg')) {
      newAchievements.push('first_kg');
    }
    
    if (weeklyGain >= 1.0 && !unlockedAchievements.includes('goal_crusher')) {
      newAchievements.push('goal_crusher');
    }
    
    if (totalDays >= 30 && !unlockedAchievements.includes('dedication')) {
      newAchievements.push('dedication');
    }

    if (newAchievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newAchievements]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [totalDays, totalGain, weeklyGain, unlockedAchievements]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-sm mx-4 border-2 border-primary animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-yellow-400 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Nytt Achievement!</h3>
              <p className="text-white">Du låser opp flere badges!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Motivation Card */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Din Fremgang</h3>
              <p className="text-primary/80 text-sm">Hver dag teller!</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Dag {totalDays}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-primary mb-1">
                +{totalGain.toFixed(1)}kg
              </div>
              <p className="text-xs text-muted-foreground">Total Økning</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400 mb-1">
                {weeklyGain.toFixed(1)}kg
              </div>
              <p className="text-xs text-muted-foreground">Per Uke</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400 mb-1">
                {Math.round((totalGain / Math.max(1, totalDays)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Daglig Rate</p>
            </div>
          </div>

          {/* Progress Status */}
          <div className="mt-4 p-3 rounded-lg bg-black/20 border border-primary/20">
            {weeklyGain >= 1.0 ? (
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Fantastisk! Du treffer målet ditt!</span>
              </div>
            ) : weeklyGain >= 0.5 ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <Target className="h-4 w-4" />
                <span className="font-semibold">Bra fremgang! Øk litt mer kaloriinntaket.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-primary">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">Tid for å øke intensiteten!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Quote */}
      <Card className="bg-slate-800/50 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Dagens Motivasjon</h3>
              <blockquote className="text-primary/90 italic mb-2">
                "{currentQuote.text}"
              </blockquote>
              <p className="text-xs text-muted-foreground">— {currentQuote.author}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      {unlockedAchievements.length > 0 && (
        <Card className="bg-slate-800/50 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Dine Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements
                .filter(achievement => unlockedAchievements.includes(achievement.id))
                .map(achievement => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-primary/20">
                      <div className={`w-8 h-8 rounded-full ${achievement.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
              <Timer className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Ukens Utfordring</h3>
              <p className="text-purple-300/80 text-sm">Spesiell belønning ved fullføring</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
              <span className="text-white">Logg vekt hver dag</span>
              <Badge variant={totalDays >= 7 ? "default" : "outline"} className="bg-purple-500/20 text-purple-300">
                {Math.min(totalDays, 7)}/7
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
              <span className="text-white">Øk med 1kg denne uken</span>
              <Badge variant={weeklyGain >= 1.0 ? "default" : "outline"} className="bg-purple-500/20 text-purple-300">
                {weeklyGain >= 1.0 ? "✓" : `${(weeklyGain * 100).toFixed(0)}%`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}