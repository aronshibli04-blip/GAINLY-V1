import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/ui/bottom-nav";
import { WeightLogger } from "@/components/ui/weight-logger";
import { TdeeAnalysisCard } from "@/components/ui/tdee-analysis-card";
import { WeightChart } from "@/components/ui/weight-chart";
import { WeeklyWeightAnalysis } from "@/components/ui/weekly-weight-analysis";
import { MotivationCard } from "@/components/ui/motivation-card";
import { MicroGoalsOverview } from "@/components/ui/micro-goals-overview";
import { AchievementSystem } from "@/components/ui/achievement-system";

import { ProgressStreaks } from "@/components/ui/progress-streaks";
import { PowerUpSystem } from "@/components/ui/power-up-system";
import { GamificationSystem } from "@/components/ui/gamification-system";
import { DailyChallenges } from "@/components/ui/daily-challenges";

import { useUserStore } from "@/store/userStore";
import { Zap, TrendingUp, Target, Activity, RotateCcw, Ruler, CheckCircle2, Plus, Flame, Trophy, Star } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { DailyRoutine, DailyRoutineCompletion } from "@shared/schema";
import { SmartNotifications } from "@/components/ui/smart-notifications";
import { AggressiveSurplusTracker } from "@/components/ui/aggressive-surplus-tracker";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { clearOldTestData, isTestData } from "@/utils/clearOldTestData";

