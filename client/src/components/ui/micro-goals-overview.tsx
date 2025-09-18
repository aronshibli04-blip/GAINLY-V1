import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Calendar, TrendingUp, Zap, Clock, Crown, Lock, Unlock } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { STANDARD_GOALS, ACCELERATED_GOALS } from "@shared/ffmi-goals";

// Calculate FFMI from weight, height, and body fat
function calculateFFMI(weight: number, height: number, bodyFatPercentage: number): number {
  const heightInM = height / 100;
  const fatFreeWeight = weight * (1 - bodyFatPercentage / 100);
  const ffmi = fatFreeWeight / (heightInM * heightInM);
  return Math.round(ffmi * 10) / 10;
}

export function MicroGoalsOverview() {
  const { user, weightEntries } = useUserStore();
  const [unlockStatus, setUnlockStatus] = useState<{
    eligible: boolean;
    progressCriterion: boolean;
    consistencyCriterion: boolean;
    currentFFMI: number;
    targetFFMI: number;
    consistencyDays: number;
    progressPercentage: number;
    daysUntilUnlock?: number;
  } | null>(null);
  
  // Get current weight and user data
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : null;
  
  const userId = localStorage.getItem("userId") || "user1";
  
  // Only calculate FFMI if we have all required real data
  const hasRequiredData = user && currentWeight && user.height && user.bodyFatPercentage;
  const currentFFMI = hasRequiredData && user.height && user.bodyFatPercentage
    ? calculateFFMI(currentWeight, user.height, user.bodyFatPercentage)
    : null;
  
  // Check unlock eligibility
  useEffect(() => {
    if (!userId || !hasRequiredData) return;
    
    const checkUnlockStatus = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/ffmi-unlock-status`);
        if (response.ok) {
          const status = await response.json();
          setUnlockStatus(status);
        } else {
          // Handle fetch error silently but set empty state
          setUnlockStatus({
            eligible: false,
            progressCriterion: false,
            consistencyCriterion: false,
            currentFFMI: currentFFMI || 0,
            targetFFMI: 0,
            consistencyDays: 0,
            progressPercentage: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch unlock status:', error);
        // Set fallback state on error
        setUnlockStatus({
          eligible: false,
          progressCriterion: false,
          consistencyCriterion: false,
          currentFFMI: currentFFMI || 0,
          targetFFMI: 0,
          consistencyDays: 0,
          progressPercentage: 0
        });
      }
    };

    checkUnlockStatus();
  }, [userId, hasRequiredData, currentFFMI]);
  
  // Don't show if no complete user data
  if (!hasRequiredData || !currentFFMI) {
    return (
      <Card className="border-slate-600/40 bg-slate-800/40">
        <CardContent className="p-4 text-center">
          <Target className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-1">Complete setup to see FFMI goals</p>
          <p className="text-xs text-slate-500">Add height, body fat %, and weight to track progress</p>
        </CardContent>
      </Card>
    );
  }

  // Get all goals sorted by FFMI
  const allGoals = [...STANDARD_GOALS, ...ACCELERATED_GOALS].sort((a, b) => a.ffmi - b.ffmi);
  
  // Find previous and next goals for proper progress calculation
  const prevGoal = allGoals
    .filter(goal => goal.ffmi <= currentFFMI)
    .sort((a, b) => b.ffmi - a.ffmi)[0]; // Get highest achieved goal
  
  const nextGoal = allGoals
    .filter(goal => goal.ffmi > currentFFMI)
    .sort((a, b) => a.ffmi - b.ffmi)[0]; // Get lowest unachieved goal
  
  if (!nextGoal) {
    return (
      <Card className="border-emerald-600/40 bg-emerald-800/20">
        <CardContent className="p-4 text-center">
          <Crown className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-emerald-400 mb-1">Maximum FFMI achieved!</p>
          <p className="text-xs text-emerald-500">You've reached genetic potential</p>
        </CardContent>
      </Card>
    );
  }
  
  // Check if next goal is accelerated and unlock status (with loading state)
  const isNextGoalAccelerated = ACCELERATED_GOALS.some(g => g.ffmi === nextGoal.ffmi);
  const isUnlockStatusLoading = unlockStatus === null;
  const hasAcceleratedAccess = unlockStatus?.eligible || false;
  const isNextGoalLocked = isNextGoalAccelerated && !isUnlockStatusLoading && !hasAcceleratedAccess;
  
  // Fix progress calculation with proper baseline and division guard
  const baselineFFMI = prevGoal?.ffmi ?? currentFFMI;
  const denominator = nextGoal.ffmi - baselineFFMI;
  const ffmiProgress = denominator > 0 
    ? Math.max(0, Math.min(100, ((currentFFMI - baselineFFMI) / denominator) * 100))
    : 0;
  
  return (
    <Link href="/goals">
      <Card className={`grok-glow-hover cursor-pointer transition-all ${
        isNextGoalLocked 
          ? 'border-purple-400/30 hover:border-purple-400/50' 
          : 'border-emerald-400/30 hover:border-emerald-400/50'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUnlockStatusLoading && isNextGoalAccelerated ? (
                <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
              ) : isNextGoalLocked ? (
                <Lock className="h-5 w-5 text-purple-400" />
              ) : (
                <Target className="h-5 w-5 text-emerald-400" />
              )}
              <span className={`${
                isUnlockStatusLoading && isNextGoalAccelerated 
                  ? 'text-amber-400' 
                  : isNextGoalLocked 
                    ? 'text-purple-400' 
                    : 'text-emerald-400'
              }`}>
                {isUnlockStatusLoading && isNextGoalAccelerated 
                  ? 'Checking Elite Access...' 
                  : isNextGoalLocked 
                    ? 'Locked Elite Goal' 
                    : 'Next FFMI Goal'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${
                isNextGoalLocked 
                  ? 'text-purple-400 border-purple-400/40' 
                  : 'text-emerald-400 border-emerald-400/40'
              }`}>
                FFMI {nextGoal.ffmi}
              </Badge>
              {isNextGoalAccelerated && (
                <Crown className="h-4 w-4 text-yellow-400" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Goal Description */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-sm text-slate-300 font-medium">{nextGoal.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs text-slate-400">
                {nextGoal.category}
              </Badge>
              {isNextGoalAccelerated && (
                <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/40">
                  Elite Tier
                </Badge>
              )}
            </div>
          </div>

          {/* Progress to Next Goal */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">
                FFMI Progress ({currentFFMI} → {nextGoal.ffmi})
              </span>
              <span className={`text-sm font-medium ${
                isNextGoalLocked ? 'text-purple-400' : 'text-emerald-400'
              }`}>
                {(nextGoal.ffmi - currentFFMI).toFixed(1)} to go
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(ffmiProgress, 100))} 
              className="h-2" 
            />
          </div>

          {/* Unlock Status for Elite Goals */}
          {isNextGoalLocked && unlockStatus && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-400">Unlock Progress</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-purple-300/70 mb-1">Progress Path</div>
                  <div className="text-xs text-purple-300 font-medium">
                    {Math.round(unlockStatus.progressPercentage)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-orange-300/70 mb-1">Consistency</div>
                  <div className="text-xs text-orange-300 font-medium">
                    {unlockStatus.consistencyDays}/90 days
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Zap className="h-3 w-3" />
              <span>View all FFMI goals</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}