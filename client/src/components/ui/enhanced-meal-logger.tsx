import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { 
  Camera, 
  Search, 
  Clock,
  Plus,
  Utensils,
  Zap,
  BarChart3,
  Target,
  ScanLine
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  barcode?: string;
}

interface MealEntry {
  id: string;
  foods: { item: FoodItem; quantity: number }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

// Mock food database for demonstration
const mockFoodDatabase: FoodItem[] = [
  { id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
  { id: '2', name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, serving: '100g' },
  { id: '3', name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, serving: '100ml' },
  { id: '4', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '1 medium' },
  { id: '5', name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, serving: '100g' },
  { id: '6', name: 'Oats', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, serving: '100g' },
  { id: '7', name: 'Whey Protein', calories: 110, protein: 25, carbs: 2, fat: 1, serving: '1 scoop' },
  { id: '8', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, serving: '1 medium' },
];

export function EnhancedMealLogger() {
  const { toast } = useToast();
  const { addCalorieEntry } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<{ item: FoodItem; quantity: number }[]>([]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);

  const filteredFoods = mockFoodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFood = (food: FoodItem, quantity: number = 1) => {
    const existingIndex = selectedFoods.findIndex(item => item.item.id === food.id);
    
    if (existingIndex >= 0) {
      setSelectedFoods(prev => 
        prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setSelectedFoods(prev => [...prev, { item: food, quantity }]);
    }

    toast({
      title: "Food added",
      description: `${food.name} added to your meal`,
    });
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(item => item.item.id !== foodId));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFood(foodId);
      return;
    }
    
    setSelectedFoods(prev => 
      prev.map(item => 
        item.item.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotals = () => {
    return selectedFoods.reduce((totals, { item, quantity }) => ({
      calories: totals.calories + (item.calories * quantity),
      protein: totals.protein + (item.protein * quantity),
      carbs: totals.carbs + (item.carbs * quantity),
      fat: totals.fat + (item.fat * quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const logMeal = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "No foods selected",
        description: "Please add some foods to your meal first.",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    addCalorieEntry({
      userId: "user-1",
      calories: Math.round(totals.calories),
      description: `${mealType}: ${selectedFoods.map(f => `${f.quantity}x ${f.item.name}`).join(', ')}`,
      date: new Date().toISOString().split('T')[0]
    });

    setSelectedFoods([]);
    setSearchQuery('');

    toast({
      title: "Meal logged successfully!",
      description: `${Math.round(totals.calories)} calories added to your daily intake.`,
    });
  };

  const simulateBarcodeScanning = () => {
    // Simulate finding a random food item
    const randomFood = mockFoodDatabase[Math.floor(Math.random() * mockFoodDatabase.length)];
    addFood(randomFood);
    setShowBarcodeScanner(false);
    
    toast({
      title: "Barcode scanned!",
      description: `Found ${randomFood.name} in database`,
    });
  };

  const simulatePhotoAnalysis = () => {
    // Simulate AI analyzing a photo and suggesting foods
    const suggestedFoods = [
      { food: mockFoodDatabase.find(f => f.name === 'Chicken Breast')!, quantity: 1.5 },
      { food: mockFoodDatabase.find(f => f.name === 'Brown Rice')!, quantity: 1.2 },
      { food: mockFoodDatabase.find(f => f.name === 'Avocado')!, quantity: 0.5 }
    ];

    suggestedFoods.forEach(({ food, quantity }) => {
      if (food) addFood(food, quantity);
    });

    setShowPhotoAnalyzer(false);
    
    toast({
      title: "Photo analyzed!",
      description: "AI detected foods and estimated portions",
    });
  };

  const totals = calculateTotals();

  return (
    <Card className="bg-slate-800/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Utensils className="h-5 w-5" />
          Enhanced Meal Logger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meal Type Selection */}
        <div>
          <Label className="text-primary mb-2 block">Meal Type</Label>
          <div className="flex gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => setMealType(type)}
                variant={mealType === type ? "default" : "outline"}
                size="sm"
                className={mealType === type 
                  ? "bg-primary text-black" 
                  : "border-primary/30 text-primary hover:bg-primary/20"
                }
                data-testid={`button-meal-${type}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Add Options */}
        <div className="flex gap-2">
          <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/20"
                data-testid="button-barcode-scan"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-primary">Barcode Scanner</DialogTitle>
                <DialogDescription>
                  Point your camera at a product barcode to automatically add it to your meal.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8">
                <ScanLine className="h-16 w-16 text-primary/50 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-300 mb-4">Scanner simulation ready...</p>
                <Button onClick={simulateBarcodeScanning} className="bg-primary text-black">
                  Simulate Scan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showPhotoAnalyzer} onOpenChange={setShowPhotoAnalyzer}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/20"
                data-testid="button-photo-analyze"
              >
                <Camera className="h-4 w-4 mr-2" />
                Analyze Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-primary">AI Photo Analysis</DialogTitle>
                <DialogDescription>
                  Take a photo of your meal and our AI will identify foods and estimate calories.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8">
                <Camera className="h-16 w-16 text-primary/50 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-300 mb-4">AI analysis simulation ready...</p>
                <Button onClick={simulatePhotoAnalysis} className="bg-primary text-black">
                  Simulate Analysis
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Food Search */}
        <div>
          <Label htmlFor="food-search" className="text-primary mb-2 block">Search Foods</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="food-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for foods..."
              className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              data-testid="input-food-search"
            />
          </div>
        </div>

        {/* Food Results */}
        {searchQuery && (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div>
                  <div className="font-semibold text-white">{food.name}</div>
                  <div className="text-sm text-slate-400">
                    {food.calories} cal • {food.protein}g protein • {food.serving}
                  </div>
                </div>
                <Button
                  onClick={() => addFood(food)}
                  size="sm"
                  className="bg-primary text-black hover:bg-primary/90"
                  data-testid={`button-add-${food.id}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Selected Foods */}
        {selectedFoods.length > 0 && (
          <div>
            <Label className="text-primary mb-2 block">Selected Foods</Label>
            <div className="space-y-2">
              {selectedFoods.map(({ item, quantity }, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm text-slate-400">
                      {Math.round(item.calories * quantity)} cal • 
                      {Math.round(item.protein * quantity)}g protein
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 bg-slate-600 border-slate-500 text-white text-center"
                      min="0"
                      step="0.1"
                      data-testid={`input-quantity-${item.id}`}
                    />
                    <Button
                      onClick={() => removeFood(item.id)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-red-500/50 text-red-400 hover:bg-red-500/20"
                      data-testid={`button-remove-${item.id}`}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Summary */}
        {selectedFoods.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-3">Nutrition Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-slate-400">Calories:</span>
                <span className="font-semibold text-white">{Math.round(totals.calories)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-red-400" />
                <span className="text-slate-400">Protein:</span>
                <span className="font-semibold text-white">{Math.round(totals.protein)}g</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span className="text-slate-400">Carbs:</span>
                <span className="font-semibold text-white">{Math.round(totals.carbs)}g</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-slate-400">Fat:</span>
                <span className="font-semibold text-white">{Math.round(totals.fat)}g</span>
              </div>
            </div>
          </div>
        )}

        {/* Log Meal Button */}
        <Button
          onClick={logMeal}
          disabled={selectedFoods.length === 0}
          className="w-full bg-primary text-black hover:bg-primary/90 disabled:bg-slate-600 disabled:text-slate-400"
          data-testid="button-log-meal"
        >
          Log Meal ({Math.round(totals.calories)} calories)
        </Button>
      </CardContent>
    </Card>
  );
}