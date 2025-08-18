import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  Target, 
  Trophy, 
  Flame,
  Plus,
  Zap,
  Sparkles,
  Calendar,
  TrendingUp
} from "lucide-react";

interface DailyRoutine {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  isCompleted?: boolean;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  todayProgress: number;
}

export default function MobileDailyRoutines() {
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    todayProgress: 0
  });
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showCompletionAnimation, setShowCompletionAnimation] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUserStore();

  // Load routines and stats
  useEffect(() => {
    loadRoutines();
    loadUserStats();
  }, [user?.id]);

  const loadRoutines = async () => {
    // For now, using hardcoded routines based on hardgainer focus
    const defaultRoutines: DailyRoutine[] = [
      {
        id: "1",
        title: "Drikk proteinshake",
        description: "Start dagen med 300+ kalorier fra proteinshake",
        points: 30,
        category: "nutrition"
      },
      {
        id: "2", 
        title: "Spis innen 1 time etter oppvåkning",
        description: "Få i deg kalorier tidlig for å kickstarte metabolismen",
        points: 25,
        category: "nutrition"
      },
      {
        id: "3",
        title: "Ta en 10-minutters gåtur",
        description: "Lett bevegelse for å øke appetitten",
        points: 20,
        category: "fitness"
      },
      {
        id: "4",
        title: "Drikk 2 glass vann",
        description: "Hydrering for bedre næringsstoffopptak",
        points: 15,
        category: "health"
      },
      {
        id: "5",
        title: "Redd sengen",
        description: "Start dagen med en seier - bygg gode vaner",
        points: 10,
        category: "productivity"
      },
      {
        id: "6",
        title: "60 min uten skjermtid",
        description: "Første time av dagen uten telefon/PC",
        points: 25,
        category: "mental"
      }
    ];
    setRoutines(defaultRoutines);
  };

  const loadUserStats = async () => {
    // Simulate loading user stats
    const stats = {
      totalPoints: 2450,
      currentStreak: 7,
      longestStreak: 12,
      level: 3,
      todayProgress: 0
    };
    setUserStats(stats);
  };

  const completeRoutine = async (routineId: string) => {
    if (completedToday.has(routineId)) return;

    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    // Add to completed set
    const newCompleted = new Set(completedToday);
    newCompleted.add(routineId);
    setCompletedToday(newCompleted);

    // Show satisfying animation
    setShowCompletionAnimation(routineId);
    setTimeout(() => setShowCompletionAnimation(null), 1500);

    // Update stats
    const newTotalPoints = userStats.totalPoints + routine.points;
    const newTodayProgress = (newCompleted.size / routines.length) * 100;
    
    setUserStats(prev => ({
      ...prev,
      totalPoints: newTotalPoints,
      todayProgress: newTodayProgress
    }));

    // Show toast with points earned
    toast({
      title: "Bra jobbet! 🎉",
      description: `Du fikk ${routine.points} poeng! Total: ${newTotalPoints}`,
    });

    // Check for streak bonus
    if (newCompleted.size === routines.length) {
      setTimeout(() => {
        toast({
          title: "Perfekt dag! 🔥",
          description: `Alle rutiner fullført! Bonus: +50 poeng`,
        });
      }, 1000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return '🥤';
      case 'fitness': return '🏃‍♂️';
      case 'health': return '💧';
      case 'productivity': return '🛏️';
      case 'mental': return '🧠';
      default: return '⭐';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'bg-orange-400/20 border-orange-400/40';
      case 'fitness': return 'bg-green-400/20 border-green-400/40';
      case 'health': return 'bg-blue-400/20 border-blue-400/40';
      case 'productivity': return 'bg-purple-400/20 border-purple-400/40';
      case 'mental': return 'bg-pink-400/20 border-pink-400/40';
      default: return 'bg-gray-400/20 border-gray-400/40';
    }
  };

  const getLevel = (points: number) => Math.floor(points / 1000) + 1;
  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getLevel(points);
    return (currentLevel * 1000) - points;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-300/40 rounded-full animate-bounce" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-ping" />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 p-4 space-y-6">
        {/* Header with animated icon */}
        <div className="text-center space-y-4">
          <motion.div
            className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse opacity-50" />
            <Target className="h-8 w-8 text-white relative z-10" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-yellow-800" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Daglige Rutiner</h1>
          <p className="text-blue-200">Bygg vaner som fører til resultater</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 border-blue-400/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-blue-400/10 rounded-bl-2xl" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-blue-200">Nivå</p>
                  <p className="text-xl font-bold text-white">{userStats.level}</p>
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={(userStats.totalPoints % 1000) / 10} 
                  className="h-1"
                />
                <p className="text-xs text-blue-300 mt-1">
                  {getPointsToNextLevel(userStats.totalPoints)} til neste nivå
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400/10 to-red-400/10 border-orange-400/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-orange-400/10 rounded-bl-2xl" />
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-orange-200">Streak</p>
                  <p className="text-xl font-bold text-white">{userStats.currentStreak} dager</p>
                </div>
              </div>
              <p className="text-xs text-orange-300 mt-1">
                Rekord: {userStats.longestStreak} dager
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Progress */}
        <Card className="bg-gradient-to-br from-green-400/10 to-blue-400/10 border-green-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-400" />
              Dagens Fremgang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Fullført: {completedToday.size}/{routines.length}</span>
                <span className="text-green-200">{Math.round(userStats.todayProgress)}%</span>
              </div>
              <Progress value={userStats.todayProgress} className="h-2" />
              <div className="flex justify-between text-xs text-green-300">
                <span>Poeng i dag: {Array.from(completedToday).reduce((sum, id) => {
                  const routine = routines.find(r => r.id === id);
                  return sum + (routine?.points || 0);
                }, 0)}</span>
                <span>{routines.length - completedToday.size} gjenstår</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routines List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-blue-400" />
            Dagens Mål
          </h2>
          
          <AnimatePresence>
            {routines.map((routine) => {
              const isCompleted = completedToday.has(routine.id);
              const isAnimating = showCompletionAnimation === routine.id;
              
              return (
                <motion.div
                  key={routine.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`${getCategoryColor(routine.category)} relative overflow-hidden transition-all duration-300 ${
                    isCompleted ? 'opacity-75 scale-98' : 'hover:scale-102'
                  }`}>
                    {/* Completion Animation Overlay */}
                    <AnimatePresence>
                      {isAnimating && (
                        <motion.div
                          className="absolute inset-0 bg-green-400/20 z-10 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 360, 0]
                            }}
                            transition={{ duration: 0.6 }}
                          >
                            <CheckCircle2 className="h-12 w-12 text-green-400" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Button
                          onClick={() => completeRoutine(routine.id)}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          disabled={isCompleted}
                          data-testid={`complete-routine-${routine.id}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                          ) : (
                            <Circle className="h-6 w-6 text-blue-300 hover:text-blue-400" />
                          )}
                        </Button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-medium ${
                                isCompleted ? 'line-through text-white/60' : 'text-white'
                              }`}>
                                <span className="mr-2">{getCategoryIcon(routine.category)}</span>
                                {routine.title}
                              </h3>
                              <p className={`text-sm mt-1 ${
                                isCompleted ? 'text-blue-300/60' : 'text-blue-200'
                              }`}>
                                {routine.description}
                              </p>
                            </div>
                            
                            <Badge 
                              variant="secondary" 
                              className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 flex items-center gap-1"
                            >
                              <Zap className="h-3 w-3" />
                              +{routine.points}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-purple-400/10 to-pink-400/10 border-purple-400/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-purple-400" />
              AI-Rutiner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-purple-200 text-sm">
              Vil du ha personlige rutiner basert på dine mål og framgang?
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
              data-testid="generate-custom-routines"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generer Custom Rutiner
            </Button>
          </CardContent>
        </Card>

        {/* Daily Streak Motivation */}
        {userStats.currentStreak > 0 && (
          <Card className="bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border-yellow-400/20">
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-yellow-200 text-sm">
                Du er på fyr! 🔥 Hold streaken gående i morgen!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}