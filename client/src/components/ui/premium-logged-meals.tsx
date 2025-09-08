import { useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Clock, Zap, Trash2, Edit3, Check, X, Target, TrendingUp, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { calculateTdee } from "@/utils/tdee";

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

interface SwipeState {
  mealId: string;
  startX: number;
  currentX: number;
  isDragging: boolean;
  showDelete: boolean;
}

export function PremiumLoggedMeals() {
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  const [editPortions, setEditPortions] = useState("");
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const userId = "974acc79-f202-4202-bdab-80c4ef55f534";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user's actual calorie target from store
  const { currentTdeeAnalysis, user, weightEntries, calorieEntries } = useUserStore();

  const { data: todaysMeals, isLoading } = useQuery({
    queryKey: ['/api/meal-logs', userId, today],
    queryFn: async (): Promise<MealLog[]> => {
      const response = await fetch(`/api/meal-logs/${userId}/${today}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      return response.json();
    },
    refetchInterval: 10000,
    staleTime: 5000,
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
        description: "Swiped away successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meal-logs', userId, today] });
      setSwipeState(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setSwipeState(null);
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
        title: "Portion updated",
        description: "Changes saved successfully!",
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
  
  // USE stored AI Analysis value as the source of truth  
  // All components must show the same target calories as AI Analysis
  const targetCalories = currentTdeeAnalysis?.targetCalories || 4850; // Use AI Analysis result
  
  // DEBUG: What values are we actually getting?
  console.log('🟠 MEALS:', {
    hasAnalysis: !!currentTdeeAnalysis,
    storedTdee: currentTdeeAnalysis?.tdee,
    storedTargetCalories: currentTdeeAnalysis?.targetCalories,
    usedValue: targetCalories
  });
  
  
  
  const progressPercentage = Math.min((totalCalories / targetCalories) * 100, 100);

  // Swipe handlers
  const handleTouchStart = (mealId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState({
      mealId,
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true,
      showDelete: false
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState?.isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    
    setSwipeState(prev => prev ? {
      ...prev,
      currentX: touch.clientX,
      showDelete: deltaX < -50 // Show delete when swiped left 50px
    } : null);
  };

  const handleTouchEnd = () => {
    if (!swipeState) return;
    
    const deltaX = swipeState.currentX - swipeState.startX;
    
    if (deltaX < -100) {
      // Delete if swiped far enough
      deleteMealMutation.mutate(swipeState.mealId);
    } else {
      // Reset position
      setSwipeState(null);
    }
  };

  const startEdit = (meal: MealLog) => {
    setEditingMeal(meal.id);
    // Extract portion number from description (e.g., "2x Banana" -> "2")
    const portionMatch = meal.description.match(/^(\d+(?:\.\d+)?)\s*x?\s*/);
    setEditPortions(portionMatch ? portionMatch[1] : "1");
  };

  const saveEdit = () => {
    if (!editingMeal) return;
    
    const portions = parseFloat(editPortions);
    if (isNaN(portions) || portions <= 0) {
      toast({
        title: "Invalid portion",
        description: "Please enter a valid portion amount.",
        variant: "destructive",
      });
      return;
    }

    // Find the current meal to get its base calories and description
    const currentMeal = todaysMeals?.find(m => m.id === editingMeal);
    if (!currentMeal) return;

    // Extract base food name (remove existing portion prefix)
    const baseName = currentMeal.description.replace(/^\d+(?:\.\d+)?\s*x?\s*/, '');
    
    // Calculate base calories per portion (assuming current is 1 portion if no prefix)
    const currentPortionMatch = currentMeal.description.match(/^(\d+(?:\.\d+)?)\s*x?\s*/);
    const currentPortions = currentPortionMatch ? parseFloat(currentPortionMatch[1]) : 1;
    const baseCaloriesPerPortion = Math.round(currentMeal.calories / currentPortions);
    
    // Calculate new total calories
    const newCalories = Math.round(baseCaloriesPerPortion * portions);
    const newDescription = portions === 1 ? baseName : `${portions}x ${baseName}`;

    updateMealMutation.mutate({
      mealId: editingMeal,
      updates: {
        description: newDescription,
        calories: newCalories
      }
    });
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditPortions("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTransform = (mealId: string) => {
    if (swipeState?.mealId === mealId && swipeState.isDragging) {
      const deltaX = Math.min(0, swipeState.currentX - swipeState.startX);
      return `translateX(${deltaX}px)`;
    }
    return 'translateX(0px)';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-950/30 via-amber-900/20 to-orange-950/30 border-orange-500/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-orange-800/20 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-950/30 via-amber-900/20 to-orange-950/30 border-orange-500/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Utensils className="h-6 w-6 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Today's Fuel</h3>
              <p className="text-sm text-orange-400/80">Logged meals</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">{totalCalories}</div>
            <div className="text-sm text-orange-400/60">calories</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-orange-500/20">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-orange-400/80 font-medium">Daily Progress</span>
            <div className="flex items-center gap-2 text-orange-400">
              <Target className="h-4 w-4" />
              <span className="font-bold">{Math.round(progressPercentage)}% of {targetCalories}</span>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <AnimatePresence>
          {todaysMeals && todaysMeals.length > 0 ? (
            <div className="space-y-3">
              {todaysMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden"
                >
                  {/* Delete background */}
                  {swipeState?.mealId === meal.id && swipeState.showDelete && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-end pr-6 rounded-xl">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  {/* Main meal card */}
                  <div
                    className={`relative bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-600/30 transition-all duration-200 ${
                      editingMeal === meal.id ? 'ring-2 ring-orange-400/50 shadow-lg shadow-orange-400/20' : 'hover:border-slate-500/50'
                    }`}
                    style={{ transform: getTransform(meal.id) }}
                    onTouchStart={(e) => handleTouchStart(meal.id, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {editingMeal === meal.id ? (
                      // Edit Mode - Simple Fun Portion Editor 
                      <div className="p-4 space-y-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-400 mb-1">🍽️ Edit Portion</div>
                          <div className="text-xs text-slate-400">{meal.description.replace(/^\d+(?:\.\d+)?\s*x?\s*/, '')}</div>
                        </div>
                        
                        {/* Fun Portion Input */}
                        <div className="bg-gradient-to-r from-orange-950/50 to-amber-900/40 rounded-2xl p-4 border border-orange-400/30">
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              onClick={() => setEditPortions(String(Math.max(0.5, parseFloat(editPortions || "1") - 0.5)))}
                              size="sm"
                              variant="outline"
                              className="w-10 h-10 rounded-full border-orange-400/50 text-orange-400 hover:bg-orange-400/10 font-bold text-lg"
                            >
                              −
                            </Button>
                            
                            <div className="text-center">
                              <Input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max="20"
                                value={editPortions}
                                onChange={(e) => setEditPortions(e.target.value)}
                                className="w-20 h-12 text-center text-2xl font-bold bg-transparent border-none text-orange-400 focus:ring-0 focus:border-none"
                                data-testid={`edit-portions-${meal.id}`}
                              />
                              <div className="text-xs text-slate-400 mt-1">portions</div>
                            </div>
                            
                            <Button
                              onClick={() => setEditPortions(String(parseFloat(editPortions || "1") + 0.5))}
                              size="sm"
                              variant="outline"
                              className="w-10 h-10 rounded-full border-orange-400/50 text-orange-400 hover:bg-orange-400/10 font-bold text-lg"
                            >
                              +
                            </Button>
                          </div>
                          
                          {/* Calorie Preview */}
                          <div className="text-center mt-3 p-2 bg-slate-900/50 rounded-lg">
                            <div className="text-sm text-slate-400">New calories</div>
                            <div className="text-lg font-bold text-orange-400">
                              {(() => {
                                const portions = parseFloat(editPortions || "1");
                                const currentPortionMatch = meal.description.match(/^(\d+(?:\.\d+)?)\s*x?\s*/);
                                const currentPortions = currentPortionMatch ? parseFloat(currentPortionMatch[1]) : 1;
                                const baseCaloriesPerPortion = Math.round(meal.calories / currentPortions);
                                return Math.round(baseCaloriesPerPortion * portions);
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={saveEdit}
                            disabled={updateMealMutation.isPending}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-400 to-amber-500 text-black font-medium hover:from-orange-500 hover:to-amber-600 transition-all duration-200 h-12"
                            data-testid={`save-edit-${meal.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {updateMealMutation.isPending ? 'Saving...' : 'Update Portion'}
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            size="sm"
                            variant="outline"
                            className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 h-12 px-4"
                            data-testid={`cancel-edit-${meal.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode - Premium Design
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-white truncate">
                                {meal.description}
                              </div>
                              <Badge 
                                variant="outline" 
                                className="border-orange-400/30 text-orange-400 bg-orange-400/5 text-xs font-medium shrink-0"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                {meal.calories}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                {formatTime(meal.createdAt)}
                              </div>
                              {meal.protein && (
                                <div className="text-xs text-slate-400">
                                  {meal.protein}g protein
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => startEdit(meal)}
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-orange-400 hover:bg-orange-400/10 ml-2 shrink-0"
                            data-testid={`edit-meal-${meal.id}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-400/30">
                <Utensils className="h-8 w-8 text-orange-400/60" />
              </div>
              <p className="text-white text-sm">No meals logged yet today</p>
              <p className="text-orange-400/60 text-xs mt-1">Start by using the Ultra-Fast Logger above</p>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        {todaysMeals && todaysMeals.length > 0 && (
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <TrendingUp className="h-3 w-3" />
                <span>Daily Target: {targetCalories.toLocaleString()} cal</span>
              </div>
              <div className={`font-medium ${progressPercentage >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}