import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Target, 
  Plus, 
  Flame, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Zap,
  Star,
  TrendingUp,
  Heart,
  Dumbbell,
  Apple,
  Brain
} from "lucide-react";
import type { DailyRoutine, DailyRoutineCompletion } from "@shared/schema";
import { defaultRoutines } from "@/data/default-routines";

// Particle animation background
const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute w-2 h-2 bg-emerald-400/20 rounded-full animate-pulse" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
    <div className="absolute w-1 h-1 bg-emerald-300/30 rounded-full animate-pulse" style={{ top: '60%', left: '80%', animationDelay: '1s' }}></div>
    <div className="absolute w-3 h-3 bg-emerald-500/10 rounded-full animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '2s' }}></div>
    <div className="absolute w-1.5 h-1.5 bg-emerald-400/25 rounded-full animate-pulse" style={{ top: '80%', left: '20%', animationDelay: '0.5s' }}></div>
    <div className="absolute w-2 h-2 bg-emerald-300/20 rounded-full animate-pulse" style={{ top: '30%', left: '90%', animationDelay: '1.5s' }}></div>
  </div>
);

const categoryIcons = {
  health: Heart,
  fitness: Dumbbell,
  nutrition: Apple,
  productivity: Brain,
} as const;

const categoryColors = {
  health: "from-red-500/20 to-pink-500/20",
  fitness: "from-blue-500/20 to-purple-500/20", 
  nutrition: "from-green-500/20 to-emerald-500/20",
  productivity: "from-yellow-500/20 to-orange-500/20",
} as const;

