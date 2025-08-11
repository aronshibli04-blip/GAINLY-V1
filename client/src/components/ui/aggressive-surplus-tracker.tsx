import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Clock,
  Zap,
  CheckCircle,
  X
} from "lucide-react";

export function AggressiveSurplusTracker() {
  const { toast } = useToast();
  const { 
    calorieEntries, 
    currentTdeeAnalysis, 
    user,
    addCalorieEntry 
  } = useUserStore();

  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieEntries
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.calories, 0);

  // Calculate required calories for 1kg/week gain
  const targetTdee = currentTdeeAnalysis?.tdee || (user ? 
    (user.weight * 24 + user.height * 5 - user.age * 5 + (user.gender === 'male' ? 5 : -161)) * 1.6 
    : 2500);
  
  const requiredCalories = targetTdee + 1100; // Always 1100kcal surplus
  const caloriesRemaining = Math.max(0, requiredCalories - todayCalories);
  const progressPercent = Math.min((todayCalories / requiredCalories) * 100, 100);
  
  // Time-based urgency calculation
  const currentHour = new Date().getHours();
  const hoursLeft = 24 - currentHour;
  const caloriesPerHour = caloriesRemaining / Math.max(hoursLeft, 1);

  const getUrgencyLevel = () => {
    if (progressPercent >= 100) return 'complete';
    if (currentHour >= 22) return 'critical'; // After 10 PM
    if (currentHour >= 18 && progressPercent < 70) return 'urgent'; // After 6 PM, less than 70%
    if (currentHour >= 15 && progressPercent < 50) return 'warning'; // After 3 PM, less than 50%
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'complete':
        return {
          color: 'bg-green-500/20 border-green-500/40',
          textColor: 'text-green-400',
          icon: CheckCircle,
          title: 'Target Achieved!',
          message: 'Perfect! You hit your 1100kcal surplus today.'
        };
      case 'critical':
        return {
          color: 'bg-red-500/20 border-red-500/40 animate-pulse',
          textColor: 'text-red-400',
          icon: AlertTriangle,
          title: 'CRITICAL: Late Night Deficit',
          message: `You need ${caloriesRemaining} calories NOW! Liquid calories recommended.`
        };
      case 'urgent':
        return {
          color: 'bg-orange-500/20 border-orange-500/40',
          textColor: 'text-orange-400',
          icon: Clock,
          title: 'URGENT: Behind Schedule',
          message: `Evening deadline approaching. Need ${Math.round(caloriesPerHour)} calories/hour.`
        };
      case 'warning':
        return {
          color: 'bg-yellow-500/20 border-yellow-500/40',
          textColor: 'text-yellow-400',
          icon: Target,
          title: 'Warning: Falling Behind',
          message: `Aim for ${Math.round(caloriesPerHour)} calories/hour to hit your target.`
        };
      default:
        return {
          color: 'bg-primary/20 border-primary/40',
          textColor: 'text-primary',
          icon: TrendingUp,
          title: '1kg/Week Progress',
          message: 'On track for your aggressive weight gain goal.'
        };
    }
  };

  const config = getUrgencyConfig();

  // Quick calorie add buttons for low appetite
  const quickCalorieOptions = [
    { name: "Protein Shake", calories: 400, icon: "🥤" },
    { name: "Peanut Butter", calories: 300, icon: "🥜" },
    { name: "Whole Milk", calories: 250, icon: "🥛" },
    { name: "Nuts/Trail Mix", calories: 350, icon: "🌰" },
    { name: "Energy Bar", calories: 200, icon: "🍫" },
    { name: "Banana + PB", calories: 400, icon: "🍌" }
  ];

  const addQuickCalories = (name: string, calories: number) => {
    addCalorieEntry({
      id: crypto.randomUUID(),
      date: today,
      calories,
      description: `Quick add: ${name}`,
      mealType: currentHour < 12 ? 'breakfast' : currentHour < 17 ? 'lunch' : 'dinner'
    });
    
    toast({
      title: "Calories Added!",
      description: `+${calories} calories from ${name}`,
    });
  };

  return (
    <Card className={`${config.color} mb-4`}>
      <CardHeader className="pb-3">
        <CardTitle className={`${config.textColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <config.icon className="h-5 w-5 mr-2" />
            {config.title}
          </div>
          <Badge variant="outline" className={`${config.textColor} border-current`}>
            {Math.round(progressPercent)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className={`font-semibold ${config.textColor}`}>
              {todayCalories} / {requiredCalories} calories
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-3 ${urgency === 'critical' ? 'animate-pulse' : ''}`}
          />
          <p className="text-xs text-muted-foreground">{config.message}</p>
        </div>

        {caloriesRemaining > 0 && (
          <>
            <div className={`p-3 rounded-lg ${urgency === 'critical' ? 'bg-red-500/10' : 'bg-muted/20'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Calories Needed</span>
                <span className={`text-2xl font-bold ${config.textColor}`}>
                  {caloriesRemaining}
                </span>
              </div>
              {hoursLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  ~{Math.round(caloriesPerHour)} calories/hour for {hoursLeft} hours
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Quick Calorie Boost (Low Appetite Friendly)</p>
              <div className="grid grid-cols-2 gap-2">
                {quickCalorieOptions.map((option) => (
                  <Button
                    key={option.name}
                    onClick={() => addQuickCalories(option.name, option.calories)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 text-xs border-primary/30 hover:bg-primary/20"
                  >
                    <span>{option.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-primary">+{option.calories}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {urgency === 'critical' && (
          <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-lg">
            <p className="text-red-400 text-sm font-medium mb-2">🚨 EMERGENCY PROTOCOL</p>
            <ul className="text-xs text-red-300 space-y-1">
              <li>• Liquid calories: protein shake + milk</li>
              <li>• Peanut butter straight from jar</li>
              <li>• Nuts while watching TV</li>
              <li>• Set phone alarm for every 30 min</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}