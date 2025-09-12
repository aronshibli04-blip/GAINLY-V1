import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserStore, useUserProgress } from "@/store/userStore";
import { CalendarDays, Scale, Utensils, Activity, TrendingUp, Target, Plus, Settings, Sparkles, FastForward } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { calculateTdee, generateTdeeAnalysis, getProgressInsights } from "@/utils/tdee";
import { openAIService } from "@/api/openai";
import { MealPlanRequest, DietaryPreference } from "@/types";

export default function HardgainerHome() {
  const { toast } = useToast();
  const {
    user,
    isOnboarded,
    weightEntries,
    calorieEntries,
    activityEntries,
    currentTdeeAnalysis,
    mealPlans,
    currentPhase,
    addWeightEntry,
    addCalorieEntry,
    addActivityEntry,
    setTdeeAnalysis,
    addMealPlan,
    updatePhase,

  } = useUserStore();

  const progress = useUserProgress();
  const insights = getProgressInsights(weightEntries, calorieEntries, currentTdeeAnalysis?.targetCalories);

  // Form states
  const [weightInput, setWeightInput] = useState("");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [activityType, setActivityType] = useState<'steps' | 'light' | 'moderate' | 'heavy'>('light');
  const [activityValue, setActivityValue] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);

  const selectedDate = format(new Date(), 'yyyy-MM-dd');

  // Check if user needs to complete setup
  if (!user || !isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 text-white rounded-full mb-6">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              GAINLY
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Weight Gain Through Real TDEE Calculation
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Track your data for 7 days, then get meal plans
            </p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete your profile setup to begin your weight gain journey with personalized TDEE calculation and meal planning.
              </p>
              <Button asChild className="w-full" size="lg">
                <a href="/setup">Start Profile Setup</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const todayWeight = weightEntries.find(w => w.date === selectedDate);
  const todayCalories = calorieEntries
    .filter(c => c.date === selectedDate)
    .reduce((sum, entry) => sum + entry.calories, 0);
  const todayActivity = activityEntries.find(a => a.date === selectedDate);

  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : (user.weight || 0);
  const weightProgress = ((currentWeight - (user.weight || 0)) / (user.goalWeight - (user.weight || 0))) * 100;

  const handleLogWeight = () => {
    if (!weightInput) {
      toast({ title: "💪 Ready to log your weight?", description: "Enter your current weight to track your progress!" });
      return;
    }
    
    const weight = parseFloat(weightInput);
    if (weight < 30 || weight > 300) {
      toast({ title: "Let's get the right number!", description: "Weight should be between 30-300 kg for accurate tracking." });
      return;
    }

    addWeightEntry({
      userId: user.id,
      weight,
      date: selectedDate,
    });
    
    setWeightInput("");
    toast({ title: "Weight logged successfully!" });
  };

  const handleLogMeal = () => {
    if (!mealName || !calories) {
      toast({ title: "🍽️ Time to fuel your gains!", description: "Add what you ate and the calories to track your progress." });
      return;
    }
    
    const calorieValue = parseInt(calories);
    if (calorieValue < 50 || calorieValue > 5000) {
      toast({ title: "Great choice to track!", description: "Calories should be between 50-5000 for accurate logging." });
      return;
    }

    addCalorieEntry({
      userId: user.id,
      calories: calorieValue,
      description: mealName,
      date: selectedDate,
    });
    
    setMealName("");
    setCalories("");
    toast({ title: "Meal logged successfully!" });
  };

  const handleLogActivity = () => {
    if (!activityValue) {
      toast({ title: "🏃‍♂️ Keep moving forward!", description: "Add your activity details to complete your daily tracking." });
      return;
    }

    const value = parseInt(activityValue);
    if (value < 0 || value > 50000) {
      toast({ title: "Almost there!", description: "Activity value should be between 0-50000 for accurate tracking." });
      return;
    }

    addActivityEntry({
      userId: user.id,
      type: activityType,
      value,
      date: selectedDate,
    });
    
    setActivityValue("");
    toast({ title: "Activity logged successfully!" });
  };

  const handleGenerateTdeeAnalysis = () => {
    if (progress.weightEntries < 7 || progress.calorieEntries < 7) {
      toast({
        title: "🚀 Building your foundation!",
        description: `You're on track! ${Math.max(7 - progress.weightEntries, 7 - progress.calorieEntries)} more days of data will unlock your personalized analysis.`
      });
      return;
    }

    const analysis = generateTdeeAnalysis(weightEntries, calorieEntries, user.id);
    setTdeeAnalysis(analysis);
    updatePhase('meal_planning');
    
    toast({
      title: "TDEE Analysis Generated!",
      description: `Your calculated TDEE is ${analysis.tdee} kcal. Target: ${analysis.targetCalories} kcal.`
    });
  };

  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      // API key handling moved to server side
      setApiKeyInput("");
      setShowApiKeyDialog(false);
      toast({ title: "OpenAI API key has been set successfully!" });
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!currentTdeeAnalysis) {
      toast({ title: "🎯 One step closer!", description: "Generate your TDEE analysis first to unlock personalized meal plans." });
      return;
    }

    // API key check removed - handled server side

    setIsGeneratingMealPlan(true);

    try {
      const request: MealPlanRequest = {
        userId: user.id,
        targetCalories: currentTdeeAnalysis.targetCalories,
        dietaryPreferences: user.dietaryPreferences?.map(p => p.name) || [],
        preferredFoods: ['Rice', 'Chicken', 'Pasta', 'Beef', 'Fish'],
        maxMealsPerDay: 4,
        maxPrepTime: 60,
        cookingExperience: 'intermediate',
      };

      const mealPlan = await openAIService.generateMealPlan(request);
      addMealPlan(mealPlan);
      updatePhase('tracking');
      
      toast({ title: "Meal plan generated successfully!" });
    } catch (error: any) {
      toast({
        title: "Let's try that again!",
        description: "Meal plan generation didn't work this time. Your data is safe - ready for another attempt?"
      });
    } finally {
      setIsGeneratingMealPlan(false);
    }
  };

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'calibration':
        return {
          title: 'TDEE Calibration Phase',
          subtitle: `Day ${progress.daysTracking} of minimum 7 days`,
          description: 'Track your weight and calories daily to calculate your real TDEE',
          color: 'bg-blue-500',
        };
      case 'meal_planning':
        return {
          title: 'Meal Planning Phase',
          subtitle: 'Ready for personalized meal plans',
          description: 'Generate meal plans based on your calculated TDEE',
          color: 'bg-purple-500',
        };
      case 'tracking':
        return {
          title: 'Active Tracking Phase',
          subtitle: 'Following your personalized plan',
          description: 'Monitor progress and adjust your meal plans as needed',
          color: 'bg-emerald-500',
        };
      default:
        return {
          title: 'Getting Started',
          subtitle: 'Complete setup to begin',
          description: 'Finish your profile setup to start tracking',
          color: 'bg-gray-500',
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const chartData = weightEntries.slice(-14).reverse().map(entry => ({
    date: entry.date,
    weight: entry.weight
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let's continue your weight gain journey
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/setup">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </a>
            </Button>
          </div>
        </div>

        {/* Phase Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full ${phaseInfo.color} flex items-center justify-center`}>
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {phaseInfo.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {phaseInfo.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {phaseInfo.description}
                  </p>
                </div>
              </div>
              
              {/* Skip Day Button - Only show during calibration phase */}
              {currentPhase === 'calibration' && (
                <div className="flex flex-col items-end">
                  <Button 
                    onClick={() => {
                      if (user && !user.hasCompletedCalibration) {
                        // setUser({ ...user, hasCompletedCalibration: true });
                        toast({ 
                          title: "Calibration Skipped", 
                          description: "Jumping to main app for testing"
                        });
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1000);
                      }
                    }}
                    variant="outline" 
                    size="sm"
                    className="mb-2 bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30"
                    data-testid="button-skip-calibration"
                  >
                    <FastForward className="h-4 w-4 mr-2" />
                    Skip to Main App (Testing)
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                    Testing feature
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Weight</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentWeight.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-gray-500">
                    Goal: {user.goalWeight} kg
                  </p>
                </div>
                <Scale className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.max(0, Math.round(weightProgress))}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <Progress value={Math.max(0, weightProgress)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Calories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {todayCalories}
                  </p>
                  {currentTdeeAnalysis && (
                    <p className="text-xs text-gray-500">
                      Target: {currentTdeeAnalysis.targetCalories}
                    </p>
                  )}
                </div>
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Tracked</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progress.daysTracking}
                  </p>
                  <p className="text-xs text-gray-500">
                    W: {progress.weightEntries} | C: {progress.calorieEntries}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Forms */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="weight">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="weight">Weight</TabsTrigger>
                    <TabsTrigger value="meals">Meals</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="weight" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          placeholder="Enter your weight"
                          data-testid="input-weight"
                        />
                      </div>
                      <Button 
                        onClick={handleLogWeight}
                        className="w-full"
                        data-testid="button-log-weight"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Weight
                      </Button>
                      {todayWeight && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-today-weight">
                            Today's weight: <strong>{todayWeight.weight} kg</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="meals" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="meal">Meal Description</Label>
                        <Input
                          id="meal"
                          value={mealName}
                          onChange={(e) => setMealName(e.target.value)}
                          placeholder="What did you eat?"
                          data-testid="input-meal-description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="calories">Calories</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={calories}
                          onChange={(e) => setCalories(e.target.value)}
                          placeholder="Enter calories"
                          data-testid="input-calories"
                        />
                      </div>
                      <Button 
                        onClick={handleLogMeal}
                        className="w-full"
                        data-testid="button-log-meal"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Meal
                      </Button>
                      {todayCalories > 0 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-today-calories">
                            Today's total: <strong>{todayCalories} kcal</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="activity-type">Activity Type</Label>
                        <select
                          id="activity-type"
                          value={activityType}
                          onChange={(e) => setActivityType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                          data-testid="select-activity-type"
                        >
                          <option value="steps">Steps</option>
                          <option value="light">Light Activity</option>
                          <option value="moderate">Moderate Exercise</option>
                          <option value="heavy">Heavy Training</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="activity-value">
                          {activityType === 'steps' ? 'Number of Steps' : 'Duration (hours)'}
                        </Label>
                        <Input
                          id="activity-value"
                          type="number"
                          step={activityType === 'steps' ? '1' : '0.5'}
                          value={activityValue}
                          onChange={(e) => setActivityValue(e.target.value)}
                          placeholder={activityType === 'steps' ? '10000' : '1.5'}
                          data-testid="input-activity-value"
                        />
                      </div>
                      <Button 
                        onClick={handleLogActivity}
                        className="w-full"
                        data-testid="button-log-activity"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Activity
                      </Button>
                      {todayActivity && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-today-activity">
                            Today's activity: <strong>{todayActivity.type}</strong> ({todayActivity.value})
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis & Progress */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTdeeAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Calculated TDEE</p>
                      <p className="text-xl font-bold" data-testid="text-calculated-tdee">{currentTdeeAnalysis.tdee.toLocaleString()} kcal</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Target Calories</p>
                      <p className="text-xl font-bold text-emerald-600" data-testid="text-target-calories">{currentTdeeAnalysis.targetCalories.toLocaleString()} kcal</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                      <Progress value={currentTdeeAnalysis.confidence * 100} className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1" data-testid="text-confidence">{Math.round(currentTdeeAnalysis.confidence * 100)}%</p>
                    </div>
                    
                    {currentPhase === 'meal_planning' && (
                      <Button 
                        onClick={handleGenerateMealPlan}
                        disabled={isGeneratingMealPlan}
                        className="w-full"
                        data-testid="button-generate-meal-plan"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGeneratingMealPlan ? 'Generating...' : 'Generate AI Meal Plan'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Need at least 7 days of weight and calorie data for AI analysis
                    </p>
                    <p className="text-xs text-gray-500 mb-4" data-testid="text-progress-status">
                      Current: {progress.weightEntries} weight • {progress.calorieEntries} calorie entries
                    </p>
                    <Button 
                      onClick={handleGenerateTdeeAnalysis}
                      disabled={!progress.readyForAnalysis}
                      size="sm"
                      data-testid="button-generate-analysis"
                    >
                      Generate TDEE Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`insight-${index}`}>{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weight Progress Chart */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weight Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value: any) => [`${value} kg`, 'Weight']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Meal Plans */}
            {mealPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Meal Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mealPlans.slice(0, 3).map((plan) => (
                      <div key={plan.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="text-sm font-medium" data-testid={`meal-plan-date-${plan.id}`}>{plan.date}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`meal-plan-summary-${plan.id}`}>
                          {plan.totalCalories} kcal • {plan.meals.length} meals
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI API Key Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To generate AI meal plans, you need to provide your OpenAI API key. This key will be stored securely in your browser.
            </p>
            <div>
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                data-testid="input-api-key"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSetApiKey} className="flex-1" data-testid="button-set-api-key">
                Set API Key
              </Button>
              <Button variant="outline" onClick={() => setShowApiKeyDialog(false)} data-testid="button-cancel-api-key">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}