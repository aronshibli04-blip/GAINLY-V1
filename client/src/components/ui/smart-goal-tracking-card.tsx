import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { 
  Target, 
  TrendingUp, 
  Trophy,
  Clock,
  Zap,
  Star,
  Award,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useMemo } from "react";

interface SmartGoalTrackingCardProps {
  targetCalories: number;
}

interface Milestone {
  ffmi: number;
  weight: number;
  achieved: boolean;
  description: string;
}

interface GoalProgress {
  currentFFMI: number;
  targetFFMI: number;
  currentWeight: number;
  targetWeight: number;
  ffmiProgressPercent: number;
  weightProgressPercent: number;
  weightRemaining: number;
  estimatedMonths: number;
  classification: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goalDescription: string;
  milestones: Milestone[];
}

export function SmartGoalTrackingCard({ targetCalories }: SmartGoalTrackingCardProps) {
  const { user, weightEntries } = useUserStore();
  
  // Calculate goal progress metrics with proper FFMI-based calculations
  const getGoalProgress = useMemo((): GoalProgress | null => {
    if (!user || !user.height || !user.targetFFMI || !user.calculatedTargetWeight) {
      return null;
    }
    
    // Get current weight (latest entry or user profile weight) - clone array to avoid mutation
    const latestWeight = weightEntries.length > 0 
      ? [...weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight
      : user.weight || 0;
    
    // Calculate current FFMI (use user's body fat or sex-aware defaults)
    const bodyFatPercentage = user.bodyFatPercentage || (user.sex === 'female' ? 16 : 12);
    const heightM = user.height / 100;
    const leanBodyMass = latestWeight * (1 - bodyFatPercentage / 100);
    const currentFFMI = leanBodyMass / (heightM * heightM);
    
    const targetFFMI = parseFloat(user.targetFFMI.toString());
    const targetWeight = parseFloat(user.calculatedTargetWeight.toString());
    const weightRemaining = Math.max(0, targetWeight - latestWeight);
    
    // FFMI-based progress calculation
    const ffmiProgressPercent = Math.min((currentFFMI / targetFFMI) * 100, 100);
    const weightProgressPercent = Math.min((latestWeight / targetWeight) * 100, 100);
    
    // Smart timeline calculation using realistic TDEE estimation
    const baseMetabolicRate = user.sex === 'female' 
      ? 655 + (9.6 * latestWeight) + (1.8 * user.height) - (4.7 * user.age)
      : 66 + (13.7 * latestWeight) + (5 * user.height) - (6.8 * user.age);
    
    const activityMultiplier = user.activityLevel === 'very_active' ? 1.725 :
                              user.activityLevel === 'moderately_active' ? 1.55 :
                              user.activityLevel === 'lightly_active' ? 1.375 : 1.2;
    
    const estimatedTDEE = baseMetabolicRate * activityMultiplier;
    const dailySurplus = targetCalories - estimatedTDEE;
    const weeklyCalorieSurplus = dailySurplus * 7;
    
    let estimatedMonths;
    if (weeklyCalorieSurplus <= 0) {
      estimatedMonths = 0; // No surplus, no gain timeline
    } else {
      const weeklyWeightGain = Math.min(weeklyCalorieSurplus / 7700, 1.0); // Max 1kg/week for realism
      const estimatedWeeks = Math.ceil(weightRemaining / weeklyWeightGain);
      estimatedMonths = Math.ceil(estimatedWeeks / 4.33);
    }
    
    // Determine goal classification and difficulty
    const ffmiDifference = targetFFMI - currentFFMI;
    let classification = 'Beginner Progress';
    let difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite' = 'beginner';
    let goalDescription = 'Building Foundation';
    
    if (currentFFMI >= 22) {
      classification = 'Elite Development';
      difficulty = 'elite';
      goalDescription = 'Near Genetic Potential';
    } else if (currentFFMI >= 20) {
      classification = 'Advanced Training';
      difficulty = 'advanced';
      goalDescription = 'Excellent Physique';
    } else if (currentFFMI >= 18) {
      classification = 'Intermediate Progress';
      difficulty = 'intermediate';
      goalDescription = 'Solid Muscular Development';
    } else if (user.sex === 'female' && currentFFMI >= 16) {
      classification = 'Good Development';
      difficulty = 'intermediate';
      goalDescription = 'Athletic Build';
    }
    
    // Calculate milestones (25%, 50%, 75%, 100%) - fixed achievement logic
    const milestones: Milestone[] = [];
    const ffmiSteps = [0.25, 0.5, 0.75, 1.0];
    const progressRatio = targetFFMI > currentFFMI ? (currentFFMI - (currentFFMI * 0.9)) / (targetFFMI - (currentFFMI * 0.9)) : 1;
    
    ffmiSteps.forEach((step, index) => {
      const milestoneFFMI = currentFFMI + (targetFFMI - currentFFMI) * step;
      const milestoneWeight = latestWeight + (targetWeight - latestWeight) * step;
      const achieved = progressRatio >= step || currentFFMI >= targetFFMI * step;
      
      milestones.push({
        ffmi: Math.round(milestoneFFMI * 10) / 10,
        weight: Math.round(milestoneWeight * 10) / 10,
        achieved,
        description: step === 1.0 ? 'Target Achieved!' : 
                    step === 0.75 ? 'Almost There!' :
                    step === 0.5 ? 'Halfway Point' : 'First Quarter'
      });
    });
    
    return {
      currentFFMI: Math.round(currentFFMI * 10) / 10,
      targetFFMI,
      currentWeight: latestWeight,
      targetWeight,
      ffmiProgressPercent,
      weightProgressPercent,
      weightRemaining,
      estimatedMonths,
      classification,
      difficulty,
      goalDescription,
      milestones
    };
  }, [user, weightEntries, targetCalories]);
  
  const goalProgress = getGoalProgress;
  
  // Get status colors based on progress and difficulty
  const getStatusColors = () => {
    if (!goalProgress) return { color: 'text-slate-400', bg: 'bg-slate-500/20', accent: 'text-slate-400' };
    
    if (goalProgress.ffmiProgressPercent >= 90) {
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', accent: 'text-emerald-400' };
    } else if (goalProgress.ffmiProgressPercent >= 70) {
      return { color: 'text-amber-400', bg: 'bg-amber-500/20', accent: 'text-amber-400' };
    } else if (goalProgress.ffmiProgressPercent >= 40) {
      return { color: 'text-orange-400', bg: 'bg-orange-500/20', accent: 'text-orange-400' };
    } else {
      return { color: 'text-cyan-400', bg: 'bg-cyan-500/20', accent: 'text-cyan-400' };
    }
  };
  
  const statusColors = getStatusColors();
  
  // Get difficulty badge styling
  const getDifficultyBadge = () => {
    if (!goalProgress) return { icon: Target, color: 'text-slate-400', bg: 'bg-slate-500/20' };
    
    switch (goalProgress.difficulty) {
      case 'elite':
        return { icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20' };
      case 'advanced':
        return { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'intermediate':
        return { icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20' };
      default:
        return { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    }
  };
  
  const difficultyBadge = getDifficultyBadge();
  const DifficultyIcon = difficultyBadge.icon;

  // Show setup card if no goals configured
  if (!goalProgress) {
    return (
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-cyan-500 to-blue-600" />
        
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-cyan-400" />
              <span className="text-sm font-semibold">Goal Setup</span>
            </div>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                Set Goals
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Target className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-white font-medium mb-2">Set Your FFMI Goals</div>
            <div className="text-slate-300 text-sm mb-4">
              Define your target physique and track your progress with precision FFMI calculations.
            </div>
            <Link href="/goals">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                <Zap className="h-4 w-4 mr-2" />
                Configure Goals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
      {/* Background Gradient Based on Progress */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        goalProgress.ffmiProgressPercent >= 90 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
        goalProgress.ffmiProgressPercent >= 70 ? "bg-gradient-to-br from-amber-500 to-orange-500" :
        goalProgress.ffmiProgressPercent >= 40 ? "bg-gradient-to-br from-orange-500 to-red-500" :
        "bg-gradient-to-br from-cyan-500 to-blue-600"
      )} />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <DifficultyIcon className={cn("h-4 w-4 mr-2", difficultyBadge.color)} />
            <span className="text-sm font-semibold">FFMI Goal Progress</span>
          </div>
          <div className={cn("px-2 py-1 rounded text-xs font-medium", difficultyBadge.bg, difficultyBadge.color)}>
            {goalProgress.difficulty.toUpperCase()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4" data-testid="smart-goal-tracking-content">
        {/* FFMI Progress Display */}
        <div className="space-y-3">
          {/* Current vs Target FFMI */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {goalProgress.currentFFMI} → {goalProgress.targetFFMI}
              </div>
              <div className="text-xs text-slate-400">Current → Target FFMI</div>
            </div>
            <div className="text-right">
              <div className={cn("text-lg font-bold", statusColors.color)}>
                {goalProgress.ffmiProgressPercent.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">complete</div>
            </div>
          </div>
          
          {/* FFMI Progress Bar with Milestone Markers */}
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 relative",
                goalProgress.ffmiProgressPercent >= 90 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                goalProgress.ffmiProgressPercent >= 70 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                goalProgress.ffmiProgressPercent >= 40 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                "bg-gradient-to-r from-cyan-500 to-cyan-400"
              )}
              style={{ width: `${goalProgress.ffmiProgressPercent}%` }}
              data-testid="ffmi-progress-fill"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
            
            {/* Milestone Markers on Progress Bar */}
            {[25, 50, 75].map((percent) => (
              <div 
                key={percent}
                className="absolute top-0 h-full w-px bg-slate-400/50"
                style={{ left: `${percent}%` }}
                data-testid={`milestone-marker-${percent}`}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400/70" />
              </div>
            ))}
          </div>
        </div>

        {/* Weight Progress Metrics */}
        {/* Milestone Visualization */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-medium">FFMI Milestones</div>
          <div className="grid grid-cols-4 gap-1">
            {goalProgress.milestones.map((milestone, index) => (
              <div key={index} className={cn(
                "p-2 rounded text-center transition-all",
                milestone.achieved 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-slate-800/50 border border-slate-600/30"
              )}>
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className={cn(
                    "h-3 w-3",
                    milestone.achieved ? "text-emerald-400" : "text-slate-500"
                  )} />
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  milestone.achieved ? "text-emerald-400" : "text-slate-300"
                )}>
                  {milestone.ffmi}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {milestone.description}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Current Weight */}
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className="text-xl font-bold text-white">
              {goalProgress.currentWeight} kg
            </div>
            <div className="text-xs text-slate-400">Current Weight</div>
          </div>
          
          {/* Target Weight */}
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className={cn("text-xl font-bold", statusColors.accent)}>
              {goalProgress.targetWeight} kg
            </div>
            <div className="text-xs text-slate-400">Target Weight</div>
          </div>
        </div>
        
        {/* Progress Insights */}
        <div className="grid grid-cols-2 gap-2">
          {/* Weight Remaining */}
          <div className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="text-xs text-slate-400 font-medium">To Target</div>
            <div className="text-sm font-bold text-white">
              +{goalProgress.weightRemaining.toFixed(1)} kg
            </div>
          </div>
          
          {/* Timeline */}
          <div className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="text-xs text-slate-400 font-medium">Timeline</div>
            <div className="text-sm font-bold text-white flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {goalProgress.estimatedMonths === 0 ? 'N/A' : `${goalProgress.estimatedMonths}mo`}
            </div>
          </div>
        </div>
        
        {/* Goal Classification & Smart Insight */}
        <div className={cn("p-3 rounded-lg border text-xs", statusColors.bg, 
          goalProgress.ffmiProgressPercent >= 90 ? "border-emerald-400/20" :
          goalProgress.ffmiProgressPercent >= 70 ? "border-amber-400/20" :
          goalProgress.ffmiProgressPercent >= 40 ? "border-orange-400/20" :
          "border-cyan-400/20")}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={cn("h-3 w-3", statusColors.color)} />
            <div className={cn("font-medium", statusColors.color)}>
              {goalProgress.classification}
            </div>
          </div>
          <div className="text-slate-300">
            <strong>{goalProgress.goalDescription}</strong> • 
            {goalProgress.estimatedMonths === 0 ? ' Increase calorie surplus to achieve weight gain timeline.' :
             goalProgress.ffmiProgressPercent >= 90 ? ' Nearly achieved your target physique!' :
             goalProgress.ffmiProgressPercent >= 70 ? ` ${goalProgress.weightRemaining.toFixed(1)}kg to complete transformation.` :
             goalProgress.ffmiProgressPercent >= 40 ? ' Strong progress building towards your goal.' :
             ' Building the foundation for lasting transformation.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}