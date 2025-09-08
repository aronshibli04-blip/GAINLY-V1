import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { calculateTdee } from "@/utils/tdee";
import { 
  Target, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Coffee,
  Cookie,
  Apple,
  Plus,
  Quote
} from "lucide-react";

export function AggressiveSurplusTracker() {
  const { toast } = useToast();
  const { calorieEntries, weightEntries, addCalorieEntry, currentTdeeAnalysis } = useUserStore();
  const [showMotivation, setShowMotivation] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieEntries
    ?.filter(c => c?.date === today)
    ?.reduce((sum, c) => sum + (c?.calories || 0), 0) || 0;
  
  // FORCE real-time calculation instead of using potentially wrong stored analysis
  // Calculate TDEE directly to avoid using outdated stored values  
  const realtimeTdeeCalc = calculateTdee(weightEntries || [], calorieEntries || [], 'user1');
  const requiredCalories = realtimeTdeeCalc.targetCalories; // This includes the 1100 surplus
  
  // DEBUG: Log the calculated values
  console.log('🔴 DASHBOARD - AggressiveSurplusTracker:', {
    tdee: realtimeTdeeCalc.tdee,
    surplus: realtimeTdeeCalc.surplus, 
    targetCalories: realtimeTdeeCalc.targetCalories,
    weightEntries: weightEntries?.length,
    calorieEntries: calorieEntries?.length
  });
  const caloriesRemaining = Math.max(0, requiredCalories - todayCalories);
  const progress = Math.min(100, (todayCalories / requiredCalories) * 100);
  const currentHour = new Date().getHours();
  const isComplete = caloriesRemaining === 0;

  // Daily motivation quotes in Norwegian with authors
  const motivationQuotes = [
    { text: "Suksess er summen av små anstrengelser, gjentatt dag ut og dag inn.", author: "Robert Collier" },
    { text: "Du blir ikke det du ønsker, du blir det du tror du fortjener.", author: "Unknown" }, 
    { text: "Kroppen din kan gjøre det. Det er sinnet ditt du må overbevise.", author: "Unknown" },
    { text: "Champions blir ikke laget i gymsalene. Champions blir laget av noe dypt inne i dem.", author: "Muhammad Ali" },
    { text: "Styrke kommer ikke fra det du kan gjøre. Den kommer fra å overvinne det du trodde du ikke kunne.", author: "Rikki Rogers" },
    { text: "Framgang er umulig uten forandring, og de som ikke kan forandre tankene sine kan ikke forandre noe.", author: "George Bernard Shaw" },
    { text: "Hver ekspert var en gang en begynner. Hver proff var en gang en amatør.", author: "Robin Sharma" }
  ];

  const currentQuote = motivationQuotes[currentQuoteIndex];

  // Rotate quotes every 10 seconds like MotivationBoost component
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-transition to motivation after 5 seconds regardless of completion
  useEffect(() => {
    const autoTransitionTimer = setTimeout(() => {
      if (!showMotivation) {
        setAnimatingOut(true);
        setTimeout(() => {
          setShowMotivation(true);
          setAnimatingOut(false);
        }, 1000);
      }
    }, 5000); // Show progress for 5 seconds then transition
    
    return () => clearTimeout(autoTransitionTimer);
  }, [showMotivation]);

  // Also transition when completed for immediate feedback
  useEffect(() => {
    if (isComplete && !showMotivation) {
      const delayTimer = setTimeout(() => {
        setAnimatingOut(true);
        setTimeout(() => {
          setShowMotivation(true);
          setAnimatingOut(false);
        }, 1000);
      }, 2000); // Shorter delay when complete
      
      return () => clearTimeout(delayTimer);
    }
  }, [isComplete, showMotivation]);
  
  // Quick calorie boost options for low appetite
  const quickFoods = [
    { name: "Protein Shake", calories: 350, icon: Coffee },
    { name: "Nuts (handful)", calories: 200, icon: Cookie },
    { name: "Banana + PB", calories: 250, icon: Apple },
    { name: "Energy Bar", calories: 300, icon: Cookie }
  ];

  const handleQuickAdd = (food: { name: string; calories: number }) => {
    addCalorieEntry({
      date: today,
      calories: food.calories,
      description: food.name + " (Quick Add)",
      userId: "user1"
    });
    
    toast({
      title: `${food.name} Added!`,
      description: `+${food.calories} calories logged`
    });
  };

  const getUrgencyLevel = () => {
    if (currentHour >= 20 && caloriesRemaining > 500) return "critical";
    if (currentHour >= 15 && caloriesRemaining > 800) return "high";
    if (caloriesRemaining > 0) return "medium";
    return "success";
  };

  const urgencyLevel = getUrgencyLevel();
  const urgencyColors = {
    critical: "border-red-500/60 bg-red-500/20",
    high: "border-orange-500/60 bg-orange-500/20", 
    medium: "border-yellow-500/60 bg-yellow-500/20",
    success: "border-green-500/60 bg-green-500/20"
  };

  // Show motivation quote when complete - compact colorful style
  if (showMotivation) {
    return (
      <Card className={`bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30 overflow-hidden grok-glow-hover transition-all duration-1000 ease-in-out ${
        animatingOut ? 'animate-out slide-out-to-right-4 opacity-0 duration-1000' : 'animate-in slide-in-from-left-4 duration-1000'
      }`}>
        <CardContent className="p-4">
          <div className="animate-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-yellow-400 flex items-center justify-center shadow-lg">
                  <Quote className="h-4 w-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dagens Motivasjon</h3>
                  <p className="text-xs text-primary/80">Inspirasjon for fremgang</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setAnimatingOut(true);
                  setTimeout(() => {
                    setShowMotivation(false);
                    setAnimatingOut(false);
                  }, 1000);
                }}
                variant="ghost"
                size="sm"
                className="text-primary/70 hover:text-primary hover:bg-primary/10"
                data-testid="button-back-to-progress"
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
            
            <blockquote className="text-white text-sm leading-relaxed italic mb-2">
              "{currentQuote.text}"
            </blockquote>
            
            <div className="text-xs text-primary/60 text-right">
              — {currentQuote.author}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${urgencyColors[urgencyLevel]} grok-glow-hover transition-all duration-1000 ease-in-out ${
      animatingOut ? 'animate-out slide-out-to-top-4 opacity-0 duration-1000' : ''
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            1kg/Week Surplus Target
          </div>
          <Badge variant="outline" className={`
            ${urgencyLevel === 'critical' ? 'text-red-400 border-red-400' : 
              urgencyLevel === 'high' ? 'text-orange-400 border-orange-400' :
              urgencyLevel === 'medium' ? 'text-yellow-400 border-yellow-400' :
              'text-green-400 border-green-400'}
          `}>
            {caloriesRemaining > 0 ? `-${caloriesRemaining}` : "Complete!"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="font-semibold text-white">
              {(todayCalories || 0).toLocaleString()} / {requiredCalories.toLocaleString()} kcal
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Urgency Alerts */}
        {urgencyLevel === 'critical' && (
          <div className="bg-red-500/30 border border-red-500/50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-red-400 font-medium text-sm">CRITICAL DEFICIT</span>
            </div>
            <p className="text-red-300 text-xs mb-3">
              It's {currentHour}:00 and you need {caloriesRemaining} more calories! 
              Emergency protocol needed to hit your 1kg/week target.
            </p>
          </div>
        )}

        {urgencyLevel === 'high' && (
          <div className="bg-orange-500/30 border border-orange-500/50 p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-orange-400 mr-2" />
              <span className="text-orange-400 font-medium text-sm">FALLING BEHIND</span>
            </div>
            <p className="text-orange-300 text-xs mb-3">
              You need {caloriesRemaining} more calories today. Time to start eating bigger portions!
            </p>
          </div>
        )}

        {/* Quick Calorie Boost Buttons */}
        {caloriesRemaining > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              Quick Calorie Boost (Low Appetite Friendly)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickFoods.map((food) => (
                <Button
                  key={food.name}
                  onClick={() => handleQuickAdd(food)}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center text-xs"
                  data-testid={`quick-add-${food.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <food.icon className="h-4 w-4 mb-1" />
                  {food.name}
                  <span className="text-green-400">+{food.calories}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Success State - This will be hidden when animating to motivation */}
        {caloriesRemaining === 0 && !animatingOut && (
          <div className="bg-green-500/20 border border-green-500/40 p-3 rounded-lg text-center">
            <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium text-sm">Target Achieved!</p>
            <p className="text-green-300 text-xs">
              Perfect 1100kcal surplus completed. You're on track for 1kg weight gain this week!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}