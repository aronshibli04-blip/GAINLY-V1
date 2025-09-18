import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFFMIRecommendations } from "@/hooks/use-ffmi";
import { STANDARD_GOALS, ACCELERATED_GOALS, ALL_GOALS, type FFMIGoal } from "@shared/ffmi-goals";
import { Target, Clock, TrendingUp, Zap, Lock, Unlock, Crown, Star, Shield } from "lucide-react";

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
  userId?: string; // For unlock eligibility checking
  expertMode?: boolean; // Expert mode toggle state
  onExpertModeChange?: (enabled: boolean) => void; // Expert mode change handler
}

interface DisplayFFMIGoal extends FFMIGoal {
  targetWeight: number;
  timelineMonths: number;
  isUnlocked: boolean;
  tier: 'standard' | 'accelerated';
  difficulty: string; // Derived from category
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
  className,
  userId,
  expertMode = false,
  onExpertModeChange
}: FFMIGoalSelectorProps) {
  const [goals, setGoals] = useState<DisplayFFMIGoal[]>([]);
  const [unlockStatus, setUnlockStatus] = useState<{
    eligible: boolean;
    progressCriterion: boolean;
    consistencyCriterion: boolean;
    currentFFMI: number;
    targetFFMI: number;
    consistencyDays: number;
    progressPercentage: number;
    daysUntilUnlock?: number;
    alreadyUnlocked?: boolean;
  } | null>(null);

  // Calculate current FFMI if not provided
  const calculatedCurrentFFMI = currentFFMI || calculateFFMI(currentWeight, height, bodyFatPercentage);
  
  // Fetch recommendations from API
  const { data: recommendations, isLoading } = useFFMIRecommendations(age, gender, calculatedCurrentFFMI);

  // Check unlock eligibility
  useEffect(() => {
    if (!userId) return;
    
    const checkUnlockStatus = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/ffmi-unlock-status`);
        if (response.ok) {
          const status = await response.json();
          setUnlockStatus(status);
        }
      } catch (error) {
        console.error('Failed to fetch unlock status:', error);
      }
    };

    checkUnlockStatus();
  }, [userId]);

  useEffect(() => {
    // FIXED PROGRESSIVE DISCLOSURE: Always include accelerated goals to show locked state
    let availableGoals: FFMIGoal[] = [];
    
    if (expertMode) {
      // Expert mode: Show all goals
      availableGoals = ALL_GOALS;
    } else {
      // Standard mode: ALWAYS include both tiers for progressive disclosure
      availableGoals = [...STANDARD_GOALS, ...ACCELERATED_GOALS];
    }

    // Convert to DisplayFFMIGoal with calculated weights and timelines
    const generatedGoals: DisplayFFMIGoal[] = availableGoals
      .filter(goal => goal.ffmi > calculatedCurrentFFMI) // Only show goals above current FFMI
      .map(goal => {
        const targetWeight = calculateTargetWeight(goal.ffmi, height, bodyFatPercentage);
        const timelineMonths = estimateTimeline(calculatedCurrentFFMI, goal.ffmi, age, gender);
        
        // Determine tier and unlock status
        const isStandardGoal = STANDARD_GOALS.some(sg => sg.ffmi === goal.ffmi);
        const tier = isStandardGoal ? 'standard' : 'accelerated';
        
        // Unlock logic: Expert mode OR standard goal OR (accelerated goal AND eligible)
        const isUnlocked = expertMode || isStandardGoal || (tier === 'accelerated' && unlockStatus?.eligible === true);

        // Map category to difficulty for backwards compatibility
        const difficulty = goal.category;

        return {
          ...goal,
          targetWeight,
          timelineMonths,
          isUnlocked,
          tier,
          difficulty
        } as DisplayFFMIGoal;
      });

    setGoals(generatedGoals);
  }, [calculatedCurrentFFMI, height, bodyFatPercentage, age, gender, expertMode, unlockStatus]);

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
      {/* Header with Expert Mode Toggle */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-emerald-400" />
          Set Your Body Composition Goal
        </h3>
        <p className="text-sm text-white/70">
          Choose a realistic FFMI target based on your current level and commitment
        </p>
        
        {/* Expert Mode Toggle */}
        {onExpertModeChange && (
          <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-white/80">Expert Mode</span>
            <Switch
              checked={expertMode}
              onCheckedChange={onExpertModeChange}
              data-testid="toggle-expert-mode"
            />
            <span className="text-xs text-white/60">
              {expertMode ? "All goals visible" : "Progressive unlock"}
            </span>
          </div>
        )}
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

      {/* Enhanced Unlock Status Card - Show when not in expert mode and user is not yet eligible */}
      {!expertMode && unlockStatus && !unlockStatus.eligible && (
        <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-indigo-500/20 border border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/10">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Lock className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">
                    Unlock Elite Goals
                  </span>
                  <p className="text-xs text-purple-300 mt-0.5">
                    FFMI 22-24+ Available Soon
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10">
                <Crown className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-white/80 leading-relaxed">
                  🎯 <strong>Unlock Criteria:</strong> Achieve significant FFMI progress OR maintain 90 days of consistent logging to access elite muscle-building goals (FFMI 22-24+)
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Progress Criterion */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">Progress Path</span>
                      {unlockStatus.progressCriterion && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-bold text-cyan-400">{Math.round(unlockStatus.progressPercentage)}%</span>
                  </div>
                  <Progress 
                    value={unlockStatus.progressPercentage} 
                    className="h-3 bg-white/10"
                  />
                  <p className="text-xs text-cyan-300 mt-2">
                    Current: {unlockStatus.currentFFMI.toFixed(1)} → Target: {unlockStatus.targetFFMI.toFixed(1)} FFMI
                  </p>
                </div>
                
                {/* Consistency Criterion */}
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-3 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">Consistency Path</span>
                      {unlockStatus.consistencyCriterion && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-bold text-orange-400">{unlockStatus.consistencyDays}/90</span>
                  </div>
                  <Progress 
                    value={(unlockStatus.consistencyDays / 90) * 100} 
                    className="h-3 bg-white/10"
                  />
                  <p className="text-xs text-orange-300 mt-2">
                    {90 - unlockStatus.consistencyDays} days remaining for unlock
                  </p>
                </div>
              </div>
              
              {/* Estimated Time to Unlock */}
              {unlockStatus.daysUntilUnlock && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Estimated Unlock</span>
                  </div>
                  <p className="text-lg font-bold text-purple-300">
                    ~{unlockStatus.daysUntilUnlock} days
                  </p>
                  <p className="text-xs text-purple-300/80">
                    Based on current progress rate
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Choose Your Goal
          {!expertMode && (
            <Badge variant="outline" className="text-xs text-white/60 border-white/20">
              {goals.filter(g => g.tier === 'standard').length} Standard
              {goals.some(g => g.tier === 'accelerated') && (
                <span className="text-purple-400"> + {goals.filter(g => g.tier === 'accelerated').length} Accelerated</span>
              )}
            </Badge>
          )}
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const isSelected = selectedFFMI === goal.ffmi;
            const weightGain = goal.targetWeight - currentWeight;
            const isLocked = !goal.isUnlocked;
            
            return (
              <Card
                key={goal.ffmi}
                className={cn(
                  "transition-all duration-200 backdrop-blur-sm",
                  isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95",
                  isSelected 
                    ? "bg-emerald-500/30 border-emerald-500/50 ring-2 ring-emerald-400/50" 
                    : goal.tier === 'accelerated' 
                      ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
                onClick={() => {
                  if (!isLocked) {
                    onGoalSelect(goal.ffmi, goal.targetWeight, goal.timelineMonths);
                  }
                }}
                data-testid={`goal-card-ffmi-${goal.ffmi}`}
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
                            : goal.tier === 'accelerated'
                              ? "border-purple-400/50 text-purple-300"
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
                      {goal.tier === 'accelerated' && (
                        <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                          <Crown className="h-3 w-3 mr-1" />
                          Elite
                        </Badge>
                      )}
                    </div>
                    {isLocked && <Lock className="h-4 w-4 text-yellow-400" />}
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