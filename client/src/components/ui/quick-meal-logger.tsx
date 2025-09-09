import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Plus,
  Zap,
  Clock,
  ChefHat,
  ScanLine,
  X,
  Minus
} from "lucide-react";
import { BarcodeScannerModal } from "./barcode-scanner-modal";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface QuickMealLoggerProps {
  userId: string;
}

export function QuickMealLogger({ userId }: QuickMealLoggerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Array<{ item: FoodItem; quantity: number }>>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick food search with debounce
  const { data: foods = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/foods/search', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Common foods for quick access
  const commonFoods = [
    { name: "Peanut Butter", calories: 188, search: "peanut butter" },
    { name: "Whole Egg", calories: 70, search: "whole egg" },
    { name: "Banana", calories: 89, search: "banana" },
    { name: "Protein Powder", calories: 120, search: "protein powder" },
    { name: "Chicken Breast", calories: 165, search: "chicken breast" },
    { name: "Olive Oil", calories: 884, search: "olive oil" },
    { name: "White Rice", calories: 130, search: "white rice cooked" },
    { name: "Oats", calories: 154, search: "oats" }
  ];

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
    onSuccess: () => {
      toast({
        title: "Meal logged!",
        description: `Added ${Math.round(totals.calories)} calories to your daily intake.`,
      });
      setSelectedFoods([]);
      setSearchQuery('');
      setIsExpanded(false);
      // Invalidate today's meals to refresh the display
      queryClient.invalidateQueries({ 
        queryKey: ['/api/meal-logs', userId, new Date().toISOString().split('T')[0]] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to log meal",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const quickAddFood = async (searchTerm: string, estimatedCals: number) => {
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchTerm)}`);
      const foods = await response.json();
      
      if (foods.length > 0) {
        const food = foods[0]; // Use first result
        addFood(food, 1);
      } else {
        // Fallback for quick logging
        const fallbackFood: FoodItem = {
          id: `quick-${Date.now()}`,
          name: searchTerm,
          calories: estimatedCals,
          protein: Math.round(estimatedCals * 0.15 / 4), // Estimate
          carbs: Math.round(estimatedCals * 0.5 / 4),
          fat: Math.round(estimatedCals * 0.35 / 9),
          serving: "1 serving"
        };
        addFood(fallbackFood, 1);
      }
    } catch (error) {
      
    }
  };

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

  const logMeal = () => {
    if (selectedFoods.length === 0) return;

    const mealData = {
      userId,
      logDate: new Date().toISOString().split('T')[0],
      mealType: 'logged',
      description: selectedFoods.map(f => `${f.item.name} (${f.quantity}x)`).join(', '),
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      foods: selectedFoods.map(f => ({
        name: f.item.name,
        quantity: f.quantity,
        calories: Math.round(f.item.calories * f.quantity),
        protein: Math.round(f.item.protein * f.quantity),
        carbs: Math.round(f.item.carbs * f.quantity),
        fat: Math.round(f.item.fat * f.quantity)
      }))
    };

    logMealMutation.mutate(mealData);
  };

  const totals = selectedFoods.reduce(
    (acc, { item, quantity }) => ({
      calories: acc.calories + (item.calories * quantity),
      protein: acc.protein + (item.protein * quantity),
      carbs: acc.carbs + (item.carbs * quantity),
      fat: acc.fat + (item.fat * quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Card className="bg-slate-800/50 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-primary">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Quick Meal Logger
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:bg-primary/20"
          >
            {isExpanded ? 'Simple' : 'Advanced'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instant Log Buttons - One-click logging */}
        <div>
          <Label className="text-primary mb-2 block">Instant Log (1-Click)</Label>
          <div className="grid grid-cols-2 gap-2">
            {commonFoods.slice(0, isExpanded ? 8 : 4).map((food) => (
              <Button
                key={food.name}
                variant="outline"
                size="sm"
                onClick={async () => {
                  // Instant log without adding to basket
                  const mealData = {
                    userId,
                    logDate: new Date().toISOString().split('T')[0],
                    mealType: 'instant',
                    description: food.name,
                    calories: food.calories,
                    protein: Math.round(food.calories * 0.15 / 4),
                    carbs: Math.round(food.calories * 0.5 / 4),
                    fat: Math.round(food.calories * 0.35 / 9),
                    foods: [{
                      name: food.name,
                      quantity: 1,
                      calories: food.calories,
                      protein: Math.round(food.calories * 0.15 / 4),
                      carbs: Math.round(food.calories * 0.5 / 4),
                      fat: Math.round(food.calories * 0.35 / 9)
                    }]
                  };
                  logMealMutation.mutate(mealData);
                }}
                disabled={logMealMutation.isPending}
                className="h-auto p-2 flex flex-col border-primary/30 hover:bg-primary/20 hover:border-primary text-left"
                data-testid={`instant-log-${food.name.toLowerCase().replace(' ', '-')}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium text-white">{food.name}</span>
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs mt-1 self-start px-1.5 py-0">
                  {food.calories} cal
                </Badge>
              </Button>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Click to instantly log calories (no basket needed)
          </div>
        </div>

        {/* Quick Add to Basket */}
        {isExpanded && (
          <div>
            <Label className="text-primary mb-2 block">Add to Basket</Label>
            <div className="grid grid-cols-3 gap-2">
              {commonFoods.slice(4).map((food) => (
                <Button
                  key={food.name}
                  variant="outline"
                  size="sm"
                  onClick={() => quickAddFood(food.search, food.calories)}
                  className="justify-start text-xs border-slate-600 hover:bg-slate-700"
                  data-testid={`quick-add-${food.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {food.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBarcodeScanner(true)}
            className="flex-1 border-primary/30 text-primary hover:bg-primary/20"
            data-testid="button-scan-barcode"
          >
            <ScanLine className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            data-testid="button-search-foods"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Search (when expanded) */}
        {isExpanded && (
          <div>
            <Label htmlFor="food-search" className="text-primary mb-2 block">Search Foods</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="food-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search foods..."
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                data-testid="input-food-search"
              />
            </div>

            {/* Search Results */}
            {searchQuery.length > 2 && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4 text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Searching...
                  </div>
                ) : (foods as FoodItem[]).length > 0 ? (
                  (foods as FoodItem[]).slice(0, 5).map((food: FoodItem) => (
                    <div key={food.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{food.name}</div>
                        <div className="text-xs text-slate-400">
                          {food.calories} cal • {food.protein}g protein
                        </div>
                      </div>
                      <Button
                        onClick={() => addFood(food)}
                        size="sm"
                        className="bg-primary text-black hover:bg-primary/90 px-2 py-1 text-xs"
                        data-testid={`button-add-${food.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-slate-400 text-sm">
                    No foods found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <div>
            <Label className="text-primary mb-2 block">
              Selected Foods ({Math.round(totals.calories)} cal)
            </Label>
            <div className="space-y-2">
              {selectedFoods.map(({ item, quantity }, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      {Math.round(item.calories * quantity)} cal
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 border-slate-600"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-white text-sm w-8 text-center">{quantity}</span>
                    <Button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 border-slate-600"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => removeFood(item.id)}
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 border-red-500/50 text-red-400 hover:bg-red-500/20 ml-1"
                      data-testid={`button-remove-${item.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Button */}
        {selectedFoods.length > 0 && (
          <Button
            onClick={logMeal}
            disabled={logMealMutation.isPending}
            className="w-full bg-primary text-black hover:bg-primary/90 disabled:bg-slate-600"
            data-testid="button-log-meal"
          >
            {logMealMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Logging...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Log {Math.round(totals.calories)} Calories
              </>
            )}
          </Button>
        )}
      </CardContent>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onFoodFound={(food) => addFood(food, 1)}
      />
    </Card>
  );
}