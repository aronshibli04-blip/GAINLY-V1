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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Goal Weight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="goal-weight" className="text-sm text-muted-foreground">
                Goal weight (kg)
              </Label>
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. 75"
                className="grok-input mt-1"
                data-testid="input-goal-weight"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveGoal}
                className="flex-1 grok-gradient h-10"
                data-testid="button-save-goal"
              >
                <Check className="h-4 w-4 mr-2 text-black" />
                Save Goal
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-10"
                data-testid="button-cancel-goal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : hasGoal ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted/20">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-lg font-bold text-white">
                  {currentWeight}kg
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                data-testid="button-edit-goal"
              >
                <p className="text-xs text-muted-foreground">Goal (tap to edit)</p>
                <p className="text-lg font-bold text-primary">
                  {goalWeight}kg
                </p>
              </button>
              <div className="p-3 rounded-lg bg-muted/20">
                <p className="text-xs text-muted-foreground">To Go</p>
                <p className="text-lg font-bold text-white">
                  {Math.max(0, goalWeight - currentWeight).toFixed(1)}kg
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium">
                  {progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {weeksToGoal !== null && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Time to goal</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {weeksToGoal === 0 ? "Goal reached! 🎉" : 
                   weeksToGoal === 1 ? "1 week" : 
                   `${weeksToGoal} weeks`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Set a clear weight goal to track your hardgainer progress
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full grok-gradient h-10"
              data-testid="button-set-goal"
            >
              <Target className="h-4 w-4 mr-2 text-black" />
              Set Goal Weight
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}