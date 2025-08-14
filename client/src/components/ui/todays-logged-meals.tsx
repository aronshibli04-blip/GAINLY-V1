import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, Zap } from "lucide-react";

interface MealLog {
  id: string;
  userId: string;
  calories: number;
  description: string;
  logDate: string;
  createdAt: string;
}

export function TodaysLoggedMeals() {
  const today = new Date().toISOString().split('T')[0];
  const userId = "974acc79-f202-4202-bdab-80c4ef55f534"; // Using the existing user

  const { data: todaysMeals, isLoading } = useQuery({
    queryKey: ['/api/meal-logs', userId, today],
    queryFn: async (): Promise<MealLog[]> => {
      const response = await fetch(`/api/meal-logs/${userId}/${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      return response.json();
    },
  });

  const totalCalories = todaysMeals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            Loading today's meals...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-primary">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Logged Meals
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            {totalCalories} cal
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysMeals && todaysMeals.length > 0 ? (
          <>
            {todaysMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">
                    {meal.description}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(meal.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {meal.calories} cal
                </Badge>
              </div>
            ))}
            
            {/* Daily Progress */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Daily Total</span>
                <span className="font-bold text-primary">{totalCalories} calories</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Target: 6000 cal</span>
                <span>{Math.round((totalCalories / 6000) * 100)}% complete</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No meals logged today</p>
            <p className="text-xs">Use the meal logger above to track your food</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}