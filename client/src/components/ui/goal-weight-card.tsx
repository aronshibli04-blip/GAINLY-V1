import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/userStore";
import { Target, Edit2, Check, X, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GoalWeightCard() {
  const { user, setGoalWeight, weightEntries } = useUserStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(user?.goalWeight?.toString() || "");

  if (!user) return null;

  const currentWeight = weightEntries.length > 0 
    ? weightEntries[0].weight // Most recent weight
    : user.weight;

  const goalWeight = user.goalWeight;
  const hasGoal = goalWeight && goalWeight > 0;

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInput);
    
    if (isNaN(newGoal) || newGoal <= 0) {
      toast({
        title: "Invalid goal weight",
        description: "Please enter a valid weight greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (newGoal <= currentWeight) {
      toast({
        title: "Goal too low",
        description: "Your goal weight should be higher than your current weight for bulking",
        variant: "destructive",
      });
      return;
    }

    setGoalWeight(newGoal);
    setIsEditing(false);
    toast({
      title: "Goal weight updated!",
      description: `Your new goal is ${newGoal}kg. Let's get there! 💪`,
    });
  };

  const handleCancel = () => {
    setGoalInput(user?.goalWeight?.toString() || "");
    setIsEditing(false);
  };

  const calculateProgress = () => {
    if (!hasGoal) return 0;
    const totalGain = goalWeight - user.weight; // Total weight to gain from starting weight
    const currentGain = currentWeight - user.weight; // Current weight gained
    return Math.max(0, Math.min(100, (currentGain / totalGain) * 100));
  };

  const getTimeToGoal = () => {
    if (!hasGoal) return null;
    const remainingWeight = goalWeight - currentWeight;
    const weeksToGoal = remainingWeight / 1.0; // 1kg per week target
    return Math.max(0, Math.ceil(weeksToGoal));
  };

  const progress = calculateProgress();
  const weeksToGoal = getTimeToGoal();

  return (
    <Card className="grok-glow-hover border-primary/20">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Label htmlFor="goal-weight" className="text-sm font-medium text-white">
                Set Goal Weight (kg)
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. 75"
                className="grok-input flex-1"
                data-testid="input-goal-weight"
              />
              <Button
                onClick={handleSaveGoal}
                className="grok-gradient px-3"
                data-testid="button-save-goal"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-3"
                data-testid="button-cancel-goal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : hasGoal ? (
          <div className="space-y-3">
            {/* Compact header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Goal Weight</span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
                data-testid="button-edit-goal"
              >
                Edit Goal
              </button>
            </div>

            {/* Compact stats in single row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-white">{currentWeight}kg</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{goalWeight}kg</p>
                <p className="text-xs text-muted-foreground">Goal</p>
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-400">{Math.max(0, goalWeight - currentWeight).toFixed(1)}kg</p>
                <p className="text-xs text-muted-foreground">To Go</p>
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-400">{weeksToGoal || 0}w</p>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>
            </div>

            {/* Minimal progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Goal Weight</span>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="grok-gradient h-7 px-3 text-xs"
                data-testid="button-set-goal"
              >
                Set Goal
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set a weight goal to track your progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}