export default function DailyRoutines() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    description: "",
    category: "health" as keyof typeof categoryIcons,
    points: 25
  });

  const userId = localStorage.getItem("userId") || "user1";
  const today = new Date().toISOString().split('T')[0];

  // Fetch user routines
  const { data: routines = [], isLoading: routinesLoading } = useQuery<DailyRoutine[]>({
    queryKey: ['/api/daily-routines', userId],
    queryFn: () => fetch(`/api/daily-routines/${userId}`).then(res => res.json())
  });

  // Fetch today's completions
  const { data: completions = [], isLoading: completionsLoading } = useQuery<DailyRoutineCompletion[]>({
    queryKey: ['/api/daily-routine-completions', userId, today],
    queryFn: () => fetch(`/api/daily-routine-completions/${userId}/${today}`).then(res => res.json())
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: () => fetch(`/api/user-stats/${userId}`).then(res => res.json())
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: async (routineData: typeof newRoutine & { userId: string }) => {
      const response = await fetch('/api/daily-routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData)
      });
      if (!response.ok) throw new Error('Failed to create routine');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routines'] });
      setShowAddDialog(false);
      setNewRoutine({ title: "", description: "", category: "health", points: 25 });
      toast({ title: "Success", description: "Daily routine created!" });
    }
  });

  // Complete routine mutation
  const completeRoutineMutation = useMutation({
    mutationFn: async ({ routineId, points }: { routineId: string, points: number }) => {
      const response = await fetch('/api/daily-routine-completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          routineId,
          completedDate: today,
          pointsEarned: points
        })
      });
      if (!response.ok) throw new Error('Failed to complete routine');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-routine-completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      toast({ 
        title: "🎉 Routine Completed!", 
        description: "Great job! You earned points and boosted your streak!" 
      });
    }
  });

  // Toggle routine completion
  const toggleCompletion = (routine: DailyRoutine) => {
    const isCompleted = completions.some(c => c.routineId === routine.id);
    
    if (!isCompleted) {
      completeRoutineMutation.mutate({ 
        routineId: routine.id, 
        points: routine.points 
      });
    }
  };

  const completedToday = completions.length;
  const totalRoutines = routines.length;
  const completionRate = totalRoutines > 0 ? (completedToday / totalRoutines) * 100 : 0;
  const totalPointsToday = completions.reduce((sum, c) => sum + c.pointsEarned, 0);

  if (routinesLoading || completionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950 relative">
        <ParticleBackground />
        <div className="relative z-10 container mx-auto p-4 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-emerald-900/30 rounded-xl"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-emerald-900/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950 relative">
      <ParticleBackground />
      
      {/* Header */}
      <div className="relative z-10 border-b border-emerald-800/30 bg-emerald-950/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl flex items-center justify-center border border-emerald-400/30 animate-spin-slow">
              <Target className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Daily Routines
              </h1>
              <p className="text-emerald-300/70 text-lg">
                Build habits aligned with your bigger goals
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto p-4 space-y-6">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-emerald-300/70 text-sm">Today's Progress</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {completedToday}/{totalRoutines}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-orange-300/70 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {userStats?.currentStreak || 0} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-purple-300/70 text-sm">Points Today</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {totalPointsToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-400/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-blue-300/70 text-sm">Level</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {userStats?.level || 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-400/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-emerald-400">Daily Goal Progress</h3>
              <span className="text-emerald-300 font-semibold">{Math.round(completionRate)}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-3 bg-emerald-900/50"
            />
            <p className="text-emerald-300/70 text-sm mt-2">
              {completedToday} of {totalRoutines} routines completed today
            </p>
          </CardContent>
        </Card>

        {/* Routines List */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-400">Your Routines</h2>
          
          <div className="flex gap-3">
            <Button
              onClick={async () => {
                // Add all default routines sequentially to avoid race conditions
                for (const routine of defaultRoutines) {
                  await createRoutineMutation.mutateAsync({ ...routine, userId });
                }
                toast({
                  title: "Success!",
                  description: "Added 10 hardgainer-optimized routines for you!"
                });
              }}
              variant="outline"
              className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10"
              disabled={createRoutineMutation.isPending}
              data-testid="button-quick-setup"
            >
              <Zap className="h-5 w-5 mr-2" />
              {createRoutineMutation.isPending ? "Adding..." : "Quick Setup"}
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                  data-testid="button-add-routine"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Custom
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-emerald-900/95 to-teal-900/95 border-emerald-400/30 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-emerald-400 text-xl">Create New Routine</DialogTitle>
                <DialogDescription className="text-emerald-300/70">
                  Add a new daily routine aligned with your weight gain goals
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Input
                  placeholder="Routine title (e.g., Morning protein shake)"
                  value={newRoutine.title}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100"
                  data-testid="input-routine-title"
                />
                
                <Textarea
                  placeholder="Description (optional)"
                  value={newRoutine.description}
                  onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100"
                  data-testid="input-routine-description"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-emerald-300 text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={newRoutine.category}
                      onValueChange={(value: keyof typeof categoryIcons) => 
                        setNewRoutine(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100">
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
                    <label className="text-emerald-300 text-sm font-medium mb-2 block">Points</label>
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      step="5"
                      value={newRoutine.points}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, points: parseInt(e.target.value) || 25 }))}
                      className="bg-emerald-900/30 border-emerald-400/30 text-emerald-100"
                      data-testid="input-routine-points"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => createRoutineMutation.mutate({ ...newRoutine, userId })}
                  disabled={!newRoutine.title.trim() || createRoutineMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                  data-testid="button-create-routine"
                >
                  {createRoutineMutation.isPending ? "Creating..." : "Create Routine"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Routines Grid */}
        <div className="grid gap-4">
          {routines.length === 0 ? (
            <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-400/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 text-emerald-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">No Routines Yet</h3>
                <p className="text-emerald-300/70 mb-4">
                  Create your first daily routine to start building habits aligned with your weight gain goals!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Custom Routine
                  </Button>
                  <Button
                    onClick={async () => {
                      // Add all default routines sequentially to avoid race conditions
                      for (const routine of defaultRoutines) {
                        await createRoutineMutation.mutateAsync({ ...routine, userId });
                      }
                      toast({
                        title: "Success!",
                        description: "Added 10 hardgainer-optimized routines for you!"
                      });
                    }}
                    variant="outline"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Setup (10 Routines)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            routines.map((routine) => {
              const isCompleted = completions.some(c => c.routineId === routine.id);
              const IconComponent = categoryIcons[routine.category as keyof typeof categoryIcons];
              const gradientClass = categoryColors[routine.category as keyof typeof categoryColors];
              
              return (
                <Card
                  key={routine.id}
                  className={`bg-gradient-to-br ${gradientClass} border-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${isCompleted ? 'ring-2 ring-emerald-400/50' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/20 border border-emerald-400/50' : `bg-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-500/20`}`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          ) : (
                            <IconComponent className={`h-6 w-6 text-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${isCompleted ? 'text-emerald-400' : `text-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400`}`}>
                            {routine.title}
                          </h3>
                          {routine.description && (
                            <p className={`text-sm ${isCompleted ? 'text-emerald-300/70' : `text-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-300/70`} mt-1`}>
                              {routine.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-xs ${isCompleted ? 'border-emerald-400/50 text-emerald-400' : `border-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400/50 text-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400`}`}>
                              {routine.category}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${isCompleted ? 'border-emerald-400/50 text-emerald-400' : `border-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400/50 text-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-400`}`}>
                              +{routine.points} points
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-semibold">Done!</span>
                          </div>
                        )}
                        
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleCompletion(routine)}
                          disabled={isCompleted || completeRoutineMutation.isPending}
                          className={`w-6 h-6 ${isCompleted ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500' : `data-[state=checked]:bg-${routine.category === 'health' ? 'red' : routine.category === 'fitness' ? 'blue' : routine.category === 'nutrition' ? 'green' : 'yellow'}-500`}`}
                          data-testid={`checkbox-routine-${routine.id}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Motivational Message */}
        {completionRate === 100 && routines.length > 0 && (
          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Trophy className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">🎉 Perfect Day!</h3>
              <p className="text-emerald-300/90 text-lg">
                You completed all your routines today! You're building incredible momentum toward your weight gain goals.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </div>
  );
}