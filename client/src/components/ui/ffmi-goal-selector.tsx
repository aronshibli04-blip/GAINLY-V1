import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Target, Crown, Lock } from 'lucide-react';

// Define FFMI Goals
const STANDARD_GOALS = [
  { ffmi: 19, category: 'Beginner', description: 'A healthy, lean physique with visible muscle definition' },
  { ffmi: 20, category: 'Beginner', description: 'Noticeably fit and athletic appearance' },
  { ffmi: 21, category: 'Intermediate', description: 'Impressive natural physique with good muscle mass' },
];

const ACCELERATED_GOALS = [
  { ffmi: 22, category: 'Intermediate', description: 'The recommended long-term goal for most dedicated trainees' },
  { ffmi: 23, category: 'Muscular', description: 'Exceptional muscle development requiring years of dedication' },
  { ffmi: 24, category: 'Muscular', description: 'Elite physique representing genetic potential for most' },
];

const ALL_GOALS = [...STANDARD_GOALS, ...ACCELERATED_GOALS];

interface FFMIGoal {
  ffmi: number;
  category: string;
  description: string;
}

interface DisplayFFMIGoal extends FFMIGoal {
  targetWeight: number;
  timelineMonths: number;
  isUnlocked: boolean;
  tier: 'standard' | 'accelerated';
  difficulty: string;
}

interface FFMIGoalSelectorProps {
  currentWeight: number;
  height: number;
  bodyFatPercentage: number;
  age: number;
  gender: 'male' | 'female';
  selectedFFMI?: number;
  selectedTargetWeight?: number;
  onGoalSelect: (ffmi: number, targetWeight: number, timelineMonths: number) => void;
  expertMode?: boolean;
  onExpertModeChange?: (enabled: boolean) => void;
  className?: string;
}

// Helper functions
const calculateTargetWeight = (targetFFMI: number, heightCm: number, bodyFatPercentage: number): number => {
  const heightM = heightCm / 100;
  const fatFreeMass = targetFFMI * (heightM * heightM);
  const targetWeight = fatFreeMass / (1 - bodyFatPercentage / 100);
  return Math.round(targetWeight * 10) / 10;
};

const estimateTimeline = (currentFFMI: number, targetFFMI: number, age: number, gender: 'male' | 'female'): number => {
  const ffmiGain = targetFFMI - currentFFMI;
  const baseRate = gender === 'male' ? 1.2 : 0.8; // FFMI points per year
  const ageMultiplier = age > 30 ? 0.8 : 1.0;
  const adjustedRate = baseRate * ageMultiplier;
  return Math.round((ffmiGain / adjustedRate) * 12);
};

const getFFMIClassification = (ffmi: number, gender: 'male' | 'female'): string => {
  if (gender === 'male') {
    if (ffmi < 17) return 'Below Average';
    if (ffmi < 19) return 'Average';
    if (ffmi < 21) return 'Above Average';
    if (ffmi < 23) return 'Excellent';
    return 'Superior';
  } else {
    if (ffmi < 14) return 'Below Average';
    if (ffmi < 16) return 'Average';
    if (ffmi < 18) return 'Above Average';
    if (ffmi < 20) return 'Excellent';
    return 'Superior';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'text-emerald-400 border-emerald-400/50';
    case 'intermediate':
      return 'text-amber-400 border-amber-400/50';
    case 'muscular':
      return 'text-red-400 border-red-400/50';
    default:
      return 'text-white/60 border-white/30';
  }
};

