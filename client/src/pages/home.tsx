import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import WeightChart from "@/components/weight-chart";
import CalorieChart from "@/components/calorie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Weight, 
  Utensils, 
  Activity, 
  TrendingUp, 
  Brain,
  Dumbbell,
  Briefcase,
  Coffee,
  Plus,
  Check,
  Info,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import type { User, WeightLog, MealLog, ActivityLog, AiAnalysis } from "@shared/schema";

// API Response Types
interface ProgressData {
  weightLogs: number;
  mealDays: number;
  activityLogs: number;
  totalDays: number;
}

interface DailyCaloriesData {
  logDate: string;
  totalCalories: number;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [newCalories, setNewCalories] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      setLocation("/setup");
      return;
    }
    setUserId(storedUserId);
  }, [setLocation]);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Queries
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: progress } = useQuery<ProgressData>({
    queryKey: ["/api/progress", userId],
    enabled: !!userId,
  });

  const { data: weightLogs } = useQuery<WeightLog[]>({
    queryKey: ["/api/weight-logs", userId],
    enabled: !!userId,
  });

  const { data: dailyCalories } = useQuery<DailyCaloriesData[]>({
    queryKey: ["/api/daily-calories", userId],
    enabled: !!userId,
  });

  const { data: todayWeight } = useQuery<WeightLog>({
    queryKey: ["/api/weight-logs", userId, today],
    enabled: !!userId,
  });

  const { data: todayMeals } = useQuery<MealLog[]>({
    queryKey: ["/api/meal-logs", userId, today],
    enabled: !!userId,
  });

  const { data: todayActivity } = useQuery<ActivityLog>({
    queryKey: ["/api/activity-logs", userId, today],
    enabled: !!userId,
  });

  const { data: aiAnalysis } = useQuery<AiAnalysis>({
    queryKey: ["/api/ai-analysis", userId],
    enabled: !!userId,
  });

  // Mutations
  const logWeightMutation = useMutation({
    mutationFn: async (weight: string) => {
      const response = await apiRequest("POST", "/api/weight-logs", {
        userId,
        weight,
        logDate: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      setNewWeight("");
      toast({ title: "Weight logged successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error logging weight",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMealMutation = useMutation({
    mutationFn: async ({ calories, description }: { calories: string; description: string }) => {
      const response = await apiRequest("POST", "/api/meal-logs", {
        userId,
        calories: parseInt(calories),
        description: description || null,
        logDate: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-calories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      setNewCalories("");
      setMealDescription("");
      toast({ title: "Meal logged successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error logging meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: async (activityType: string) => {
      const response = await apiRequest("POST", "/api/activity-logs", {
        userId,
        activityType,
        logDate: today,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({ title: "Activity logged successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error logging activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateAiAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-analysis", { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-analysis"] });
      toast({ 
        title: "AI Analysis Complete!",
        description: "Your personalized TDEE and weight gain plan is ready."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!userId || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const todayCalories = todayMeals?.reduce((sum: number, meal: MealLog) => sum + Number(meal.calories), 0) || 0;
  const progressPercentage = progress ? Math.round(((progress.weightLogs + progress.mealDays + progress.activityLogs) / (progress.totalDays * 3)) * 100) : 0;
  const canAnalyze = progress && progress.weightLogs >= 7 && progress.mealDays >= 7;
  const daysUntilAnalysis = progress ? Math.max(0, 7 - Math.min(progress.weightLogs, progress.mealDays)) : 7;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
                <p className="text-blue-100 mb-4">Day {progress?.totalDays || 1} of your data collection phase</p>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">Current Weight</span>
                    <p className="text-xl font-bold">
                      {todayWeight?.weight ? Number(todayWeight.weight) : (weightLogs?.[0]?.weight ? Number(weightLogs[0].weight) : "—")} lbs
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">Goal Weight</span>
                    <p className="text-xl font-bold">{user.calculatedTargetWeight ? Number(user.calculatedTargetWeight) : Number(user.goalWeight)} lbs</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        </div>

        {/* Data Collection Progress */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Data Collection Progress</CardTitle>
              <Badge variant={canAnalyze ? "default" : "secondary"}>
                {canAnalyze ? "Ready for AI Analysis" : `${daysUntilAnalysis} days until AI analysis`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Weight className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Weight Logs</h4>
                <p className="text-2xl font-bold text-secondary">{progress?.weightLogs || 0}/{progress?.totalDays || 1}</p>
                <p className="text-sm text-gray-500">entries completed</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Utensils className="w-8 h-8 text-amber-500" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Meal Logs</h4>
                <p className="text-2xl font-bold text-amber-500">{progress?.mealDays || 0}/{progress?.totalDays || 1}</p>
                <p className="text-sm text-gray-500">days completed</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Activity Logs</h4>
                <p className="text-2xl font-bold text-primary">{progress?.activityLogs || 0}/{progress?.totalDays || 1}</p>
                <p className="text-sm text-gray-500">days completed</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Logging */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Logging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weight Logging */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Weight className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Weight Check-in</h4>
                  {todayWeight && <Check className="w-5 h-5 text-green-500" />}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2">
                      Current Weight
                    </Label>
                    <div className="relative">
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="145.2"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">lbs</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Weighing Tips</p>
                        <p className="text-sm text-blue-800">Weigh yourself at the same time daily, preferably in the morning after using the bathroom and before eating.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90"
                    onClick={() => logWeightMutation.mutate(newWeight)}
                    disabled={!newWeight || logWeightMutation.isPending || !!todayWeight}
                  >
                    {todayWeight ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Weight Logged ({Number(todayWeight.weight)} lbs)
                      </>
                    ) : (
                      <>
                        <Weight className="w-4 h-4 mr-2" />
                        {logWeightMutation.isPending ? "Logging..." : "Log Weight"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Calorie Logging */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Calorie Intake</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Today's Total</span>
                      <span className="text-2xl font-bold text-amber-500">{todayCalories.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {todayMeals?.length || 0} meals logged
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="calories" className="text-sm font-medium text-gray-700 mb-2">
                      Add Meal/Snack Calories
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="350"
                      value={newCalories}
                      onChange={(e) => setNewCalories(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
                      Meal Description (Optional)
                    </Label>
                    <Input
                      id="description"
                      type="text"
                      placeholder="Chicken breast with rice"
                      value={mealDescription}
                      onChange={(e) => setMealDescription(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => addMealMutation.mutate({ calories: newCalories, description: mealDescription })}
                    disabled={!newCalories || addMealMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addMealMutation.isPending ? "Adding..." : "Add Meal"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Type Selection */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Today's Activity</h4>
                {todayActivity && <Check className="w-5 h-5 text-green-500" />}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { type: "training", label: "Training Day", icon: Dumbbell },
                  { type: "work", label: "Work Day", icon: Briefcase },
                  { type: "rest", label: "Rest Day", icon: Coffee }
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={todayActivity?.activityType === type ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => {
                      setSelectedActivity(type);
                      logActivityMutation.mutate(type);
                    }}
                    disabled={!!todayActivity || logActivityMutation.isPending}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WeightChart weightLogs={weightLogs || []} />
          <CalorieChart dailyCalories={dailyCalories || []} />
        </div>

        {/* AI Analysis */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {aiAnalysis ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI Analysis Complete!</h3>
                    <p className="text-green-100 mb-4">Your personalized TDEE calculation and weight gain plan is ready.</p>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium">Calculated TDEE</span>
                        <p className="text-xl font-bold">{Number(aiAnalysis.calculatedTdee)} kcal</p>
                      </div>
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium">Target Calories</span>
                        <p className="text-xl font-bold">{Number(aiAnalysis.targetCalories)} kcal</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                      <Brain className="w-12 h-12 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI Analysis Coming Soon</h3>
                    <p className="text-purple-100 mb-4">
                      {canAnalyze 
                        ? "You have enough data! Generate your personalized analysis now." 
                        : `Complete ${daysUntilAnalysis} more days of logging to unlock your personalized TDEE calculation and weight gain plan.`
                      }
                    </p>
                    {canAnalyze && (
                      <Button 
                        className="bg-white text-purple-600 hover:bg-gray-100"
                        onClick={() => generateAiAnalysisMutation.mutate()}
                        disabled={generateAiAnalysisMutation.isPending}
                      >
                        {generateAiAnalysisMutation.isPending ? "Analyzing..." : "Generate AI Analysis"}
                      </Button>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                      <Brain className="w-12 h-12 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 p-2 text-primary">
            <div className="w-6 h-6 flex items-center justify-center">🏠</div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-500">
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">Log</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-500">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-medium">Progress</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">👤</div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
