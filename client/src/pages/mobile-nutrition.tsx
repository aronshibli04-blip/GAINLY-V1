import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { Apple, Beef, Coffee, Droplets, Zap, TrendingUp, Target, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function MobileNutrition() {
  const { toast } = useToast();
  const { openMenu } = useMenu();
  const { 
    user,
    weightEntries, 
    calorieEntries,
    currentTdeeAnalysis
  } = useUserStore();

  // Calculate today's nutrition
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = calorieEntries.filter(entry => entry.date === today);
  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = currentTdeeAnalysis?.targetCalories || 3500;
  const calorieProgress = (todayCalories / targetCalories) * 100;

  // High-calorie food recommendations for hardgainers
  const highCalorieFoods = [
    { name: "Peanut Butter", calories: "588 kcal/100g", icon: "🥜", category: "Protein & Fat" },
    { name: "Olive Oil", calories: "884 kcal/100g", icon: "🫒", category: "Healthy Fats" },
    { name: "Whole Milk", calories: "61 kcal/100ml", icon: "🥛", category: "Liquid Calories" },
    { name: "Pasta", calories: "131 kcal/100g", icon: "🍝", category: "Carbs" },
    { name: "Nuts & Seeds", calories: "550+ kcal/100g", icon: "🌰", category: "Snacks" },
    { name: "Protein Shake", calories: "400+ kcal/serving", icon: "🥤", category: "Liquid Calories" },
    { name: "Rice", calories: "130 kcal/100g", icon: "🍚", category: "Carbs" },
    { name: "Avocado", calories: "160 kcal/100g", icon: "🥑", category: "Healthy Fats" }
  ];

  // Hardgainer meal timing tips
  const mealTips = [
    {
      title: "Start with Liquid Calories",
      description: "Smoothies and shakes are easier to consume and digest",
      icon: <Droplets className="h-5 w-5" />
    },
    {
      title: "Eat Every 2-3 Hours",
      description: "5-6 smaller meals instead of 3 large ones",
      icon: <Utensils className="h-5 w-5" />
    },
    {
      title: "Add Healthy Fats",
      description: "Olive oil, nuts, and avocado boost calories quickly",
      icon: <Zap className="h-5 w-5" />
    },
    {
      title: "Pre/Post Workout Nutrition",
      description: "Time your largest meals around training",
      icon: <TrendingUp className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-950 to-yellow-950">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <MobileHeader 
          title="Nutrition Guide"
          onOpenMenu={openMenu}
        />

        <div className="px-4 pb-24 space-y-6">
          {/* Today's Progress */}
          <Card className="bg-black/40 border-orange-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-400" />
                Today's Calorie Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-orange-200">Progress</span>
                  <span className="text-orange-400 font-semibold">
                    {todayCalories} / {targetCalories} kcal
                  </span>
                </div>
                <Progress 
                  value={calorieProgress} 
                  className="h-3 bg-orange-950/50"
                />
                <div className="text-center">
                  <Badge 
                    variant={calorieProgress >= 100 ? "default" : "secondary"}
                    className={calorieProgress >= 100 
                      ? "bg-green-600 text-white" 
                      : "bg-orange-600 text-white"
                    }
                  >
                    {calorieProgress >= 100 ? "Target Reached!" : `${Math.round(calorieProgress)}% Complete`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High-Calorie Foods */}
          <Card className="bg-black/40 border-orange-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-100 flex items-center gap-2">
                <Beef className="h-5 w-5 text-orange-400" />
                High-Calorie Foods for Hardgainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {highCalorieFoods.map((food, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-950/30 rounded-lg border border-orange-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{food.icon}</span>
                      <div>
                        <p className="text-orange-100 font-medium">{food.name}</p>
                        <p className="text-orange-300 text-sm">{food.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-orange-600 text-orange-200">
                      {food.calories}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hardgainer Tips */}
          <Card className="bg-black/40 border-orange-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-100 flex items-center gap-2">
                <Coffee className="h-5 w-5 text-orange-400" />
                Hardgainer Meal Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealTips.map((tip, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-orange-950/30 rounded-lg border border-orange-800/30"
                  >
                    <div className="text-orange-400 mt-1">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="text-orange-100 font-medium">{tip.title}</h4>
                      <p className="text-orange-300 text-sm mt-1">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-black/40 border-orange-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white h-12"
                  onClick={() => window.location.href = '/meals'}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Log Meal
                </Button>
                <Button 
                  variant="outline"
                  className="border-orange-600 text-orange-200 hover:bg-orange-950/50 h-12"
                  onClick={() => {
                    toast({ 
                      title: "Meal Plan Coming Soon!",
                      description: "AI-powered meal plans are being developed"
                    });
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Get Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}