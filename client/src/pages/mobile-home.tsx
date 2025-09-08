import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Zap, TrendingUp, Target, Activity, RotateCcw, Ruler, CheckCircle2, Plus, Flame, Trophy, Star, Settings, Sparkles, Edit, MoreVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { DailyRoutine, DailyRoutineCompletion } from "@shared/schema";
import { defaultRoutines } from "@/data/default-routines";
import { SmartNotifications } from "@/components/ui/smart-notifications";
import { AggressiveSurplusTracker } from "@/components/ui/aggressive-surplus-tracker";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { SleepQualityTracker } from "@/components/ui/sleep-quality-tracker";
import { StressLevelTracker } from "@/components/ui/stress-level-tracker";
import { clearOldTestData, isTestData } from "@/utils/clearOldTestData";

// Progressive leveling helper function
const getXPForLevel = (level: number) => {
  // Progressive: Level 1=100, Level 2=250, Level 3=450, Level 4=700, etc.
  // Formula: 25 * level * (level + 3)
  return 25 * level * (level + 3);
};

const getLevelFromXP = (xp: number) => {
  let level = 1;
  while (xp >= getXPForLevel(level)) {
    level++;
  }
  return level;
};

const getXPForCurrentLevel = (level: number) => {
  return level === 1 ? 0 : getXPForLevel(level - 1);
};

// Sleep Quality Tracker Component
function SleepQualityTrackerComponent() {
  const userId = localStorage.getItem("userId") || "user1";
  return <SleepQualityTracker userId={userId} />;
}

// Stress Level Tracker Component
function StressLevelTrackerComponent() {
  const userId = localStorage.getItem("userId") || "user1";
  return <StressLevelTracker userId={userId} />;
}

