import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Clock, Utensils, Zap, Trash2, Edit3, Check, X, GripVertical } from "lucide-react";

interface MealLog {
  id: string;
  userId: string;
  calories: number;
  description: string;
  logDate: string;
  createdAt: string;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export function TodaysLoggedMeals() {
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ description: '', calories: '' });
  const [swipeStates, setSwipeStates] = useState<Record<string, 'idle' | 'swiping' | 'swiped'>>({});
  const today = new Date().toISOString().split('T')[0];
  const userId = "974acc79-f202-4202-bdab-80c4ef55f534";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todaysMeals, isLoading } = useQuery({
    queryKey: ['/api/meal-logs', userId, today],
    queryFn: async (): Promise<MealLog[]> => {
      const response = await fetch(`/api/meal-logs/${userId}/${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const response = await fetch(`/api/meal-logs/${mealId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete meal');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your log.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meal-logs', userId, today] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update meal mutation
  const updateMealMutation = useMutation({
    mutationFn: async ({ mealId, updates }: { mealId: string; updates: any }) => {
      const response = await fetch(`/api/meal-logs/${mealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update meal');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meal updated",
        description: "Your changes have been saved.",
      });
      setEditingMeal(null);
      queryClient.invalidateQueries({ queryKey: ['/api/meal-logs', userId, today] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalCalories = todaysMeals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

  const startEdit = (meal: MealLog) => {
    setEditingMeal(meal.id);
    setEditValues({
      description: meal.description,
      calories: meal.calories.toString()
    });
  };

  const saveEdit = () => {
    if (!editingMeal) return;
    
    const calories = parseInt(editValues.calories);
    if (isNaN(calories) || calories < 0) {
      toast({
        title: "Invalid calories",
        description: "Please enter a valid number of calories.",
        variant: "destructive",
      });
      return;
    }

    updateMealMutation.mutate({
      mealId: editingMeal,
      updates: {
        description: editValues.description.trim(),
        calories: calories
      }
    });
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditValues({ description: '', calories: '' });
  };

  const handleDelete = (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMealMutation.mutate(mealId);
    }
  };

  const handleTouchStart = (mealId: string, e: React.TouchEvent) => {
    setSwipeStates(prev => ({ ...prev, [mealId]: 'swiping' }));
  };

  const handleTouchEnd = (mealId: string, e: React.TouchEvent) => {
    setSwipeStates(prev => ({ ...prev, [mealId]: 'idle' }));
  };

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
              <div 
                key={meal.id} 
                className={`relative overflow-hidden bg-slate-700/30 rounded-lg transition-all ${
                  editingMeal === meal.id ? 'ring-2 ring-primary/50' : ''
                }`}
                onTouchStart={(e) => handleTouchStart(meal.id, e)}
                onTouchEnd={(e) => handleTouchEnd(meal.id, e)}
              >
                {editingMeal === meal.id ? (
                  // Edit Mode
                  <div className="p-3 space-y-3">
                    <div>
                      <Input
                        value={editValues.description}
                        onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Meal description"
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        data-testid={`edit-description-${meal.id}`}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={editValues.calories}
                        onChange={(e) => setEditValues(prev => ({ ...prev, calories: e.target.value }))}
                        placeholder="Calories"
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        data-testid={`edit-calories-${meal.id}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEdit}
                        disabled={updateMealMutation.isPending}
                        size="sm"
                        className="flex-1 bg-primary text-black hover:bg-primary/90"
                        data-testid={`save-edit-${meal.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {updateMealMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        data-testid={`cancel-edit-${meal.id}`}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode with Swipe Actions
                  <div className="relative">
                    {/* Main Content */}
                    <div className="flex items-center justify-between p-3 group">
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

                      {/* Action Buttons (visible on hover/touch) */}
                      <div className="hidden group-hover:flex absolute right-3 top-1/2 transform -translate-y-1/2 gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(meal)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                          data-testid={`edit-meal-${meal.id}`}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(meal.id)}
                          disabled={deleteMealMutation.isPending}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          data-testid={`delete-meal-${meal.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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