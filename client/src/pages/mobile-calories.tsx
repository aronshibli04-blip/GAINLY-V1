import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { Scale, Target, Plus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileCalories() {
  const { toast } = useToast();
  const { 
    addWeightEntry, 
    addCalorieEntry, 
    weightEntries, 
    calorieEntries 
  } = useUserStore();

  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [mealDescription, setMealDescription] = useState("");

  const today = new Date().toISOString().split('T')[0];
  
  // Get today's data
  const todayWeight = weightEntries.find(w => w.date === today);
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);
  const todayMeals = calorieEntries.filter(c => c.date === today);

  const handleLogWeight = () => {
    if (!weight) {
      toast({ title: "Enter your weight", variant: "destructive" });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      toast({ title: "Enter a valid weight (30-300kg)", variant: "destructive" });
      return;
    }

    addWeightEntry({
      date: today,
      weight: weightNum,
      userId: "user1"
    });

    setWeight("");
    toast({ title: "Weight logged!", description: `${weightNum}kg recorded for today` });
  };

  const handleLogCalories = () => {
    if (!calories) {
      toast({ title: "Enter calories", variant: "destructive" });
      return;
    }

    const caloriesNum = parseInt(calories);
    if (isNaN(caloriesNum) || caloriesNum < 50 || caloriesNum > 5000) {
      toast({ title: "Enter valid calories (50-5000)", variant: "destructive" });
      return;
    }

    addCalorieEntry({
      date: today,
      calories: caloriesNum,
      description: mealDescription || `${caloriesNum} calories`,
      mealType: "snack",
      userId: "user1"
    });

    setCalories("");
    setMealDescription("");
    toast({ 
      title: "Calories logged!", 
      description: `+${caloriesNum} calories added to today` 
    });
  };

  return (
    <div className="mobile-container">
      <div className="content-with-bottom-nav p-4 space-y-4">
        
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-white mb-1">Daily Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Log your weight and calories quickly
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="grok-glow-hover">
            <CardContent className="p-4 text-center">
              <Scale className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Today's Weight</p>
              <p className="text-lg font-bold text-white">
                {todayWeight ? `${todayWeight.weight}kg` : "Not logged"}
              </p>
            </CardContent>
          </Card>

          <Card className="grok-glow-hover">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Total Calories</p>
              <p className="text-lg font-bold text-white">
                {todayCalories > 0 ? todayCalories : "0"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weight Logging */}
        <Card className="grok-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Scale className="h-5 w-5 mr-2 text-primary" />
              Log Weight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weight" className="text-sm text-muted-foreground">
                Current Weight (kg)
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="weight"
                  type="number"
                  placeholder="67.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="grok-input flex-1"
                  step="0.1"
                  data-testid="input-weight"
                />
                <Button 
                  onClick={handleLogWeight}
                  className="grok-gradient px-6"
                  data-testid="button-log-weight"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calorie Logging */}
        <Card className="grok-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Log Calories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calories" className="text-sm text-muted-foreground">
                Calories
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="calories"
                  type="number"
                  placeholder="800"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="grok-input"
                  data-testid="input-calories"
                />
                <Button 
                  onClick={handleLogCalories}
                  className="grok-gradient px-6"
                  data-testid="button-log-calories"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="meal-desc" className="text-sm text-muted-foreground">
                What did you eat? (optional)
              </Label>
              <Input
                id="meal-desc"
                placeholder="Chicken rice, protein shake..."
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                className="grok-input mt-1"
                data-testid="input-meal-description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        {todayMeals.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Today's Meals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayMeals.map((meal, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/20"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      {meal.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meal.createdAt || Date.now()).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {meal.calories} cal
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      <BottomNav />
    </div>
  );
}