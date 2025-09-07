import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Plus, 
  Clock, 
 
  Mic,
  MicOff,
  Copy,
  Star,
  Search,
  ChefHat,
  Target,
  Camera,
  ScanLine
} from "lucide-react";
import type { FoodItem } from "@shared/schema";

interface QuickFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  defaultAmount: number;
  unit: 'g' | 'piece';
  emoji: string;
  category: 'protein' | 'carbs' | 'fats' | 'liquid';
}

interface RecentFood extends QuickFood {
  lastUsed: Date;
  frequency: number;
}

const HARDGAINER_QUICK_FOODS: QuickFood[] = [
  { id: 'rice-200g', name: 'Rice (cooked)', calories: 260, protein: 5, defaultAmount: 200, unit: 'g', emoji: '🍚', category: 'carbs' },
  { id: 'chicken-150g', name: 'Chicken Breast', calories: 247, protein: 46, defaultAmount: 150, unit: 'g', emoji: '🍗', category: 'protein' },
  { id: 'pasta-200g', name: 'Pasta (cooked)', calories: 220, protein: 8, defaultAmount: 200, unit: 'g', emoji: '🍝', category: 'carbs' },
  { id: 'beef-150g', name: 'Ground Beef', calories: 332, protein: 30, defaultAmount: 150, unit: 'g', emoji: '🥩', category: 'protein' },
  { id: 'eggs-2', name: 'Eggs', calories: 140, protein: 12, defaultAmount: 2, unit: 'piece', emoji: '🥚', category: 'protein' },
  { id: 'bread-2', name: 'Bread Slices', calories: 160, protein: 6, defaultAmount: 2, unit: 'piece', emoji: '🍞', category: 'carbs' },
  { id: 'milk-250ml', name: 'Whole Milk', calories: 153, protein: 8, defaultAmount: 250, unit: 'g', emoji: '🥛', category: 'liquid' },
  { id: 'banana-1', name: 'Banana', calories: 89, protein: 1, defaultAmount: 1, unit: 'piece', emoji: '🍌', category: 'carbs' },
  { id: 'peanut-butter-30g', name: 'Peanut Butter', calories: 176, protein: 8, defaultAmount: 30, unit: 'g', emoji: '🥜', category: 'fats' },
  { id: 'oats-80g', name: 'Oats (dry)', calories: 303, protein: 10, defaultAmount: 80, unit: 'g', emoji: '🥣', category: 'carbs' },
  { id: 'protein-shake-1', name: 'Protein Shake', calories: 400, protein: 35, defaultAmount: 1, unit: 'piece', emoji: '🥤', category: 'liquid' },
  { id: 'olive-oil-15ml', name: 'Olive Oil', calories: 135, protein: 0, defaultAmount: 15, unit: 'g', emoji: '🫒', category: 'fats' }
];

// Smart meal-time recommendations
const MEAL_TIME_FOODS = {
  breakfast: ['oats-80g', 'eggs-2', 'milk-250ml', 'banana-1', 'bread-2', 'peanut-butter-30g'],
  lunch: ['chicken-150g', 'rice-200g', 'pasta-200g', 'bread-2', 'olive-oil-15ml'],
  dinner: ['beef-150g', 'chicken-150g', 'rice-200g', 'pasta-200g', 'olive-oil-15ml'],
  snack: ['protein-shake-1', 'banana-1', 'peanut-butter-30g', 'milk-250ml']
};

// Get meal type based on current time
function getCurrentMealTime(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'snack';
}

interface UltraFastLoggerProps {
  userId: string;
  onMealLogged?: (calories: number) => void;
}

