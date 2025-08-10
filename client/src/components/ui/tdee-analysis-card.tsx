import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { calculateTdee } from "@/utils/tdee";
import { Brain, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";

export function TdeeAnalysisCard() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { 
    weightEntries, 
    calorieEntries, 
    currentTdeeAnalysis, 
    setTdeeAnalysis 
  } = useUserStore();

  const calculation = calculateTdee(weightEntries, calorieEntries, "user1");
  
  // Auto-update analysis if it's outdated or doesn't exist
  const needsUpdate = !currentTdeeAnalysis || 
    Math.abs(currentTdeeAnalysis.tdee - calculation.tdee) > 50;

  const handleUpdateAnalysis = () => {
    setIsUpdating(true);
    
    const analysis = {
      id: Date.now().toString(),
      userId: "user1",
      tdee: calculation.tdee,
      surplus: 1100, // Aggressive surplus for 1kg/week gain
      targetCalories: calculation.tdee + 1100,
      confidence: calculation.confidence,
      dataPoints: Math.min(weightEntries.length, calorieEntries.length),
      weekNumber: Math.ceil(weightEntries.length / 7),
      createdAt: new Date().toISOString(),
    };

    setTdeeAnalysis(analysis);
    setIsUpdating(false);
  };

  // Auto-update if needed
  if (needsUpdate && !isUpdating) {
    handleUpdateAnalysis();
  }

  const analysis = currentTdeeAnalysis || {
    tdee: calculation.tdee,
    targetCalories: calculation.tdee + 1100,
    confidence: calculation.confidence
  };

  const weeklyGainGoal = 1.0; // 1kg per week
  const dailySurplus = 1100; // Calories for 1kg/week (1100 cal/day ≈ 1kg/week)

  return (
    <Card className="grok-glow border-primary/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-white">AI TDEE Calibration</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpdateAnalysis}
            disabled={isUpdating}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Current TDEE</p>
            <p className="text-lg font-bold text-primary">
              {analysis.tdee} kcal
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Target Intake</p>
            <p className="text-lg font-bold text-primary">
              {analysis.targetCalories} kcal
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Daily Surplus</span>
            <Badge className="grok-gradient text-black">
              +{dailySurplus} kcal
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Weekly Goal</span>
            <Badge variant="outline" className="border-primary/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{weeklyGainGoal}kg/week
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <Badge 
              variant={analysis.confidence >= 0.7 ? "default" : "outline"}
              className={analysis.confidence >= 0.7 ? "bg-green-600" : ""}
            >
              {Math.round(analysis.confidence * 100)}%
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          Continuously recalibrated with each weight, calorie & activity entry
        </div>
      </CardContent>
    </Card>
  );
}