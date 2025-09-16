import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useFFMIRecommendations } from "@/hooks/use-ffmi";
import { Target, Clock, TrendingUp, Zap } from "lucide-react";

interface FFMIGoalSelectorProps {
  currentWeight: number;
  height: number;
  bodyFatPercentage: number;
  age: number;
  gender: 'male' | 'female';
  currentFFMI?: number;
  selectedFFMI: number | null;
  selectedTargetWeight: number | null;
  onGoalSelect: (ffmi: number, targetWeight: number, timelineMonths: number) => void;
  className?: string;
}

interface FFMIGoal {
  ffmi: number;
  targetWeight: number;
  timelineMonths: number;
  difficulty: string;
  description: string;
  classification: string;
}

// Calculate FFMI from weight, height, and body fat
function calculateFFMI(weight: number, height: number, bodyFatPercentage: number): number {
  const heightInM = height / 100;
  const fatFreeWeight = weight * (1 - bodyFatPercentage / 100);
  const ffmi = fatFreeWeight / (heightInM * heightInM);
  return Math.round(ffmi * 10) / 10;
}

// Calculate target weight from FFMI, height, and body fat
function calculateTargetWeight(targetFFMI: number, height: number, bodyFatPercentage: number): number {
  const heightInM = height / 100;
  const fatFreeWeight = targetFFMI * (heightInM * heightInM);
  const targetWeight = fatFreeWeight / (1 - bodyFatPercentage / 100);
  return Math.round(targetWeight * 10) / 10;
}

// Estimate timeline based on FFMI gain (conservative: 1-2 FFMI points per year)
function estimateTimeline(currentFFMI: number, targetFFMI: number, age: number, gender: string): number {
  const ffmiGain = targetFFMI - currentFFMI;
  if (ffmiGain <= 0) return 0;

  // Base rate: 1.5 FFMI points per year for males, 1.0 for females
  let baseRate = gender === 'male' ? 1.5 : 1.0;
  
  // Age adjustments - slower gains with age
  if (age > 30) baseRate *= 0.8;
  if (age > 40) baseRate *= 0.7;
  if (age > 50) baseRate *= 0.6;

  const yearsNeeded = ffmiGain / baseRate;
  return Math.ceil(yearsNeeded * 12); // Convert to months, round up
}

function getFFMIClassification(ffmi: number, gender: string): string {
  if (gender === 'male') {
    if (ffmi >= 25) return "Elite";
    if (ffmi >= 23) return "Excellent";
    if (ffmi >= 21) return "Very Good";
    if (ffmi >= 19) return "Good";
    if (ffmi >= 17) return "Average";
    return "Below Average";
  } else {
    if (ffmi >= 22) return "Elite";
    if (ffmi >= 20) return "Excellent";
    if (ffmi >= 18) return "Very Good";
    if (ffmi >= 16) return "Good";
    if (ffmi >= 14) return "Average";
    return "Below Average";
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'text-green-400';
    case 'intermediate': return 'text-yellow-400';
    case 'advanced': return 'text-orange-400';
    case 'expert': return 'text-red-400';
    default: return 'text-white';
  }
}

