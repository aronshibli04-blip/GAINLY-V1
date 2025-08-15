import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Calendar, TrendingUp, Zap } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { Link } from "wouter";

export function MicroGoalsOverview() {
  const { user, weightEntries } = useUserStore();
  
  // Get current weight from latest entry
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : 70;
    
  const targetWeight = user?.goalWeight || 85;
  const startWeight = 70; // Should come from user's initial weight
  
  // Generate next major milestone (every 2kg)
  const nextMajorMilestone = Math.ceil(currentWeight / 2) * 2;
  const nextMilestoneAdjusted = nextMajorMilestone <= currentWeight 
    ? nextMajorMilestone + 2 
    : nextMajorMilestone;
  
  // Calculate progress and dates
  const totalWeightToGain = targetWeight - currentWeight;
  const weeksToGoal = Math.ceil(totalWeightToGain); // 1kg per week
  const estimatedGoalDate = new Date();
  estimatedGoalDate.setDate(estimatedGoalDate.getDate() + (weeksToGoal * 7));
  
  const weeksToNextMilestone = Math.ceil(nextMilestoneAdjusted - currentWeight);
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
                  {formatDate(estimatedGoalDate)}
                </span>
              </div>
              <div className="text-xs text-slate-400">Målvekt ({targetWeight}kg)</div>
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