export function UltraFastLogger({ userId, onMealLogged }: UltraFastLoggerProps) {
  const [currentMeal, setCurrentMeal] = useState<Array<{food: QuickFood, multiplier: number}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-detect meal type based on time and load recent foods
  useEffect(() => {
    // Smart meal time detection
    const detectedMealType = getCurrentMealTime();
    setMealType(detectedMealType);
    
    // Load recent foods from localStorage
    const saved = localStorage.getItem('ultrafast-recent-foods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentFoods(parsed.map((f: any) => ({...f, lastUsed: new Date(f.lastUsed)})));
      } catch (e) {
        console.error('Failed to load recent foods:', e);
      }
    }
  }, []);

  // Save recent foods to localStorage
  const saveRecentFoods = (foods: RecentFood[]) => {
    localStorage.setItem('ultrafast-recent-foods', JSON.stringify(foods));
    setRecentFoods(foods);
  };

  // Search foods with instant results
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['/api/foods/search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000, // Cache for 30 seconds for ultra-fast responses
  });

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setSearchQuery(spoken);
        setShowSearch(true);
        setIsListening(false);
        toast({
          title: "Voice captured!",
          description: `Searching for "${spoken}"`,
        });
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition failed",
          description: "Please try typing instead",
          variant: "destructive"
        });
      };

      if (isListening) {
        recognition.start();
      }

      return () => recognition.stop();
    }
  }, [isListening, toast]);

  // Calculate totals
  const totals = currentMeal.reduce((acc, {food, multiplier}) => ({
    calories: acc.calories + (food.calories * multiplier),
    protein: acc.protein + (food.protein * multiplier)
  }), {calories: 0, protein: 0});

  // Smart suggestions based on meal time and patterns
  const getSmartSuggestions = (): QuickFood[] => {
    const mealTimeFoodIds = MEAL_TIME_FOODS[mealType] || [];
    const suggestedFoods = HARDGAINER_QUICK_FOODS.filter(food => 
      mealTimeFoodIds.includes(food.id)
    );
    
    // Prioritize recent foods for this meal time
    const recentMealFoods = recentFoods.filter(recent => 
      mealTimeFoodIds.includes(recent.id)
    ).slice(0, 3);
    
    // Combine recent + suggested, prioritizing recent
    const uniqueIds = new Set();
    const smartSuggestions: QuickFood[] = [];
    
    [...recentMealFoods, ...suggestedFoods].forEach(food => {
      if (!uniqueIds.has(food.id) && smartSuggestions.length < 4) {
        uniqueIds.add(food.id);
        smartSuggestions.push(food);
      }
    });
    
    return smartSuggestions;
  };

  const smartSuggestions = getSmartSuggestions();

  // Ultra-fast add food (1 tap)
  const quickAddFood = (food: QuickFood, customMultiplier?: number) => {
    const multiplier = customMultiplier || 1;
    
    setCurrentMeal(prev => {
      const existing = prev.find(item => item.food.id === food.id);
      if (existing) {
        return prev.map(item => 
          item.food.id === food.id 
            ? {...item, multiplier: item.multiplier + multiplier}
            : item
        );
      }
      return [...prev, {food, multiplier}];
    });

    // Update recent foods
    const newRecentFood: RecentFood = {
      ...food,
      lastUsed: new Date(),
      frequency: (recentFoods.find(f => f.id === food.id)?.frequency || 0) + 1
    };
    
    const updatedRecent = [
      newRecentFood,
      ...recentFoods.filter(f => f.id !== food.id)
    ].slice(0, 12); // Keep top 12 recent foods
    
    saveRecentFoods(updatedRecent);
  };

  // Save meal mutation
  const saveMealMutation = useMutation({
    mutationFn: async () => {
      if (currentMeal.length === 0) throw new Error("No foods selected");
      
      const response = await fetch('/api/meal-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          calories: Math.round(totals.calories),
          description: `${mealType}: ${currentMeal.map(({food, multiplier}) => 
            `${multiplier}x ${food.name}`).join(', ')}`,
          logDate: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save meal');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "⚡ Meal logged instantly!",
        description: `${Math.round(totals.calories)} calories saved in record time`,
      });
      onMealLogged?.(totals.calories);
      setCurrentMeal([]);
      setShowSearch(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ['/api/meal-logs'] });
    },
    onError: (error: any) => {
      console.error('Meal save error:', error);
      toast({
        title: "⚠️ Save failed",
        description: "Please try again or switch to Advanced mode",
        variant: "destructive"
      });
    }
  });

  // Duplicate last meal
  const duplicateLastMeal = () => {
    // This would fetch the last meal and duplicate it
    toast({
      title: "Duplicating last meal...",
      description: "Coming soon - instant meal duplication",
    });
  };

  return (
    <div className="space-y-4">
      {/* Ultra-Fast Header with Stats */}
      <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="h-8 w-8 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-green-400">⚡ Ultra-Fast Logger</h3>
                <p className="text-xs text-green-300">Beats MacroFactor's 10 taps!</p>
              </div>
            </div>
            {currentMeal.length > 0 && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{Math.round(totals.calories)}</div>
                <div className="text-xs text-green-300">calories</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meal Type Quick Select */}
      <div className="flex gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
          <Button
            key={type}
            onClick={() => setMealType(type)}
            variant={mealType === type ? "default" : "outline"}
            size="sm"
            className={mealType === type ? "bg-green-500 text-black" : "border-green-500/50 text-green-400"}
            data-testid={`button-meal-type-${type}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Lightning-Fast Action Bar */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          onClick={() => setShowSearch(!showSearch)}
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-400 h-10"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setIsListening(!isListening)}
          variant="outline"
          size="sm"
          className={`border-green-500/50 h-10 ${isListening ? 'bg-red-500/20 text-red-400' : 'text-green-400'}`}
          disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          onClick={duplicateLastMeal}
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-400 h-10"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => toast({ title: "Coming Soon!", description: "Photo food scanning" })}
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-400 h-10"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Voice Status */}
      {isListening && (
        <Card className="bg-red-500/10 border-red-400/30">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm">Listening... Say a food name!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Interface */}
      {showSearch && (
        <Card className="border-green-400/30">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type food name..."
                className="pl-10 border-green-500/50 focus:border-green-400"
                autoFocus
              />
            </div>
            
            {isSearching && (
              <div className="text-center text-green-400 text-sm">⚡ Lightning search...</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.slice(0, 8).map((food: FoodItem) => (
                  <div
                    key={food.id}
                    onClick={() => {
                      const quickFood: QuickFood = {
                        id: food.id,
                        name: food.name,
                        calories: Number(food.calories),
                        protein: Number(food.protein),
                        defaultAmount: 100,
                        unit: 'g',
                        emoji: '🍽️',
                        category: 'carbs'
                      };
                      quickAddFood(quickFood);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg cursor-pointer hover:bg-green-500/20 transition-colors"
                  >
                    <div>
                      <div className="text-white font-medium text-sm">{food.name}</div>
                      <div className="text-green-300 text-xs">{food.calories} cal • {food.protein}g protein</div>
                    </div>
                    <Plus className="h-4 w-4 text-green-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions for Current Meal */}
      {smartSuggestions.length > 0 && (
        <Card className="border-blue-400/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Smart {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Picks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {smartSuggestions.map((food) => (
                <Button
                  key={`smart-${food.id}`}
                  onClick={() => quickAddFood(food)}
                  variant="outline"
                  size="sm"
                  className="h-16 flex-col border-blue-400/50 text-blue-400 hover:bg-blue-400/10 transition-all hover:scale-105"
                  data-testid={`button-smart-add-${food.id}`}
                >
                  <span className="text-lg mb-1">{food.emoji}</span>
                  <div className="text-xs font-medium">{food.name}</div>
                  <div className="text-blue-300 text-xs">{food.defaultAmount}{food.unit}</div>
                </Button>
              ))}
            </div>
            <div className="mt-3 text-xs text-blue-300/70 text-center">
              ⚡ Suggested based on time and your patterns
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Recent Foods (Learning Algorithm) */}
      {recentFoods.length > 0 && (
        <Card className="border-yellow-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Smart Favorites ({recentFoods.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {recentFoods.slice(0, 6).map((food) => (
                <Button
                  key={food.id}
                  onClick={() => quickAddFood(food)}
                  variant="outline"
                  className="h-auto p-3 border-yellow-400/30 hover:bg-yellow-400/10 flex-col items-start"
                  data-testid={`button-recent-${food.id}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">{food.emoji}</span>
                    <div className="text-left flex-1">
                      <div className="text-white text-xs font-medium truncate">{food.name}</div>
                      <div className="text-yellow-400 text-xs">{food.calories} cal</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ultra-Fast Quick Add Grid (1-Tap Foods) */}
      <Card className="border-green-400/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-green-400 flex items-center gap-2">
            <Target className="h-4 w-4" />
            1-Tap Quick Add
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {HARDGAINER_QUICK_FOODS.map((food) => (
              <Button
                key={food.id}
                onClick={() => quickAddFood(food)}
                variant="outline"
                className="h-auto p-3 border-green-400/30 hover:bg-green-400/10 flex-col"
                data-testid={`button-quick-${food.id}`}
              >
                <span className="text-2xl mb-1">{food.emoji}</span>
                <div className="text-center">
                  <div className="text-white text-xs font-medium">{food.name}</div>
                  <div className="text-green-400 text-xs">{food.calories} cal</div>
                  <div className="text-green-300 text-xs">{food.defaultAmount}{food.unit}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Meal Summary */}
      {currentMeal.length > 0 && (
        <Card className="border-green-400/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Current Meal
              </span>
              <Badge variant="secondary" className="bg-green-400/20 text-green-400">
                {currentMeal.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentMeal.map(({food, multiplier}, index) => (
              <div key={`${food.id}-${index}`} className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{food.emoji}</span>
                  <div>
                    <div className="text-white text-sm">{multiplier}x {food.name}</div>
                    <div className="text-green-300 text-xs">
                      {Math.round(food.calories * multiplier)} cal
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => quickAddFood(food, 0.5)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-green-400"
                  >
                    +½
                  </Button>
                  <Button
                    onClick={() => quickAddFood(food)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-green-400"
                  >
                    +1
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Quick Totals */}
            <div className="flex justify-between items-center p-3 bg-green-400/10 rounded-lg border border-green-400/20">
              <div>
                <div className="text-lg font-bold text-green-400">{Math.round(totals.calories)} cal</div>
                <div className="text-xs text-green-300">{Math.round(totals.protein)}g protein</div>
              </div>
              <Button 
                onClick={() => saveMealMutation.mutate()}
                disabled={saveMealMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-6"
                data-testid="button-save-meal"
              >
                <Zap className="h-4 w-4 mr-2" />
                {saveMealMutation.isPending ? "Saving..." : "⚡ Log Meal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speed Stats */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-blue-400/30">
        <CardContent className="p-3">
          <div className="text-center">
            <div className="text-blue-400 text-xs font-medium">⚡ SPEED CHALLENGE</div>
            <div className="text-white text-sm">Beat MacroFactor: <span className="text-red-400">10 taps</span> → Our goal: <span className="text-green-400">3 taps</span></div>
            <div className="text-blue-300 text-xs mt-1">
              1. Pick meal type • 2. Tap food • 3. Log meal = <span className="text-green-400 font-bold">3 TAPS!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add voice recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}