export function FFMIGoalSelector({
  currentWeight,
  height,
  bodyFatPercentage,
  age,
  gender,
  selectedFFMI,
  selectedTargetWeight,
  onGoalSelect,
  expertMode = false,
  onExpertModeChange,
  className
}: FFMIGoalSelectorProps) {
  const [goals, setGoals] = useState<DisplayFFMIGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate current FFMI
  const heightM = height / 100;
  const fatFreeMass = currentWeight * (1 - bodyFatPercentage / 100);
  const calculatedCurrentFFMI = Math.round((fatFreeMass / (heightM * heightM)) * 10) / 10;

  useEffect(() => {
    setIsLoading(true);
    
    // Generate goals based on mode
    let availableGoals: FFMIGoal[] = [];
    
    if (expertMode) {
      availableGoals = ALL_GOALS;
    } else {
      availableGoals = [...STANDARD_GOALS, ...ACCELERATED_GOALS];
    }

    // Convert to DisplayFFMIGoal with calculated weights and timelines
    const generatedGoals: DisplayFFMIGoal[] = availableGoals
      .filter(goal => goal.ffmi > calculatedCurrentFFMI)
      .map(goal => {
        const targetWeight = calculateTargetWeight(goal.ffmi, height, bodyFatPercentage);
        const timelineMonths = estimateTimeline(calculatedCurrentFFMI, goal.ffmi, age, gender);
        
        const isStandardGoal = STANDARD_GOALS.some(sg => sg.ffmi === goal.ffmi);
        const tier = isStandardGoal ? 'standard' : 'accelerated';
        const isUnlocked = expertMode || isStandardGoal;

        return {
          ...goal,
          targetWeight,
          timelineMonths,
          isUnlocked,
          tier,
          difficulty: goal.category
        } as DisplayFFMIGoal;
      });

    setGoals(generatedGoals);
    setIsLoading(false);
  }, [calculatedCurrentFFMI, height, bodyFatPercentage, age, gender, expertMode]);

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
    <div className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-[#00F5FF]" />
          Set Your Body Goal
        </h3>
      </div>

      {/* Standard Path Goals */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white/90">Standard Path (Recommended)</h4>
        <div className="grid grid-cols-3 gap-2">
          {goals.filter(goal => goal.tier === 'standard').map((goal) => {
            const isSelected = selectedFFMI === goal.ffmi;
            const weightGain = goal.targetWeight - currentWeight;
            const isLocked = !goal.isUnlocked;
            
            return (
              <div
                key={goal.ffmi}
                className={cn(
                  "relative rounded-lg p-3 text-center cursor-pointer transition-all duration-200 border",
                  isLocked ? "opacity-60 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                  isSelected 
                    ? "bg-[#00F5FF]/20 border-[#00F5FF]/50 ring-2 ring-[#00F5FF]/50" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
                onClick={() => {
                  if (!isLocked) {
                    onGoalSelect(goal.ffmi, goal.targetWeight, goal.timelineMonths);
                  }
                }}
                data-testid={`goal-card-ffmi-${goal.ffmi}`}
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">FFMI {goal.ffmi}</div>
                  <div className="text-xs text-white/80">{goal.targetWeight}kg</div>
                  <div className="text-xs text-[#00F5FF]">(+{weightGain.toFixed(1)})</div>
                  <div className="text-xs text-white/60">
                    ~{Math.floor(goal.timelineMonths / 12)}.{Math.round((goal.timelineMonths % 12) / 12 * 10)}y
                  </div>
                </div>
                {isLocked && <Lock className="absolute top-1 right-1 h-3 w-3 text-yellow-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accelerated Path Goals */}
      {goals.some(goal => goal.tier === 'accelerated') && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/90">Accelerated Path</h4>
          <div className="grid grid-cols-3 gap-2">
            {goals.filter(goal => goal.tier === 'accelerated').map((goal) => {
              const isSelected = selectedFFMI === goal.ffmi;
              const weightGain = goal.targetWeight - currentWeight;
              const isLocked = !goal.isUnlocked;
              
              return (
                <div
                  key={goal.ffmi}
                  className={cn(
                    "relative rounded-lg p-3 text-center cursor-pointer transition-all duration-200 border",
                    isLocked ? "opacity-60 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                    isSelected 
                      ? "bg-[#00F5FF]/20 border-[#00F5FF]/50 ring-2 ring-[#00F5FF]/50" 
                      : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                  )}
                  onClick={() => {
                    if (!isLocked) {
                      onGoalSelect(goal.ffmi, goal.targetWeight, goal.timelineMonths);
                    }
                  }}
                  data-testid={`goal-card-ffmi-${goal.ffmi}`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">FFMI {goal.ffmi}</div>
                    <div className="text-xs text-white/80">{goal.targetWeight}kg</div>
                    <div className="text-xs text-purple-400">(+{weightGain.toFixed(1)})</div>
                    <div className="text-xs text-white/60">
                      ~{Math.floor(goal.timelineMonths / 12)}.{Math.round((goal.timelineMonths % 12) / 12 * 10)}y
                    </div>
                  </div>
                  {isLocked && <Lock className="absolute top-1 right-1 h-3 w-3 text-yellow-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description Area */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 min-h-[80px]">
        {selectedGoal ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-[#00F5FF]/30 text-[#00F5FF]">
                {selectedGoal.difficulty}
              </Badge>
              {selectedGoal.tier === 'accelerated' && (
                <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Elite
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              {selectedGoal.description}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-white/60 italic">
              Select a goal to see its description here.
            </p>
          </div>
        )}
      </div>

      {/* Expert Mode Toggle (Compact) */}
      {onExpertModeChange && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
            <span className="text-xs text-white/70">Expert Mode</span>
            <Switch
              checked={expertMode}
              onCheckedChange={onExpertModeChange}
              data-testid="expert-mode-toggle"
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}