// Level Progress Card Component
function LevelProgressCard() {
  const userId = localStorage.getItem("userId") || "user1";
  
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: () => fetch(`/api/user-stats/${userId}`).then(res => res.json())
  });

  if (!userStats) return null;

  const level = userStats.level || 1;
  const currentXP = userStats.totalPoints || 0;
  const xpForNextLevel = level * 100; // 100 XP per level
  const xpProgress = currentXP % 100; // Progress within current level
  const progressPercent = (xpProgress / 100) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-400/30 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="text-white font-semibold">Level {level}</span>
          </div>
          <div className="text-purple-300 text-sm font-medium">
            {currentXP} XP
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-purple-300/70">
            <span>{xpProgress} / 100 XP</span>
            <span>Next Level</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-purple-900/50"
          />
        </div>
        
        {currentXP > 0 && (
          <p className="text-xs text-purple-300/70 mt-2">
            🎯 Keep completing routines to level up!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Celebration Particles Component
function CelebrationParticles({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  if (!show) return null;

  // Auto-hide after 2 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="relative">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-particle-float"
            style={{
              top: Math.random() * 200 - 100,
              left: Math.random() * 200 - 100,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
        <div className="text-4xl animate-bounce">
          🎉
        </div>
      </div>
    </div>
  );
}

// Daily Routines Quick Checker Component
function DailyRoutinesQuickChecker() {
  const userId = localStorage.getItem("userId") || "user1";
  const today = new Date().toISOString().split('T')[0];
  const [showCelebration, setShowCelebration] = useState(false);
  const [completingRoutineId, setCompletingRoutineId] = useState<string | null>(null);
  const [displayedRoutines, setDisplayedRoutines] = useState<DailyRoutine[]>([]);
  const [routineSlideKey, setRoutineSlideKey] = useState(0);

  // Fetch user routines (limit to 4 for home page)
  const { data: routines = [], isLoading: routinesLoading } = useQuery<DailyRoutine[]>({
    queryKey: ['/api/daily-routines', userId],
    queryFn: () => fetch(`/api/daily-routines/${userId}`).then(res => res.json())
  });

  // Fetch today's completions
  const { data: completions = [], isLoading: completionsLoading } = useQuery<DailyRoutineCompletion[]>({
    queryKey: ['/api/daily-routine-completions', userId, today],
    queryFn: () => fetch(`/api/daily-routine-completions/${userId}/${today}`).then(res => res.json())
  });

  // Complete routine mutation
  const completeRoutineMutation = useMutation({
    mutationFn: async ({ routineId, points }: { routineId: string; points: number }) => {
      const response = await fetch('/api/daily-routine-completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          routineId,
          pointsEarned: points,
          completedAt: new Date().toISOString(),
          completedDate: new Date().toISOString().split('T')[0]
        })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routine-completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      
      // Enhanced celebration effect with emojis and points
      const routine = routines.find(r => r.id === variables.routineId);
      const categoryEmojis = {
        health: "❤️💪",
        fitness: "🏋️‍♂️💪", 
        nutrition: "🍎🥗",
        productivity: "🧠⚡"
      };
      
      const celebrationEmojis = ["🎉", "✨", "🌟", "🎯", "🚀"];
      const randomEmoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
      const categoryEmoji = categoryEmojis[routine?.category as keyof typeof categoryEmojis] || "✨";
      
      // Get updated stats to show level progress
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      
      toast({
        title: `${randomEmoji} Routine Completed! +${variables.points} XP`,
        description: `${categoryEmoji} Great job staying consistent with your habits!`,
        duration: 4000,
      });
      
      // Show level progress after a delay
      setTimeout(() => {
        const levelUpMessages = [
          "⚡ XP gained! Check your level progress below!",
          "🎯 Points added to your experience!",
          "🚀 Getting closer to the next level!",
          "💪 Building your fitness journey!"
        ];
        const randomMessage = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
        
        toast({
          description: randomMessage,
          duration: 3000,
        });
      }, 1500);
    }
  });

  const toggleCompletion = (routine: DailyRoutine, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const isCompleted = completions.some(c => c.routineId === routine.id);
    
    if (!isCompleted && !completeRoutineMutation.isPending) {
      setCompletingRoutineId(routine.id);
      
      // Add immediate visual feedback with satisfying animations
      const element = event.currentTarget as HTMLElement;
      element.style.transform = 'scale(0.95)';
      element.style.transition = 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      // Trigger particle celebration
      setShowCelebration(true);
      
      setTimeout(() => {
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
          element.style.transform = '';
          setCompletingRoutineId(null);
        }, 200);
      }, 150);
      
      completeRoutineMutation.mutate({ 
        routineId: routine.id, 
        points: routine.points 
      });
    }
  };

  const categoryIcons = {
    health: "❤️",
    fitness: "💪", 
    nutrition: "🍎",
    productivity: "🧠"
  } as const;

  const categoryColors = {
    health: "from-red-500/20 to-pink-500/20 border-red-400/30",
    fitness: "from-blue-500/20 to-purple-500/20 border-blue-400/30",
    nutrition: "from-green-500/20 to-emerald-500/20 border-green-400/30", 
    productivity: "from-yellow-500/20 to-orange-500/20 border-yellow-400/30"
  } as const;

  if (routinesLoading || completionsLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Daily Routines
        </h3>
        <div className="animate-pulse space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Smart routine display logic - show next uncompleted tasks
  useEffect(() => {
    if (routines.length > 0) {
      const completed = routines.filter(r => completions.some(c => c.routineId === r.id));
      const uncompleted = routines.filter(r => !completions.some(c => c.routineId === r.id));
      
      // Show mix of completed and uncompleted, prioritizing uncompleted
      const newDisplayed = [
        ...completed.slice(0, 2), // Show up to 2 completed for satisfaction
        ...uncompleted.slice(0, 4 - Math.min(completed.length, 2)) // Fill rest with uncompleted
      ].slice(0, 4);
      
      // Trigger animation when routine list changes
      if (JSON.stringify(newDisplayed) !== JSON.stringify(displayedRoutines)) {
        setRoutineSlideKey(prev => prev + 1);
        setDisplayedRoutines(newDisplayed);
      }
    }
  }, [routines, completions, displayedRoutines]);

  const completedCount = displayedRoutines.filter(r => completions.some(c => c.routineId === r.id)).length;

  return (
    <>
      <CelebrationParticles 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Daily Routines
          {displayedRoutines.length > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs animate-pulse">
              {completedCount}/{displayedRoutines.length}
            </Badge>
          )}
        </h3>
        {routines.length > 4 && (
          <Link href="/daily-routines">
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 h-8 px-2">
              View All
            </Button>
          </Link>
        )}
      </div>

      {displayedRoutines.length === 0 ? (
        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-400/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="h-12 w-12 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-emerald-300/70 text-sm mb-3">No routines yet!</p>
            <Link href="/daily-routines">
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">
                <Plus className="h-4 w-4 mr-1" />
                Create Routines
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div key={routineSlideKey} className="space-y-2">
          {displayedRoutines.map((routine, index) => {
            const isCompleted = completions.some(c => c.routineId === routine.id);
            const categoryColor = categoryColors[routine.category as keyof typeof categoryColors];
            const categoryIcon = categoryIcons[routine.category as keyof typeof categoryIcons];
            
            return (
              <Card
                key={routine.id}
                className={`bg-gradient-to-br ${categoryColor} backdrop-blur-sm transition-all duration-300 animate-routine-slide-in ${isCompleted ? 'ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-400/20' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg cursor-pointer'} ${completeRoutineMutation.isPending ? 'animate-pulse' : ''}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={(e) => toggleCompletion(routine, e)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-lg">{categoryIcon}</div>
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>
                          {routine.title}
                        </h4>
                        <p className="text-xs text-slate-400">+{routine.points} points</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-emerald-400 animate-fadeIn">
                          <Star className="h-4 w-4 fill-current animate-pulse" />
                          <span className="text-xs font-semibold">Done!</span>
                        </div>
                      )}
                      {completingRoutineId === routine.id && !isCompleted && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Zap className="h-4 w-4 animate-bounce" />
                          <span className="text-xs font-semibold">Completing...</span>
                        </div>
                      )}
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' 
                          : `border-gray-400 hover:border-emerald-400 hover:shadow-md ${completingRoutineId === routine.id ? 'animate-spin' : ''}`
                      }`}>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-white animate-bounce" />
                        )}
                        {completingRoutineId === routine.id && !isCompleted && (
                          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {completedCount === displayedRoutines.length && displayedRoutines.length > 0 && (
            <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/50 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Trophy className="h-5 w-5" />
                  <span className="text-sm font-semibold">All routines completed! 🎉</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Level Progress Indicator */}
          <LevelProgressCard />
        </div>
      )}
      </div>
    </>
  );
}

export default function MobileHome() {
  const { 
    weightEntries, 
    calorieEntries, 
    activityEntries, 
    currentPhase,
    user,
    clearUserData
  } = useUserStore();
  
  const { openMenu } = useMenu();

  // Clear old test data on component mount
  useEffect(() => {
    // Clear old test data if detected
    if (isTestData()) {
      console.warn('Detected test data from August - clearing for fresh start');
      clearOldTestData().then(() => {
        clearUserData();
        window.location.reload();
      });
    }
  }, []);

  // Redirect to calibration mode if user hasn't completed calibration
  useEffect(() => {
    if (user && !user.hasCompletedCalibration) {
      window.location.href = '/calibration';
    }
  }, [user]);

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayWeight = weightEntries.find(w => w.date === today);
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);

  // Calculate progress
  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );
  
  const progressPercent = Math.min((totalDays / 7) * 100, 100);

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'onboarding':
        return {
          title: "Neural Network Initialization",
          subtitle: "Activating AI systems for metabolic analysis",
          color: "grok-gradient",
          progress: 25
        };
      case 'calibration':
        return {
          title: "Neural Calibration Active",
          subtitle: `Day ${totalDays}/7 - AI systems analyzing metabolic patterns`,
          color: "grok-gradient animate-pulse",
          progress: progressPercent
        };
      case 'meal_planning':
        return {
          title: "Profile Active",
          subtitle: "TDEE continuously updated with each data point",
          color: "bg-green-500",
          progress: 100
        };
      case 'tracking':
        return {
          title: "Profile Active",
          subtitle: "TDEE adapting in real time to your progress",
          color: "bg-purple-500",
          progress: 100
        };
      default:
        return {
          title: "Getting Started",
          subtitle: "Welcome to GAINLY",
          color: "bg-gray-500",
          progress: 0
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/10 to-slate-950 text-white pb-24 relative overflow-hidden">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Dashboard" 
        onOpenMenu={openMenu}
      />

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Larger floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        {/* Smaller particles */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-1 h-1 bg-emerald-300/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6 space-y-6 pb-28">

        {/* Enhanced Header with GAINLY branding */}
        <div className="text-center mb-8 relative">
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent" 
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))' 
                  }}>
              GAINLY
            </span>
          </h1>
          <p className="text-emerald-400/80 text-lg font-medium tracking-wide">Your AI-powered bulk companion</p>
        </div>

        {/* Aggressive 1kg/Week Surplus Tracker */}
        <AggressiveSurplusTracker />

        {/* Enhanced Phase Status */}
        <div className="flex items-center justify-center space-x-4 py-4 px-6 bg-gradient-to-r from-slate-800/40 via-slate-700/40 to-slate-800/40 rounded-2xl border border-emerald-400/30 mb-8 backdrop-blur-sm" 
             style={{ 
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
             }}>
          <div className={`w-4 h-4 rounded-full ${phaseInfo.color.includes('grok-gradient') ? 'bg-gradient-to-r from-emerald-400 to-green-400' : phaseInfo.color} ${phaseInfo.color.includes('animate-pulse') ? 'animate-pulse' : ''}`} 
               style={phaseInfo.color.includes('grok-gradient') ? { 
                 boxShadow: '0 0 16px hsla(147, 100%, 45%, 0.8), 0 0 32px hsla(147, 100%, 45%, 0.4)' 
               } : {}} />
          <p className="text-sm font-semibold text-emerald-300 tracking-wide">{phaseInfo.subtitle}</p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 backdrop-blur-sm" 
                style={{ 
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                }}>
            <CardContent className="p-5 text-center">
              <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-emerald-400/20">
                <TrendingUp className="h-6 w-6 text-emerald-400 drop-shadow-lg" />
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Today's Weight</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">
                {todayWeight ? `${todayWeight.weight}kg` : "Not logged"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-orange-400/30 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-sm" 
                style={{ 
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                }}>
            <CardContent className="p-5 text-center">
              <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-orange-400/20">
                <Zap className="h-6 w-6 text-orange-400 drop-shadow-lg" />
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Today's Calories</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">
                {todayCalories > 0 ? `${todayCalories.toLocaleString()}` : "Not logged"}
              </p>
              {todayCalories > 0 && (
                <p className="text-xs text-orange-400 font-bold mt-2 tracking-wide">
                  +{(todayCalories - 2400).toLocaleString()} surplus
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Action Cards */}
        <div className="grid grid-cols-2 gap-6">
          <Link href="/progress">
            <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer backdrop-blur-sm" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              <CardContent className="p-5 text-center">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-cyan-400/20">
                  <Activity className="h-6 w-6 text-cyan-400 drop-shadow-lg" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Advanced</p>
                <p className="text-sm font-bold text-white tracking-tight">Progress</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/measurements">
            <Card className="bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer backdrop-blur-sm" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              <CardContent className="p-5 text-center">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-purple-400/20">
                  <Ruler className="h-6 w-6 text-purple-400 drop-shadow-lg" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase">Body</p>
                <p className="text-sm font-bold text-white tracking-tight">Measurements</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Daily Routines Quick Checker */}
        <DailyRoutinesQuickChecker />

        {/* Enhanced Micro Goals Overview */}
        <div className="space-y-5">
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="relative">
              <Target className="h-6 w-6 text-emerald-400 drop-shadow-lg" />
              <div className="absolute inset-0 animate-ping">
                <Target className="h-6 w-6 text-emerald-400/40" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              Next Milestone
            </span>
          </h3>
          <MicroGoalsOverview />
        </div>

        {/* Weight Logging Section - Only show if not logged today */}
        {!todayWeight && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Log Weight</h3>
            <WeightLogger />
          </div>
        )}

        {/* Weight Progress Chart - Keep this for quick overview */}
        {weightEntries.length >= 3 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
            <WeightChart />
          </div>
        )}







        {/* Recent Activity */}
        {totalDays > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600/40">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Tracking Days</span>
                  <Badge variant="secondary">{totalDays} days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Data Quality</span>
                  <Badge 
                    variant={totalDays >= 7 ? "default" : "outline"}
                    className={totalDays >= 7 ? "bg-gradient-to-r from-emerald-400 to-green-400 text-black" : ""}
                  >
                    {totalDays >= 7 ? "Ready for AI" : "Building..."}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Development Reset Button */}
        <div className="space-y-3 border-t border-slate-700/50 pt-4">
          <Button
            onClick={() => {
              if (confirm('Reset all data and start fresh? This cannot be undone.')) {
                clearUserData();
                localStorage.clear();
                window.location.reload();
              }
            }}
            variant="outline"
            className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset App (Start Fresh)
          </Button>
        </div>

      </div>



      <BottomNav />
    </div>
  );
}