// Level Progress Card Component
function LevelProgressCard() {
  const userId = localStorage.getItem("userId") || "user1";
  
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: () => fetch(`/api/user-stats/${userId}`).then(res => res.json())
  });

  if (!userStats) return null;

  const currentXP = userStats.totalPoints || 0;
  const level = getLevelFromXP(currentXP);
  const xpForThisLevel = getXPForCurrentLevel(level);
  const xpForNextLevel = getXPForLevel(level);
  const xpProgress = currentXP - xpForThisLevel;
  const xpNeeded = xpForNextLevel - xpForThisLevel;
  const progressPercent = (xpProgress / xpNeeded) * 100;

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
            <span>{xpProgress} / {xpNeeded} XP</span>
            <span>Level {level + 1}</span>
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
  const handleComplete = useCallback(onComplete, [onComplete]);
  
  // Auto-hide after 2 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        handleComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, handleComplete]);

  if (!show) return null;

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuickSetupDialog, setShowQuickSetupDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<DailyRoutine | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<DailyRoutine | null>(null);
  const [showAllRoutines, setShowAllRoutines] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    description: "",
    category: "health" as "health" | "fitness" | "nutrition" | "productivity",
    points: 25
  });

  // Fetch user routines (limit to 4 for home page)
  const { data: routines = [], isLoading: routinesLoading } = useQuery<DailyRoutine[]>({
    queryKey: ['/api/daily-routines', userId],
    queryFn: () => fetch(`/api/daily-routines/${userId}`).then(res => res.json()),
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch today's completions
  const { data: completions = [], isLoading: completionsLoading } = useQuery<DailyRoutineCompletion[]>({
    queryKey: ['/api/daily-routine-completions', userId, today],
    queryFn: () => fetch(`/api/daily-routine-completions/${userId}/${today}`).then(res => res.json()),
    select: (data) => Array.isArray(data) ? data : []
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: async (routineData: typeof newRoutine & { userId: string }) => {
      const response = await fetch('/api/daily-routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routines'] });
      setShowCreateDialog(false);
      setNewRoutine({ title: "", description: "", category: "health", points: 25 });
      toast({
        title: "Success!",
        description: "New routine created successfully!"
      });
    }
  });

  // Edit routine mutation
  const editRoutineMutation = useMutation({
    mutationFn: async (routineData: { id: string } & Partial<typeof newRoutine>) => {
      const response = await fetch(`/api/daily-routines/${routineData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routines'] });
      setShowEditDialog(false);
      setEditingRoutine(null);
      toast({
        title: "Success!",
        description: "Routine updated successfully!"
      });
    }
  });

  // Delete routine mutation
  const deleteRoutineMutation = useMutation({
    mutationFn: async (routineId: string) => {
      const response = await fetch(`/api/daily-routines/${routineId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete routine');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routines'] });
      setShowDeleteAlert(false);
      setDeletingRoutine(null);
      toast({
        title: "Success!",
        description: "Routine deleted successfully!"
      });
    },
    onError: (error: Error) => {
      console.error('Delete routine error:', error);
      toast({
        title: "Error",
        description: "Failed to delete routine. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete all routines mutation
  const deleteAllRoutinesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/daily-routines/user/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete all routines');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear local state first
      setShowAllRoutines(false);
      setEditingRoutine(null);
      setDeletingRoutine(null);
      setDisplayedRoutines([]);
      
      // Then invalidate to refetch fresh data (empty arrays)
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routine-completions'] });
      
      setShowDeleteAllAlert(false);
      toast({
        title: "Success!",
        description: "All routines deleted successfully!"
      });
    },
    onError: (error: Error) => {
      console.error('Delete all routines error:', error);
      toast({
        title: "Error",
        description: "Failed to delete all routines. Please try again.",
        variant: "destructive"
      });
    }
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
      
      // Enhanced celebration effect with points
      const routine = routines.find(r => r.id === variables.routineId);
      
      // Get updated stats to show level progress
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      
      toast({
        title: `Routine Completed! +${variables.points} XP`,
        description: `Great job staying consistent with your habits!`,
        duration: 4000,
      });
      
      // Show level progress after a delay
      setTimeout(() => {
        const levelUpMessages = [
          "XP gained! Check your level progress below!",
          "Points added to your experience!",
          "Getting closer to the next level!",
          "Building your fitness journey!"
        ];
        const randomMessage = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
        
        toast({
          description: randomMessage,
          duration: 3000,
        });
      }, 1500);
    }
  });

  // Helper functions for routine management
  const handleEditRoutine = (routine: DailyRoutine) => {
    setEditingRoutine(routine);
    setNewRoutine({
      title: routine.title,
      description: routine.description || "",
      category: routine.category as "health" | "fitness" | "nutrition" | "productivity",
      points: routine.points
    });
    setShowEditDialog(true);
  };

  const handleDeleteRoutine = (routine: DailyRoutine) => {
    setDeletingRoutine(routine);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (deletingRoutine) {
      deleteRoutineMutation.mutate(deletingRoutine.id);
    }
  };

  const handleDeleteAllRoutines = () => {
    setShowDeleteAllAlert(true);
  };

  const confirmDeleteAll = () => {
    deleteAllRoutinesMutation.mutate();
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return <Activity className="h-4 w-4" />;
      case 'fitness': return <Zap className="h-4 w-4" />;
      case 'nutrition': return <Target className="h-4 w-4" />;
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const categoryColors = {
    health: "from-red-500/20 to-pink-500/20 border-red-400/30",
    fitness: "from-blue-500/20 to-purple-500/20 border-blue-400/30",
    nutrition: "from-green-500/20 to-emerald-500/20 border-green-400/30", 
    productivity: "from-yellow-500/20 to-orange-500/20 border-yellow-400/30"
  } as const;

  // Hide completed routines - only show incomplete ones for better UX
  useEffect(() => {
    if (!routines || routines.length === 0) return;
    
    if (showAllRoutines) {
      // Show ALL routines when explicitly requested (both completed and incomplete)
      setDisplayedRoutines(routines);
    } else {
      // Only show incomplete routines (up to 4)
      const uncompleted = routines.filter(r => !completions.some(c => c.routineId === r.id));
      const newDisplayed = uncompleted.slice(0, 4);
      
      // Only update if different to prevent infinite loops
      const currentIds = displayedRoutines.map(r => r.id).sort();
      const newIds = newDisplayed.map(r => r.id).sort();
      
      if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
        setRoutineSlideKey(prev => prev + 1);
        setDisplayedRoutines(newDisplayed);
      }
    }
  }, [routines, completions, showAllRoutines]);

  const completedCount = routines?.filter(r => completions?.some(c => c.routineId === r.id)).length || 0;
  const totalRoutines = routines?.length || 0;
  const allCompleted = totalRoutines > 0 && completedCount === totalRoutines;

  // Show loading state
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

  return (
    <>
      <CelebrationParticles 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Daily Routines
            {totalRoutines > 0 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs animate-pulse">
                {completedCount}/{totalRoutines}
              </Badge>
            )}
          </h3>
          <div className="flex gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllRoutines(!showAllRoutines)}
            className="text-emerald-400 hover:text-emerald-300 h-8 px-2"
          >
            {showAllRoutines ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showAllRoutines ? "Show Less" : "Show All"}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 h-8 px-2">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 border-emerald-400/30 backdrop-blur-lg max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="text-emerald-400 text-lg">Create New Routine</DialogTitle>
                <DialogDescription className="text-emerald-300/70">
                  Build a habit aligned with your weight gain goals
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <div>
                  <label className="text-emerald-300 text-xs font-medium mb-1 block">Title</label>
                  <Input
                    value={newRoutine.title}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Morning protein shake"
                    className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm"
                    data-testid="input-routine-title"
                  />
                </div>
                
                <div>
                  <label className="text-emerald-300 text-xs font-medium mb-1 block">Description (Optional)</label>
                  <Textarea
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm h-16"
                    data-testid="input-routine-description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-emerald-300 text-xs font-medium mb-1 block">Category</label>
                    <Select
                      value={newRoutine.category}
                      onValueChange={(value: "health" | "fitness" | "nutrition" | "productivity") => 
                        setNewRoutine(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-emerald-900/95 border-emerald-400/30">
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-emerald-300 text-xs font-medium mb-1 block">Points</label>
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      step="5"
                      value={newRoutine.points}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, points: parseInt(e.target.value) || 25 }))}
                      className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm"
                      data-testid="input-routine-points"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => createRoutineMutation.mutate({ ...newRoutine, userId })}
                  disabled={!newRoutine.title.trim() || createRoutineMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 text-sm"
                  data-testid="button-create-routine"
                >
                  {createRoutineMutation.isPending ? "Creating..." : "Create Routine"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {totalRoutines > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAllRoutines}
              className="text-red-400 hover:text-red-300 h-8 px-2"
              data-testid="button-delete-all"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </Button>
          )}
          </div>

          <Dialog open={showQuickSetupDialog} onOpenChange={setShowQuickSetupDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 h-8 px-2">
                <Sparkles className="h-4 w-4 mr-1" />
                Quick Setup
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 border-emerald-400/30 backdrop-blur-lg max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="text-emerald-400 text-lg">Quick Setup</DialogTitle>
                <DialogDescription className="text-emerald-300/70">
                  Add 10 pre-configured hardgainer routines
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-emerald-300/80 text-sm">
                  This will add 10 carefully crafted daily routines optimized for hardgainers, including:
                </p>
                <ul className="text-emerald-300/70 text-xs space-y-1 list-disc list-inside">
                  <li>Protein shakes and meal timing</li>
                  <li>Progress tracking and measurements</li>
                  <li>Strength training reminders</li>
                  <li>Hydration and sleep habits</li>
                </ul>
                
                <Button
                  onClick={async () => {
                    // Add all default routines
                    for (const routine of defaultRoutines) {
                      await createRoutineMutation.mutateAsync({ ...routine, userId });
                    }
                    setShowQuickSetupDialog(false);
                    toast({
                      title: "Success!",
                      description: "Added 10 hardgainer-optimized routines!"
                    });
                  }}
                  disabled={createRoutineMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 text-sm"
                >
                  {createRoutineMutation.isPending ? "Adding..." : "Add Routines"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Edit Routine Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 border-emerald-400/30 backdrop-blur-lg max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-emerald-400 text-lg">Edit Routine</DialogTitle>
              <DialogDescription className="text-emerald-300/70">
                Update your daily routine details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              <div>
                <label className="text-emerald-300 text-xs font-medium mb-1 block">Title</label>
                <Input
                  value={newRoutine.title}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning protein shake"
                  className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm"
                  data-testid="input-edit-routine-title"
                />
              </div>
              
              <div>
                <label className="text-emerald-300 text-xs font-medium mb-1 block">Description (Optional)</label>
                <Textarea
                  value={newRoutine.description}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description..."
                  className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm h-16"
                  data-testid="input-edit-routine-description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-emerald-300 text-xs font-medium mb-1 block">Category</label>
                  <Select
                    value={newRoutine.category}
                    onValueChange={(value: "health" | "fitness" | "nutrition" | "productivity") => 
                      setNewRoutine(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-900/95 border-emerald-400/30">
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-emerald-300 text-xs font-medium mb-1 block">Points</label>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={newRoutine.points}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, points: parseInt(e.target.value) || 25 }))}
                    className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100 text-sm"
                    data-testid="input-edit-routine-points"
                  />
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (editingRoutine) {
                    editRoutineMutation.mutate({ 
                      id: editingRoutine.id,
                      ...newRoutine 
                    });
                  }
                }}
                disabled={!newRoutine.title.trim() || editRoutineMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 text-sm"
                data-testid="button-update-routine"
              >
                {editRoutineMutation.isPending ? "Updating..." : "Update Routine"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent className="bg-gradient-to-br from-red-950/95 to-red-900/95 border-red-400/30 backdrop-blur-lg max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 text-lg">Delete Routine</AlertDialogTitle>
              <AlertDialogDescription className="text-red-300/70">
                Are you sure you want to delete "{deletingRoutine?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                data-testid="button-cancel-delete"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteRoutineMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
                data-testid="button-confirm-delete"
              >
                {deleteRoutineMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete All Confirmation Dialog */}
        <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
          <AlertDialogContent className="bg-gradient-to-br from-red-950/95 to-red-900/95 border-red-400/30 backdrop-blur-lg max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 text-lg">Delete All Routines</AlertDialogTitle>
              <AlertDialogDescription className="text-red-300/70">
                Are you sure you want to delete all {totalRoutines} routine{totalRoutines !== 1 ? 's' : ''}? This will permanently remove all your routines and completion history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={deleteAllRoutinesMutation.isPending}
                data-testid="button-cancel-delete-all"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAll}
                disabled={deleteAllRoutinesMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-confirm-delete-all"
              >
                {deleteAllRoutinesMutation.isPending ? "Deleting All..." : "Delete All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {(!displayedRoutines || displayedRoutines.length === 0) && !showAllRoutines ? (
        allCompleted && totalRoutines > 0 ? (
          <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-400/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="h-12 w-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <p className="text-emerald-400 text-lg font-semibold mb-1">🎉 All routines completed!</p>
              <p className="text-emerald-300/70 text-sm">Amazing work today! Come back tomorrow for more!</p>
            </CardContent>
          </Card>
        ) : (
        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-400/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="h-12 w-12 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-emerald-300/70 text-sm mb-3">No routines yet!</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                size="sm" 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Routine
              </Button>
              <Button
                onClick={() => setShowQuickSetupDialog(true)}
                variant="outline"
                size="sm"
                className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Quick Setup
              </Button>
            </div>
          </CardContent>
        </Card>
        )
      ) : (
        <div key={routineSlideKey} className={`space-y-2 ${showAllRoutines ? 'max-h-96 overflow-y-auto' : ''}`}>
          {displayedRoutines?.map((routine, index) => {
            const isCompleted = completions?.some(c => c.routineId === routine.id);
            const categoryColor = categoryColors[routine.category as keyof typeof categoryColors];
            
            return (
              <Card
                key={routine.id}
                className={`bg-gradient-to-br ${categoryColor} backdrop-blur-sm transition-all duration-300 animate-routine-slide-in ${isCompleted ? 'ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-400/20' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg cursor-pointer'} ${completeRoutineMutation.isPending ? 'animate-pulse' : ''}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
                onClick={(e) => {
                  // Only trigger completion if clicked outside of menu
                  const target = e.target as HTMLElement;
                  if (!target.closest('[data-radix-popper-content-wrapper]')) {
                    toggleCompletion(routine, e);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between min-h-[3rem]">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0 text-emerald-400">{getCategoryIcon(routine.category)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm leading-5 ${isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>
                          {routine.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">+{routine.points} points</p>
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
                      
                      {/* Routine Management Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-slate-800/95 border-slate-600/30 backdrop-blur-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditRoutine(routine);
                            }}
                            className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Routine
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteRoutine(routine);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Routine
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' 
                            : `border-gray-400 hover:border-emerald-400 hover:shadow-md ${completingRoutineId === routine.id ? 'animate-spin' : ''}`
                        }`}
                        onClick={(e) => toggleCompletion(routine, e)}
                      >
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
    currentTdeeAnalysis,
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

  // Removed calibration redirect - users now go directly to dashboard after onboarding

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
                  +{Math.max(0, (todayCalories - (currentTdeeAnalysis?.tdee || 2500))).toLocaleString()} surplus
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Action Cards */}
        <div className="grid grid-cols-2 gap-6">
          <Link href="/progress">
            <Card className="group bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-cyan-400/30 hover:border-cyan-400/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer backdrop-blur-sm relative overflow-hidden" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-5 text-center relative z-10">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-cyan-400/20 group-hover:bg-cyan-400/30 transition-colors">
                  <Activity className="h-6 w-6 text-cyan-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase group-hover:text-slate-200 transition-colors">Advanced</p>
                <p className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-100 transition-colors">Progress</p>
                
                {/* Tap indicator */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse group-hover:bg-cyan-400 transition-colors" />
                <div className="mt-2 text-xs text-cyan-400/70 font-medium group-hover:text-cyan-400 transition-colors">Tap to explore →</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/measurements">
            <Card className="group bg-gradient-to-br from-slate-800/95 via-slate-700/95 to-slate-800/95 border border-purple-400/30 hover:border-purple-400/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer backdrop-blur-sm relative overflow-hidden" 
                  style={{ 
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                  }}>
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardContent className="p-5 text-center relative z-10">
                <div className="relative inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-purple-400/20 group-hover:bg-purple-400/30 transition-colors">
                  <Ruler className="h-6 w-6 text-purple-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-xs text-slate-300 font-medium tracking-wide uppercase group-hover:text-slate-200 transition-colors">Body</p>
                <p className="text-sm font-bold text-white tracking-tight group-hover:text-purple-100 transition-colors">Measurements</p>
                
                {/* Tap indicator */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse group-hover:bg-purple-400 transition-colors" />
                <div className="mt-2 text-xs text-purple-400/70 font-medium group-hover:text-purple-400 transition-colors">Tap to explore →</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Weight Logging Section - Priority placement at top */}
        {!todayWeight && (
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <div className="relative">
                <Activity className="h-6 w-6 text-orange-400 drop-shadow-lg" />
                <div className="absolute inset-0 animate-ping">
                  <Activity className="h-6 w-6 text-orange-400/40" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text text-transparent">
                Log Today's Weight
              </span>
            </h3>
            <WeightLogger />
          </div>
        )}

        {/* Daily Routines Quick Checker */}
        <DailyRoutinesQuickChecker />

        {/* Recovery Tracking Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            </div>
            Recovery & Wellness
          </h3>
          
          <div className="grid gap-3">
            <SleepQualityTrackerComponent />
            <StressLevelTrackerComponent />
          </div>
        </div>

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