import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { Coffee, Sun, Sunset, Moon } from "lucide-react";

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealTypeTabsProps {
  selectedMealType: MealType;
  onMealTypeChange: (mealType: MealType) => void;
}

export function MealTypeTabsComponent({ selectedMealType, onMealTypeChange }: MealTypeTabsProps) {
  const { calorieEntries } = useUserStore();
  const today = new Date().toISOString().split('T')[0];
  
  // Get current time to auto-select appropriate meal type
  const getCurrentMealType = (): MealType => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch'; 
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  };
  
  // Auto-select meal type based on time on mount
  useEffect(() => {
    const currentMeal = getCurrentMealType();
    onMealTypeChange(currentMeal);
  }, []);
  
  // Calculate calories logged for each meal type today
  const getMealCalories = (mealType: MealType) => {
    return calorieEntries
      ?.filter(entry => 
        entry.date === today && 
        entry.description?.toLowerCase().includes(mealType)
      )
      ?.reduce((sum, entry) => sum + entry.calories, 0) || 0;
  };
  
  const mealTypes = [
    { 
      id: 'breakfast' as MealType, 
      label: 'Breakfast', 
      icon: Coffee,
      calories: getMealCalories('breakfast'),
      timeRange: '6-11am'
    },
    { 
      id: 'lunch' as MealType, 
      label: 'Lunch', 
      icon: Sun,
      calories: getMealCalories('lunch'),
      timeRange: '11am-4pm'
    },
    { 
      id: 'dinner' as MealType, 
      label: 'Dinner', 
      icon: Sunset,
      calories: getMealCalories('dinner'),
      timeRange: '4-10pm'
    },
    { 
      id: 'snack' as MealType, 
      label: 'Snack', 
      icon: Moon,
      calories: getMealCalories('snack'),
      timeRange: 'Anytime'
    }
  ];
  
  const currentMealType = getCurrentMealType();
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">Meal Type</h3>
        <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-500/10">
          Current: {mealTypes.find(m => m.id === currentMealType)?.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map((meal) => {
          const Icon = meal.icon;
          const isSelected = selectedMealType === meal.id;
          const isCurrent = currentMealType === meal.id;
          
          return (
            <Button
              key={meal.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onMealTypeChange(meal.id)}
              className={`
                h-auto p-4 flex flex-col items-center space-y-2
                ${isSelected 
                  ? 'bg-orange-500 hover:bg-orange-600 text-black border-orange-400' 
                  : 'border-slate-600 hover:border-orange-400/50 hover:bg-orange-500/10'
                }
                ${isCurrent && !isSelected ? 'ring-2 ring-orange-400/50' : ''}
              `}
              data-testid={`meal-tab-${meal.id}`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`h-5 w-5 ${isSelected ? 'text-black' : 'text-orange-400'}`} />
                <span className={`font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                  {meal.label}
                </span>
              </div>
              
              <div className="text-center">
                <div className={`text-sm ${isSelected ? 'text-black/80' : 'text-gray-400'}`}>
                  {meal.calories > 0 ? `${meal.calories} kcal` : meal.timeRange}
                </div>
              </div>
              
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}