export function FFMIGoalSelector({
  currentWeight,
  height,
  bodyFatPercentage,
  age,
  gender,
  currentFFMI,
  selectedFFMI,
  selectedTargetWeight,
  onGoalSelect,
  className
}: FFMIGoalSelectorProps) {
  const [goals, setGoals] = useState<FFMIGoal[]>([]);

  // Calculate current FFMI if not provided
  const calculatedCurrentFFMI = currentFFMI || calculateFFMI(currentWeight, height, bodyFatPercentage);
  
  // Fetch recommendations from API
  const { data: recommendations, isLoading } = useFFMIRecommendations(age, gender, calculatedCurrentFFMI);

  useEffect(() => {
    // Generate goal options
    const ffmiOptions = gender === 'male' 
      ? [18, 19, 20, 21, 22, 23, 24, 25] 
      : [15, 16, 17, 18, 19, 20, 21, 22];

    const generatedGoals: FFMIGoal[] = ffmiOptions
      .filter(ffmi => ffmi > calculatedCurrentFFMI) // Only show goals above current FFMI
      .map(ffmi => {
        const targetWeight = calculateTargetWeight(ffmi, height, bodyFatPercentage);
        const timelineMonths = estimateTimeline(calculatedCurrentFFMI, ffmi, age, gender);
        const classification = getFFMIClassification(ffmi, gender);
        
        let difficulty = 'Beginner';
        let description = '';

        if (gender === 'male') {
          if (ffmi <= 19) {
            difficulty = 'Beginner';
            description = 'Lean and fit - achievable with consistent training';
          } else if (ffmi <= 21) {
            difficulty = 'Intermediate';
            description = 'Athletic physique - requires dedicated training';
          } else if (ffmi <= 23) {
            difficulty = 'Advanced';
            description = 'Very muscular - serious training and nutrition needed';
          } else {
            difficulty = 'Expert';
            description = 'Elite level - exceptional genetics and training required';
          }
        } else {
          if (ffmi <= 17) {
            difficulty = 'Beginner';
            description = 'Toned and athletic - achievable with consistent training';
          } else if (ffmi <= 19) {
            difficulty = 'Intermediate';
            description = 'Strong and defined - dedicated training required';
          } else if (ffmi <= 21) {
            difficulty = 'Advanced';
            description = 'Very muscular - serious commitment needed';
          } else {
            difficulty = 'Expert';
            description = 'Elite athlete level - exceptional dedication required';
          }
        }

        return {
          ffmi,
          targetWeight,
          timelineMonths,
          difficulty,
          description,
          classification
        };
      });

    setGoals(generatedGoals);
  }, [calculatedCurrentFFMI, height, bodyFatPercentage, age, gender]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const selectedGoal = goals.find(goal => goal.ffmi === selectedFFMI);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Set Your Body Composition Goal
        </h3>
        <p className="text-sm text-white/70">
          Choose a realistic FFMI target based on your current level and commitment
        </p>
      </div>

      {/* Current Stats */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/80">Current Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">FFMI</span>
            <Badge variant="outline" className="border-emerald-400/30 text-emerald-300">
              {calculatedCurrentFFMI} ({getFFMIClassification(calculatedCurrentFFMI, gender)})
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Weight</span>
            <span className="text-sm text-white">{currentWeight}kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/70">Body Fat</span>
            <span className="text-sm text-white">{bodyFatPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Goal Display */}
      {selectedGoal && (
        <Card className="bg-emerald-500/20 border-emerald-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                    FFMI {selectedGoal.ffmi}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getDifficultyColor(selectedGoal.difficulty))}>
                    {selectedGoal.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-white/90">{selectedGoal.description}</p>
              </div>
            </div>
            
            <Separator className="bg-white/10 mb-3" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-white/70">Target Weight</p>
                  <p className="text-sm font-semibold text-white">{selectedGoal.targetWeight}kg</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-white/70">Timeline</p>
                  <p className="text-sm font-semibold text-white">
                    {Math.floor(selectedGoal.timelineMonths / 12)}y {selectedGoal.timelineMonths % 12}m
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Progress to Goal</span>
                <span>{Math.round(((calculatedCurrentFFMI / selectedGoal.ffmi) * 100))}%</span>
              </div>
              <Progress 
                value={(calculatedCurrentFFMI / selectedGoal.ffmi) * 100} 
                className="h-2 bg-white/10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Choose Your Goal
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const isSelected = selectedFFMI === goal.ffmi;
            const weightGain = goal.targetWeight - currentWeight;
            
            return (
              <Card
                key={goal.ffmi}
                className={cn(
                  "cursor-pointer transition-all duration-200 backdrop-blur-sm",
                  "hover:scale-105 active:scale-95",
                  isSelected 
                    ? "bg-emerald-500/30 border-emerald-500/50 ring-2 ring-emerald-400/50" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
                onClick={() => onGoalSelect(goal.ffmi, goal.targetWeight, goal.timelineMonths)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-mono text-xs",
                          isSelected 
                            ? "border-emerald-400/50 text-emerald-300" 
                            : "border-white/30 text-white/80"
                        )}
                      >
                        FFMI {goal.ffmi}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getDifficultyColor(goal.difficulty))}
                      >
                        {goal.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">
                    {goal.description}
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/70">
                      Target: <span className="text-white font-medium">{goal.targetWeight}kg</span>
                      <span className="text-emerald-400"> (+{weightGain.toFixed(1)}kg)</span>
                    </span>
                    <span className="text-white/70">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {Math.floor(goal.timelineMonths / 12)}y {goal.timelineMonths % 12}m
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-white/60 max-w-md mx-auto">
          💡 <strong>Scientific Approach:</strong> These goals are based on your current body composition 
          and realistic muscle gain rates. FFMI (Fat-Free Mass Index) provides achievable targets 
          unlike arbitrary weight goals.
        </p>
      </div>
    </div>
  );
}