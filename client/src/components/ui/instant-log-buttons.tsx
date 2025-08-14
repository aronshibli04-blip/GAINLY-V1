import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Zap, Clock } from "lucide-react";

interface InstantLogButtonsProps {
  userId: string;
}

const INSTANT_FOODS = [
  { name: "Protein Shake", calories: 400, protein: 25, carbs: 45, fat: 8 },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Peanut Butter Sandwich", calories: 375, protein: 14, carbs: 32, fat: 24 },
  { name: "Greek Yogurt", calories: 130, protein: 15, carbs: 9, fat: 5 },
  { name: "Handful of Nuts", calories: 160, protein: 6, carbs: 6, fat: 14 },
  { name: "Glass of Milk", calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: "Energy Bar", calories: 250, protein: 10, carbs: 30, fat: 12 },
  { name: "Avocado Toast", calories: 300, protein: 10, carbs: 25, fat: 18 }
];

export function InstantLogButtons({ userId }: InstantLogButtonsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      const response = await fetch('/api/meal-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });
      if (!response.ok) throw new Error('Failed to log meal');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Quick logged!",
        description: `Added ${variables.calories} calories instantly.`,
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/meal-logs', userId, new Date().toISOString().split('T')[0]] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to log",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const quickLog = (food: typeof INSTANT_FOODS[0]) => {
    const mealData = {
      userId,
      logDate: new Date().toISOString().split('T')[0],
      mealType: 'quick',
      description: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      foods: [{
        name: food.name,
        quantity: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      }]
    };

    logMealMutation.mutate(mealData);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {INSTANT_FOODS.slice(0, 6).map((food) => (
        <Button
          key={food.name}
          variant="outline"
          size="sm"
          onClick={() => quickLog(food)}
          disabled={logMealMutation.isPending}
          className="h-auto p-3 flex flex-col items-start text-left border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all"
          data-testid={`instant-log-${food.name.toLowerCase().replace(' ', '-')}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-medium text-sm text-white">{food.name}</span>
            <Plus className="h-3 w-3 text-primary flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs px-2 py-0">
              <Zap className="h-2 w-2 mr-1" />
              {food.calories}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 border-primary/30">
              {food.protein}g
            </Badge>
          </div>
        </Button>
      ))}
    </div>
  );
}