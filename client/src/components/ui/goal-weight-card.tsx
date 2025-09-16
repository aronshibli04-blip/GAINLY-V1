import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/userStore";
import { Target, Edit2, Check, X, TrendingUp, Zap, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTargetWeight, safeProgressCalculation, getWeeksToTarget, hasFFMIGoals, getFFMIStatusText } from "@/utils/weight-utils";

export function GoalWeightCard() {
  const { user, weightEntries } = useUserStore();
  const { toast } = useToast();

  if (!user) return null;

  const currentWeight = weightEntries.length > 0 
    ? weightEntries[0].weight // Most recent weight
    : user.weight;

  // FFMI-based scientific goal system using utility functions
  const targetWeight = getTargetWeight(user);
  const hasFFMIGoal = hasFFMIGoals(user);
  const statusText = getFFMIStatusText(user);

  // Navigate to setup if no FFMI goal is set
  const handleSetupFFMIGoal = () => {
    // Navigate to FFMI onboarding setup flow
    window.location.href = '/setup';
    toast({
      title: "🧬 Starting FFMI Setup",
      description: "Setting up your scientific body composition goals!",
    });
  };

  // Use utility functions for safe calculations
  const startWeight = user.weight ? Number(user.weight) : null;
  const progress = safeProgressCalculation(startWeight, currentWeight, targetWeight);
  const weeksToGoal = getWeeksToTarget(currentWeight, targetWeight);

  return (
    <Card className="grok-glow-hover border-primary/20">
      <CardContent className="p-4">
        {hasFFMIGoal ? (
          <div className="space-y-3">
            {/* FFMI-based scientific goal header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Scientific Goal</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                {statusText}
              </div>
            </div>

            {/* FFMI-based stats in single row */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-white">{currentWeight?.toFixed(1) || '0.0'}kg</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{targetWeight.toFixed(1)}kg</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-400">{Math.max(0, targetWeight - (currentWeight || 0)).toFixed(1)}kg</p>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Scientific Goal</span>
              </div>
              <Button
                onClick={handleSetupFFMIGoal}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-7 px-3 text-xs text-white"
                data-testid="button-setup-ffmi"
              >
                <Zap className="h-3 w-3 mr-1" />
                Setup FFMI
              </Button>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
              <p className="text-xs text-amber-300 font-medium mb-1">🧬 Science-Based Goals</p>
              <p className="text-xs text-white/80 mb-2">
                Set your Fat-Free Mass Index (FFMI) goal for scientifically calculated target weight based on your body composition.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-emerald-400" />
                  <span className="text-white/70">Realistic Targets</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-400" />
                  <span className="text-white/70">Optimal Timeline</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}