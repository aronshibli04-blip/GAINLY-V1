import { useState } from "react";
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
  Scale
} from "lucide-react";
import type { FoodItem, MealLog } from "@shared/schema";

interface SelectedFood {
  item: FoodItem;
  grams: number;
}

interface GramMealLoggerProps {
  userId: string;
}

export function GramMealLogger({ userId }: GramMealLoggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search foods
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

  // Calculate totals based on grams (per 100g values)
  const totals = selectedFoods.reduce((acc, { item, grams }) => {
    const multiplier = grams / 100;
    return {
      calories: acc.calories + (Number(item.calories || 0) * multiplier),
      protein: acc.protein + (Number(item.protein || 0) * multiplier),
      carbs: acc.carbs + (Number(item.carbs || 0) * multiplier),
      fat: acc.fat + (Number(item.fat || 0) * multiplier)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Save meal mutation
  const saveMealMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const mealLogs = selectedFoods.map(({ item, grams }) => {
        const multiplier = grams / 100;
        return {
          userId,
          logDate: today,
          calories: Math.round(Number(item.calories || 0) * multiplier),
          description: `${item.name} (${grams}g) - ${mealType}`
        };
      });

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

  const addFood = (food: FoodItem, grams: number = 100) => {
    setSelectedFoods(prev => {
      const existing = prev.find(f => f.item.id === food.id);
      if (existing) {
        return prev.map(f => 
          f.item.id === food.id 
            ? { ...f, grams: f.grams + grams }
            : f
        );
      }
      return [...prev, { item: food, grams }];
    });
  };

  const updateGrams = (foodId: string, grams: number) => {
    if (grams <= 0) {
      removeFood(foodId);
      return;
    }
    setSelectedFoods(prev =>
      prev.map(f => 
        f.item.id === foodId 
          ? { ...f, grams }
          : f
      )
    );
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(f => f.item.id !== foodId));
  };

  return (
    <Card className="meals-glow-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400">Gram-Based Meal Logger</span>
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

        {/* Food Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for foods (rice, chicken, etc.)"
            className="pl-10 grok-input"
            data-testid="input-food-search"
          />
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-4 text-muted-foreground">
            Searching for foods...
          </div>
        )}
        
        {foods.length > 0 && (
          <Card className="bg-muted/20 border-orange-400/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-400">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {foods.slice(0, 6).map((food: FoodItem) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/70 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{food.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {food.calories} cal • {food.protein}g protein (per 100g)
                      </p>
                    </div>
                    <Button
                      onClick={() => addFood(food)}
                      variant="outline"
                      size="sm"
                      className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10"
                      data-testid={`button-add-food-${food.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <Card className="bg-muted/20 border-orange-400/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Selected Foods ({Math.round(totals.calories)} cal)
                </span>
                <Button
                  onClick={() => setSelectedFoods([])}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-orange-400"
                  data-testid="button-clear-cart"
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedFoods.map((selectedFood) => {
                const multiplier = selectedFood.grams / 100;
                return (
                  <div
                    key={selectedFood.item.id}
                    className="flex flex-col gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                    data-testid={`selected-food-${selectedFood.item.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{selectedFood.item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(Number(selectedFood.item.calories || 0) * multiplier)} cal •{' '}
                          {Math.round(Number(selectedFood.item.protein || 0) * multiplier)}g protein
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => removeFood(selectedFood.item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                        data-testid={`button-remove-${selectedFood.item.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Gram Input */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => updateGrams(selectedFood.item.id, Math.max(10, selectedFood.grams - 25))}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                        data-testid={`button-decrease-${selectedFood.item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={selectedFood.grams}
                        onChange={(e) => updateGrams(selectedFood.item.id, Number(e.target.value))}
                        className="h-7 w-20 text-xs text-center font-mono"
                        min="1"
                        max="2000"
                        data-testid={`input-grams-${selectedFood.item.id}`}
                      />
                      <span className="text-xs text-muted-foreground">grams</span>
                      <Button
                        onClick={() => updateGrams(selectedFood.item.id, selectedFood.grams + 25)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                        data-testid={`button-increase-${selectedFood.item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

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
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}