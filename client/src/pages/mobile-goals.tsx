import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Gift, Star, Zap, Crown, Heart, Coffee, Camera, ShoppingBag, Gamepad2 } from "lucide-react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { useUserStore } from "@/store/userStore";

export function MobileGoals() {
  const { openMenu } = useMenu();
  const { user, weightEntries } = useUserStore();
  
  // Get current weight from latest entry
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : 70;
    
  const targetWeight = user?.goalWeight || 85;

  // Micro goals with Norwegian rewards
  const microGoals = [
    {
      weight: 72,
      reward: "Flytende Kalk",
      icon: <Star className="h-4 w-4" />,
      description: "Calcium boost for stronger bones",
      completed: currentWeight >= 72
    },
    {
      weight: 74,
      reward: "Selfie stick m Bluetooth",
      icon: <Camera className="h-4 w-4" />,
      description: "Document your progress in style",
      completed: currentWeight >= 74
    },
    {
      weight: 76,
      reward: "Full body massage",
      icon: <Heart className="h-4 w-4" />,
      description: "Relax those growing muscles",
      completed: currentWeight >= 76
    },
    {
      weight: 78,
      reward: "Middag eller noe m venner",
      icon: <Coffee className="h-4 w-4" />,
      description: "Celebrate with friends",
      completed: currentWeight >= 78
    },
    {
      weight: 80,
      reward: "Progresjons-fotoshoot",
      icon: <Camera className="h-4 w-4" />,
      description: "Professional progress photos",
      completed: currentWeight >= 80
    },
    {
      weight: 82,
      reward: "Liten helgetur eller spesiell opplevelse",
      icon: <Gift className="h-4 w-4" />,
      description: "Weekend getaway reward",
      completed: currentWeight >= 82
    },
    {
      weight: 84,
      reward: "Kjøp noe du har ønsket deg lenge (f.eks. klokke)",
      icon: <ShoppingBag className="h-4 w-4" />,
      description: "That special purchase you've been wanting",
      completed: currentWeight >= 84
    },
    {
      weight: 85,
      reward: "Storslått feiring: helgetur, coaching-pakke el. Noe stort",
      icon: <Crown className="h-4 w-4" />,
      description: "Grand celebration for reaching your goal!",
      completed: currentWeight >= 85
    }
  ];

  const nextGoal = microGoals.find(goal => !goal.completed);
  const completedGoals = microGoals.filter(goal => goal.completed).length;
  const progressPercentage = (completedGoals / microGoals.length) * 100;
  const weightProgress = ((currentWeight - 70) / ((user?.goalWeight || 85) - 70)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Mikro mål" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin" 
                 style={{ animationDuration: '8s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-xl">
              <Target className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              MIKRO MÅL
            </span>
          </h1>
          <p className="text-blue-400/70">Mikro mål er trappetrinn mot destinasjonen.</p>
          <p className="text-blue-400/70 font-semibold">Mål: {targetWeight}KG</p>
        </div>

        {/* Current Progress Overview */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20 hover:border-blue-400/40 transition-colors mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Trophy className="h-5 w-5" />
              Fremgang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Vekt fremgang</span>
                  <span className="text-sm font-medium">{currentWeight}kg / {targetWeight}kg</span>
                </div>
                <Progress 
                  value={Math.min(weightProgress, 100)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Mål fullført</span>
                  <span className="text-sm font-medium">{completedGoals} / {microGoals.length}</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Goal Highlight */}
        {nextGoal && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-400/40 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Zap className="h-5 w-5" />
                Neste mål
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-400">{nextGoal.weight}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{nextGoal.reward}</div>
                    <div className="text-sm text-slate-400">{nextGoal.description}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {(nextGoal.weight - currentWeight).toFixed(1)}kg to go!
                    </div>
                  </div>
                </div>
                {nextGoal.icon}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">Vektmål & Belønning</h3>
          
          {microGoals.map((goal, index) => (
            <Card 
              key={goal.weight}
              className={`transition-all duration-300 ${
                goal.completed 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-400/40' 
                  : goal === nextGoal
                    ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-400/40'
                    : 'bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-slate-600/20'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      goal.completed 
                        ? 'bg-green-400/20 text-green-400' 
                        : goal === nextGoal
                          ? 'bg-blue-400/20 text-blue-400'
                          : 'bg-slate-600/20 text-slate-400'
                    }`}>
                      <span className="text-sm font-bold">{goal.weight}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        goal.completed ? 'text-green-400' : 'text-white'
                      }`}>
                        {goal.reward}
                      </div>
                      <div className="text-sm text-slate-400">{goal.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {goal.completed ? (
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/40">
                        <Trophy className="h-3 w-3 mr-1" />
                        Fullført
                      </Badge>
                    ) : goal === nextGoal ? (
                      <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/40">
                        <Target className="h-3 w-3 mr-1" />
                        Aktivt
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-600">
                        <Target className="h-3 w-3 mr-1" />
                        Venter
                      </Badge>
                    )}
                    
                    <div className={`${
                      goal.completed ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {goal.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-400">{completedGoals}</div>
              <div className="text-sm text-slate-400">Mål oppnådd</div>
            </div>
            <p className="text-slate-300 text-sm">
              {completedGoals === 0 && "Din reise starter nå! Første mål venter på deg."}
              {completedGoals > 0 && completedGoals < 4 && "Fantastisk start! Du er på rett vei."}
              {completedGoals >= 4 && completedGoals < 7 && "Utrolig fremgang! Du mestrer dette."}
              {completedGoals >= 7 && "Du er en legende! Målet er innen rekkevidde."}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}