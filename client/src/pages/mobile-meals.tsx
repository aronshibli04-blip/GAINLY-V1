import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { UltraFastLogger } from "@/components/ui/ultra-fast-logger";
import { SmartMealLogger } from "@/components/ui/smart-meal-logger";
import { PhotoNutritionScanner } from "@/components/ui/photo-nutrition-scanner";
import { PremiumLoggedMeals } from "@/components/ui/premium-logged-meals";
import { DailyProgressRing } from "@/components/ui/daily-progress-ring";
import { MealTypeTabsComponent, MealType } from "@/components/ui/meal-type-tabs";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { useSideMenu } from "@/hooks/use-side-menu";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { calculateTdee } from "@/utils/tdee";
import { Utensils, Sparkles, Plus, Clock, ChevronDown, ChevronUp, Zap, Camera, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function MobileMeals() {
  const { toast } = useToast();
  const { openMenu } = useSideMenu();
  const { isVisible: isHeaderVisible } = useScrollDirection(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [showMealPlanSection, setShowMealPlanSection] = useState(false);
  const [showLoggedMeals, setShowLoggedMeals] = useState(false);
  const [loggerMode, setLoggerMode] = useState<'ultra' | 'advanced' | 'ai' | null>(null);
  const [showModePicker, setShowModePicker] = useState(false);
  const { 
    currentTdeeAnalysis,
    mealPlans,
    addMealPlan,
    weightEntries,
    calorieEntries,
    addCalorieEntry
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
        description: "Go to Coach to calculate your TDEE",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // FORCE same calculation as AI Analysis to ensure consistency  
      const calculation = calculateTdee(weightEntries, calorieEntries, "user1");
      const hardgainerTargetCalories = calculation.targetCalories; // Use same method as AI Analysis
      
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
        description: `${mealPlan.totalCalories} calorie meal plan created`
      });
    } catch (error) {
      setIsGenerating(false);
      toast({ 
        title: "Ready for another try!", 
        description: "Meal plan generation didn't complete this time. Let's give it another shot!"
      });
    }
  };

  // localStorage functions for last-used mode
  const getLastUsedMode = (): 'ultra' | 'advanced' | 'ai' | null => {
    try {
      return localStorage.getItem('meal-logger-mode') as 'ultra' | 'advanced' | 'ai' | null;
    } catch {
      return null;
    }
  };

  const setLastUsedMode = (mode: 'ultra' | 'advanced' | 'ai') => {
    try {
      localStorage.setItem('meal-logger-mode', mode);
    } catch {
      // Silent fail if localStorage not available
    }
  };

  const handleMealLogged = (calories: number, foodName?: string) => {
    // Update today's calorie count in the store with meal type
    const today = new Date().toISOString().split('T')[0];
    const description = foodName 
      ? `${selectedMealType}: ${foodName}` 
      : `${selectedMealType}: Quick logged meal`;
    
    addCalorieEntry({
      userId: 'user1',
      calories,
      description,
      date: today
    });

    // Close the logger after successful logging
    setLoggerMode(null);
  };

  const handleLogMealClick = () => {
    const lastMode = getLastUsedMode();
    if (lastMode) {
      setLoggerMode(lastMode);
    } else {
      setShowModePicker(true);
    }
  };

  const handleModeSelect = (mode: 'ultra' | 'advanced' | 'ai') => {
    setLastUsedMode(mode);
    setLoggerMode(mode);
    setShowModePicker(false);
  };

  const handleChangeMode = () => {
    setLoggerMode(null);
    setShowModePicker(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Auto-Hide */}
      <MobileHeader 
        title="Meals" 
        onOpenMenu={openMenu}
        isVisible={isHeaderVisible}
      />
      
      {/* Simplified Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 px-4 pt-20 py-6 max-w-md mx-auto">
        
        {/* 1. DAILY PROGRESS RING - Hero Section */}
        <DailyProgressRing />
        
        {/* 2. MEAL TYPE TABS */}
        <MealTypeTabsComponent 
          selectedMealType={selectedMealType}
          onMealTypeChange={setSelectedMealType}
        />
        
        {/* 3. PRIMARY CTA - LOG MEAL */}
        <div className="mb-6">
          <Button 
            onClick={handleLogMealClick}
            className="w-full h-16 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-lg shadow-lg"
            data-testid="button-log-meal"
          >
            <Plus className="h-6 w-6 mr-3" />
            LOG MEAL
          </Button>
        </div>
        
        {/* 4. LOGGER MODES - Based on selection */}
        {loggerMode && (
          <div className="mb-6">
            {/* Change Mode Link */}
            <div className="flex justify-end mb-2">
              <Button 
                onClick={handleChangeMode}
                variant="ghost" 
                size="sm"
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                Change mode
              </Button>
            </div>

            {/* Render Selected Logger */}
            {loggerMode === 'ultra' && (
              <UltraFastLogger 
                userId="974acc79-f202-4202-bdab-80c4ef55f534" 
                onMealLogged={handleMealLogged}
                selectedMealType={selectedMealType}
              />
            )}
            
            {loggerMode === 'advanced' && (
              <SmartMealLogger 
                userId="974acc79-f202-4202-bdab-80c4ef55f534"
                onMealLogged={handleMealLogged}
                selectedMealType={selectedMealType}
              />
            )}
            
            {loggerMode === 'ai' && (
              <PhotoNutritionScanner 
                onFoodCreated={() => {}} 
                onMealLogged={handleMealLogged}
                selectedMealType={selectedMealType}
              />
            )}
          </div>
        )}

        {/* MODE PICKER BOTTOM SHEET */}
        {showModePicker && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="w-full bg-slate-800 rounded-t-2xl p-6 space-y-4 animate-slide-up">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Choose Logging Mode</h3>
                <p className="text-sm text-gray-400">Pick your preferred way to log meals</p>
              </div>
              
              <div className="space-y-3">
                {/* Ultra Fast Mode */}
                <Button
                  onClick={() => handleModeSelect('ultra')}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white justify-start text-left"
                  data-testid="option-mode-ultra"
                >
                  <div className="flex items-center">
                    <Zap className="h-6 w-6 mr-4 text-green-300" />
                    <div>
                      <div className="font-semibold">⚡ Ultra Fast</div>
                      <div className="text-xs text-green-200">Log meals in just 3 taps</div>
                    </div>
                  </div>
                </Button>

                {/* Advanced Mode */}
                <Button
                  onClick={() => handleModeSelect('advanced')}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white justify-start text-left"
                  data-testid="option-mode-advanced"
                >
                  <div className="flex items-center">
                    <Settings className="h-6 w-6 mr-4 text-blue-300" />
                    <div>
                      <div className="font-semibold">🔧 Advanced</div>
                      <div className="text-xs text-blue-200">Detailed nutrition tracking</div>
                    </div>
                  </div>
                </Button>

                {/* AI Photo Mode */}
                <Button
                  onClick={() => handleModeSelect('ai')}
                  className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white justify-start text-left"
                  data-testid="option-mode-ai"
                >
                  <div className="flex items-center">
                    <Camera className="h-6 w-6 mr-4 text-purple-300" />
                    <div>
                      <div className="font-semibold">📸 AI Scanner</div>
                      <div className="text-xs text-purple-200">Scan nutrition labels with camera</div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Cancel Button */}
              <Button
                onClick={() => setShowModePicker(false)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* 5. TODAY'S LOGGED MEALS - Collapsible */}
        <Collapsible open={showLoggedMeals} onOpenChange={setShowLoggedMeals}>
          <CollapsibleTrigger asChild>
            <Card className="mb-4 cursor-pointer hover:bg-slate-800/60 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Utensils className="h-5 w-5 mr-3 text-orange-400" />
                    <div>
                      <h3 className="font-semibold text-white">Today's Meals</h3>
                      <p className="text-xs text-gray-400">View and edit logged meals</p>
                    </div>
                  </div>
                  {showLoggedMeals ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mb-6">
              <PremiumLoggedMeals />
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* 6. AI MEAL PLANNING - Collapsible Bottom Section */}
        <Collapsible open={showMealPlanSection} onOpenChange={setShowMealPlanSection}>
          <CollapsibleTrigger asChild>
            <Card className="mb-4 cursor-pointer hover:bg-slate-800/60 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Meal Planning</h3>
                      <p className="text-xs text-gray-400">Generate personalized meal plans</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {canGenerateMealPlan && (
                      <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-500/10 mr-2">
                        Ready
                      </Badge>
                    )}
                    {showMealPlanSection ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 mb-6">
              
              {/* Setup Warning */}
              {!canGenerateMealPlan && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-yellow-400 font-medium mb-1">
                      Setup Required
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalDays < 7 
                        ? `Track for ${7 - totalDays} more days, then generate TDEE analysis to unlock meal plans`
                        : "Generate your TDEE analysis in Coach to unlock meal plans"
                      }
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Meal Plan Generation */}
              {canGenerateMealPlan && (
                <Card className="bg-slate-800/40 border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-purple-400" />
                      Generate Meal Plan
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
                        className="mt-1 resize-none bg-slate-900/50 border-slate-600"
                        rows={3}
                        data-testid="textarea-preferences"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateMealPlan}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12"
                      data-testid="button-generate-meal-plan"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      {isGenerating ? "Generating..." : "Generate Meal Plan"}
                    </Button>

                    {currentTdeeAnalysis && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-slate-900/50">
                          <p className="text-xs text-muted-foreground">Your TDEE</p>
                          <p className="text-lg font-bold text-white">
                            {currentTdeeAnalysis.tdee} kcal
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-orange-400/10 border border-orange-400/20">
                          <p className="text-xs text-muted-foreground">Target (+1100)</p>
                          <p className="text-lg font-bold text-orange-400">
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

              {/* Latest Meal Plan Display */}
              {latestMealPlan && (
                <Card className="bg-slate-800/40 border-green-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-green-400" />
                        Your Meal Plan
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400/50">
                        {latestMealPlan.totalCalories} kcal
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestMealPlan.meals.map((meal) => (
                      <div 
                        key={meal.id}
                        className="p-4 rounded-lg bg-slate-900/50 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-white capitalize">
                            {meal.type}: {meal.name}
                          </h4>
                          <Badge variant="outline" className="text-orange-400 border-orange-400/50">
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

                        <div className="pt-2 border-t border-slate-600">
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
                        className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10"
                        data-testid="button-regenerate-plan"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
}