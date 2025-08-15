import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { QuickMealLogger } from "@/components/ui/quick-meal-logger";
import { EditableMealsList } from "@/components/ui/editable-meals-list";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { useMenu } from "@/components/ui/menu-context";
import { Utensils, Sparkles, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function MobileMeals() {
  const { toast } = useToast();
  const { openMenu } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState("");
  const { 
    currentTdeeAnalysis,
    mealPlans,
    addMealPlan,
    weightEntries,
    calorieEntries
  } = useUserStore();

  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );

  const canGenerateMealPlan = totalDays >= 7 && currentTdeeAnalysis;
  const latestMealPlan = mealPlans[mealPlans.length - 1];

  const handleGenerateMealPlan = async () => {
    if (!currentTdeeAnalysis) {
      toast({ 
        title: "Generate TDEE analysis first", 
        description: "Go to AI Coach to calculate your TDEE",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const hardgainerTargetCalories = currentTdeeAnalysis.tdee + 1100; // 1100 cal surplus for 1kg/week
      
      // Create proper meal plan request with user preferences
      const mealPlanRequest = {
        targetCalories: hardgainerTargetCalories,
        dietaryPreferences: preferences.trim() ? [preferences.trim()] : [],
        preferredFoods: ['Rice', 'Chicken', 'Pasta', 'Beef', 'Fish'],
        maxMealsPerDay: preferences.toLowerCase().includes('three') ? 3 : 4,
        maxPrepTime: 30,
        cookingExperience: 'Beginner',
        userId: 'user1'
      };

      // Call the actual OpenAI API
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealPlanRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const mealPlan = await response.json();
      
      // Use the AI-generated meal plan directly
      addMealPlan(mealPlan);
      setIsGenerating(false);
      toast({ 
        title: "Meal plan generated!", 
        description: `${mealPlan.totalCalories} calorie AI meal plan created`
      });
    } catch (error) {
      setIsGenerating(false);
      toast({ 
        title: "Generation failed", 
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mobile-container">
      <div className="content-with-bottom-nav p-4 space-y-4 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold grok-text-gradient mb-1">Meal Plans</h1>
          <p className="text-sm text-muted-foreground">
            AI-generated meal plans for your goals
          </p>
        </div>

        {/* Requirements Check */}
        <Card className="grok-glow-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  {canGenerateMealPlan ? "Ready to generate meal plans" : "Complete setup first"}
                </p>
              </div>
              <Badge 
                variant={canGenerateMealPlan ? "default" : "outline"}
                className={canGenerateMealPlan ? "grok-gradient text-black" : ""}
              >
                {canGenerateMealPlan ? "Ready" : "Setup"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan Generation */}
        {canGenerateMealPlan && (
          <Card className="grok-glow-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Generate Hardgainer Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Dietary preferences (optional)
                </Label>
                <Textarea
                  placeholder="Any food allergies, dislikes, or preferences..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="grok-input mt-1 resize-none"
                  rows={3}
                  data-testid="textarea-preferences"
                />
              </div>

              <Button 
                onClick={handleGenerateMealPlan}
                disabled={isGenerating}
                className="w-full grok-gradient h-12"
                data-testid="button-generate-meal-plan"
              >
                <Sparkles className="h-5 w-5 mr-2 text-black" />
                {isGenerating ? "Generating..." : "Generate AI Meal Plan"}
              </Button>

              {currentTdeeAnalysis && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">Your TDEE</p>
                    <p className="text-lg font-bold text-white">
                      {currentTdeeAnalysis.tdee} kcal
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Target (+1100)</p>
                    <p className="text-lg font-bold text-primary">
                      {currentTdeeAnalysis.tdee + 1100} kcal
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-center text-muted-foreground">
                Meal plans optimized for 1kg/week weight gain
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Meal Plan */}
        {latestMealPlan && (
          <Card className="grok-glow-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-primary" />
                  Your Meal Plan
                </div>
                <Badge variant="secondary">
                  {latestMealPlan.totalCalories} kcal
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestMealPlan.meals.map((meal) => (
                <div 
                  key={meal.id}
                  className="p-4 rounded-lg bg-muted/20 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white capitalize">
                      {meal.type}: {meal.name}
                    </h4>
                    <Badge variant="outline">
                      {meal.calories} cal
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Ingredients:
                    </p>
                    <div className="space-y-1">
                      {meal.ingredients.map((ingredient) => (
                        <div 
                          key={ingredient.id}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-white">
                            {ingredient.name} ({ingredient.amount}{ingredient.unit})
                          </span>
                          <span className="text-muted-foreground">
                            {ingredient.calories} cal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      {meal.instructions}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(latestMealPlan.createdAt).toLocaleDateString()}
                </div>
                <Button 
                  onClick={handleGenerateMealPlan}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                  data-testid="button-regenerate-plan"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Meal Logger */}
        <QuickMealLogger userId="974acc79-f202-4202-bdab-80c4ef55f534" />

        {/* Today's Logged Meals - Editable */}
        <EditableMealsList />

        {/* No Analysis Warning */}
        {!canGenerateMealPlan && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-yellow-400 font-medium mb-1">
                Complete Setup Required
              </p>
              <p className="text-xs text-muted-foreground">
                {totalDays < 7 
                  ? `Track for ${7 - totalDays} more days, then generate TDEE analysis to unlock meal plans`
                  : "Generate your TDEE analysis in AI Coach to unlock meal plans"
                }
              </p>
            </CardContent>
          </Card>
        )}

      </div>

      <BottomNav />
    </div>
  );
}