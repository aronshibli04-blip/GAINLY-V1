import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Minus, 
  X, 
  ShoppingCart, 
  Utensils, 
  Clock,
  Zap,
  Star,
  ChefHat
} from "lucide-react";
import type { FoodItem, MealLog } from "@shared/schema";

interface SelectedFood {
  item: FoodItem;
  quantity: number;
  servingSize?: string;
}

interface ImprovedMealLoggerProps {
  userId: string;
}

export function ImprovedMealLogger({ userId }: ImprovedMealLoggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Common serving sizes for easier portion control
  const servingSizes = [
    { label: "Small", multiplier: 0.5 },
    { label: "Regular", multiplier: 1 },
    { label: "Large", multiplier: 1.5 },
    { label: "XL", multiplier: 2 }
  ];

  // Quick add popular hardgainer foods
  const quickFoods = [
    { name: "Whole Milk", calories: 150, protein: 8, portion: "1 cup" },
    { name: "Peanut Butter", calories: 190, protein: 8, portion: "2 tbsp" },
    { name: "Banana", calories: 105, protein: 1, portion: "1 medium" },
    { name: "Oats", calories: 150, protein: 5, portion: "1/2 cup dry" },
    { name: "Chicken Breast", calories: 185, protein: 35, portion: "100g" },
    { name: "White Rice", calories: 130, protein: 3, portion: "1/3 cup dry" },
    { name: "Olive Oil", calories: 120, protein: 0, portion: "1 tbsp" },
    { name: "Eggs", calories: 140, protein: 12, portion: "2 large" }
  ];

  // Search foods with debouncing
  const { data: foods = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/foods/search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate totals
  const totals = selectedFoods.reduce((acc, { item, quantity }) => ({
    calories: acc.calories + ((item.calories || 0) * quantity),
    protein: acc.protein + ((item.protein || 0) * quantity),
    carbs: acc.carbs + ((item.carbs || 0) * quantity),
    fat: acc.fat + ((item.fat || 0) * quantity)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Save meal mutation
  const saveMealMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Create individual meal logs for each food
      const mealLogs = selectedFoods.map(({ item, quantity }) => ({
        userId,
        date: today,
        mealType,
        foodId: item.id,
        foodName: item.name,
        quantity,
        calories: Math.round((item.calories || 0) * quantity),
        protein: Math.round((item.protein || 0) * quantity),
        carbs: Math.round((item.carbs || 0) * quantity),
        fat: Math.round((item.fat || 0) * quantity)
      }));

      // Save all at once
      const responses = await Promise.all(
        mealLogs.map(log => 
          fetch('/api/meal-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
          })
        )
      );

      if (!responses.every(r => r.ok)) {
        throw new Error('Failed to save some meal logs');
      }

      return mealLogs;
    },
    onSuccess: () => {
      toast({
        title: "Meal Logged Successfully!",
        description: `Added ${selectedFoods.length} foods (${Math.round(totals.calories)} calories)`
      });
      setSelectedFoods([]);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ['/api/meal-logs'] });
    },
    onError: () => {
      toast({
        title: "Error saving meal",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  // Add food to cart
  const addFood = (food: FoodItem, quantity: number = 1) => {
    setSelectedFoods(prev => {
      const existing = prev.find(f => f.item.id === food.id);
      if (existing) {
        return prev.map(f => 
          f.item.id === food.id 
            ? { ...f, quantity: f.quantity + quantity }
            : f
        );
      }
      return [...prev, { item: food, quantity }];
    });
  };

  // Quick add from predefined foods
  const quickAddFood = (quickFood: { name: string; calories: number; protein: number; portion: string }) => {
    const foodItem: FoodItem = {
      id: `quick-${Date.now()}`,
      name: quickFood.name,
      calories: quickFood.calories,
      protein: quickFood.protein,
      carbs: 0,
      fat: 0,
      servingSize: quickFood.portion,
      category: 'common'
    };
    addFood(foodItem);
  };

  const updateQuantity = (foodId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFood(foodId);
      return;
    }
    setSelectedFoods(prev =>
      prev.map(f => f.item.id === foodId ? { ...f, quantity: newQuantity } : f)
    );
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(f => f.item.id !== foodId));
  };

  const setServingSize = (foodId: string, multiplier: number) => {
    setSelectedFoods(prev =>
      prev.map(f => f.item.id === foodId ? { ...f, quantity: multiplier } : f)
    );
  };

  return (
    <Card className="meals-glow-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400">Quick Meal Logger</span>
          </div>
          {selectedFoods.length > 0 && (
            <Badge variant="secondary" className="bg-orange-400/20 text-orange-400">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {selectedFoods.length} items
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Meal Type Selection */}
        <div className="flex gap-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <Button
              key={type}
              onClick={() => setMealType(type)}
              variant={mealType === type ? "default" : "outline"}
              size="sm"
              className={mealType === type ? "bg-orange-400 text-black" : ""}
              data-testid={`button-meal-type-${type}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Quick Add Popular Foods */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Quick Add (Hardgainer Favorites)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickFoods.map((food) => (
              <Button
                key={food.name}
                onClick={() => quickAddFood(food)}
                variant="outline"
                size="sm"
                className="h-auto p-2 flex flex-col items-start text-left hover:bg-orange-400/10 hover:border-orange-400/40"
                data-testid={`button-quick-add-${food.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="font-medium text-white text-xs">{food.name}</div>
                <div className="text-xs text-muted-foreground">{food.portion}</div>
                <div className="text-xs text-orange-400">{food.calories} cal</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Food Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods..."
              className="pl-10 grok-input"
              data-testid="input-food-search"
            />
          </div>
          
          {isSearching && (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}

          {foods.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {foods.slice(0, 5).map((food) => (
                <div 
                  key={food.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/20 cursor-pointer"
                  onClick={() => addFood(food)}
                  data-testid={`food-item-${food.id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{food.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {food.calories || 0} cal • {food.protein || 0}g protein
                      {food.servingSize && ` • ${food.servingSize}`}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Foods Cart */}
        {selectedFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                Selected Foods ({Math.round(totals.calories)} cal)
              </span>
              <Button
                onClick={() => setSelectedFoods([])}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-500/50 hover:bg-red-500/20"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2">
              {selectedFoods.map(({ item, quantity }, index) => (
                <div key={`${item.id}-${index}`} className="p-3 bg-muted/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(item.calories * quantity)} cal • {Math.round(item.protein * quantity)}g protein
                      </div>
                    </div>
                    <Button
                      onClick={() => removeFood(item.id)}
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 border-red-500/50 text-red-400 hover:bg-red-500/20"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Serving Size Quick Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {servingSizes.map((size) => (
                        <Button
                          key={size.label}
                          onClick={() => setServingSize(item.id, size.multiplier)}
                          variant={Math.abs(quantity - size.multiplier) < 0.1 ? "default" : "outline"}
                          size="sm"
                          className="h-6 text-xs px-2"
                        >
                          {size.label}
                        </Button>
                      ))}
                    </div>

                    {/* Precise Quantity Control */}
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => updateQuantity(item.id, Math.max(0.1, quantity - 0.5))}
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-white text-sm w-12 text-center font-mono">
                        {quantity.toFixed(1)}
                      </span>
                      <Button
                        onClick={() => updateQuantity(item.id, quantity + 0.5)}
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Summary */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-orange-400/10 rounded-lg border border-orange-400/20">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">{Math.round(totals.calories)}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{Math.round(totals.protein)}</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{Math.round(totals.carbs)}</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{Math.round(totals.fat)}</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={() => saveMealMutation.mutate()}
              disabled={saveMealMutation.isPending}
              className="w-full grok-gradient h-12 text-black font-bold"
              data-testid="button-save-meal"
            >
              <Utensils className="h-5 w-5 mr-2" />
              {saveMealMutation.isPending ? "Saving..." : `Log ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}