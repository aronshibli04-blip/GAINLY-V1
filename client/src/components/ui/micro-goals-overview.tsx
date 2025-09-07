import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Calendar, TrendingUp, Zap, Clock } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Link } from "wouter";

export function MicroGoalsOverview() {
  const { user, weightEntries } = useUserStore();
  
  // Get current weight from latest entry
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : null;
    
  const targetWeight = user?.goalWeight;
  const startWeight = weightEntries.length > 0 
    ? weightEntries[0].weight 
    : null;
  
  // Don't show if no weight data
  if (!currentWeight || !targetWeight || !startWeight) {
    return (
      <Card className="border-slate-600/40 bg-slate-800/40">
        <CardContent className="p-4 text-center">
          <Target className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-1">No milestone data yet</p>
          <p className="text-xs text-slate-500">Log your weight and set goals to see progress</p>
        </CardContent>
      </Card>
    );
  }

  // Generate next major milestone (every 2kg)
  const nextMajorMilestone = Math.ceil(currentWeight / 2) * 2;
  const nextMilestoneAdjusted = nextMajorMilestone <= currentWeight 
    ? nextMajorMilestone + 2 
    : nextMajorMilestone;
  
  // Calculate actual weight trend (kg per week)
  let actualWeightTrend = 0;
  if (weightEntries.length >= 2) {
    const sortedWeights = [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWeight = sortedWeights[0].weight;
    const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
    const daysDiff = Math.abs(
      new Date(sortedWeights[sortedWeights.length - 1].date).getTime() - 
      new Date(sortedWeights[0].date).getTime()
    ) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 0) {
      actualWeightTrend = ((lastWeight - firstWeight) / daysDiff) * 7; // kg per week
    }
  }

  // Calculate progress and dates using actual trend if positive, otherwise default
  const isGoodProgress = actualWeightTrend >= 0.5; // Only show predictions for good progress
  const trendToUse = isGoodProgress ? actualWeightTrend : 1; // Fallback to 1kg/week
  
  const totalWeightToGain = targetWeight - currentWeight;
  const weeksToGoal = totalWeightToGain / trendToUse;
  const estimatedGoalDate = new Date();
  estimatedGoalDate.setDate(estimatedGoalDate.getDate() + (weeksToGoal * 7));
  
  const weightToNextMilestone = nextMilestoneAdjusted - currentWeight;
  const weeksToNextMilestone = weightToNextMilestone / trendToUse;
  const nextMilestoneDate = new Date();
  nextMilestoneDate.setDate(nextMilestoneDate.getDate() + (weeksToNextMilestone * 7));
  
  const progressToNext = ((currentWeight - Math.floor(currentWeight / 2) * 2) / 2) * 100;
  const totalProgress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nb-NO', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  return (
    <Link href="/goals">
      <Card className="grok-glow-hover cursor-pointer border-blue-400/20 hover:border-blue-400/40 transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400">Neste Milepæl</span>
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-400/40 text-xs">
              {nextMilestoneAdjusted}kg
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress to Next Milestone */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Fremgang til {nextMilestoneAdjusted}kg</span>
              <span className="text-sm text-blue-400 font-medium">
                {(nextMilestoneAdjusted - currentWeight).toFixed(1)}kg igjen
              </span>
            </div>
            <Progress value={Math.max(0, progressToNext)} className="h-2" />
          </div>
          
          {/* Timeline Predictor - Only show for good progress */}
          {isGoodProgress && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Timeline Predictor</span>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/40 text-xs">
                  +{actualWeightTrend.toFixed(1)}kg/uke
                </Badge>
              </div>
              <div className="text-xs text-emerald-300/90">
                At your current pace, you'll reach <span className="font-semibold text-emerald-300">{targetWeight}kg by {formatDate(estimatedGoalDate)}</span>
              </div>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {formatDate(nextMilestoneDate)}
                </span>
              </div>
              <div className="text-xs text-slate-400">Neste belønning</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">
                  {isGoodProgress ? formatDate(estimatedGoalDate) : 'Keep logging'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {isGoodProgress ? `Målvekt (${targetWeight}kg)` : 'Build consistency'}
              </div>
            </div>
          </div>
          
          {/* Total Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">Total fremgang</span>
              <span className="text-xs text-slate-300">
                {(currentWeight - startWeight).toFixed(1)}kg / {(targetWeight - startWeight)}kg
              </span>
            </div>
            <Progress value={Math.min(totalProgress, 100)} className="h-1.5" />
          </div>
          
          {/* Call to Action */}
          <div className="flex items-center justify-center pt-2">
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Zap className="h-3 w-3" />
              <span>Trykk for å se alle milepæler</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}