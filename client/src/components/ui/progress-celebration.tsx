import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { Sparkles, TrendingUp, Target, Zap, PartyPopper } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: any;
  achieved: boolean;
  value: number;
  threshold: number;
  unit: string;
  celebration: string;
}

export function ProgressCelebration() {
  const { weightEntries, calorieEntries, user } = useUserStore();
  const [showCelebration, setShowCelebration] = useState<Milestone | null>(null);

  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user?.weight || 0;
  const startWeight = user?.weight || 0;
  const totalGain = currentWeight - startWeight;
  
  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );

  const milestones: Milestone[] = [
    {
      id: 'first_week',
      title: 'First Week Champion!',
      description: 'You\'ve successfully tracked for a full week',
      icon: Target,
      achieved: totalDays >= 7,
      value: totalDays,
      threshold: 7,
      unit: 'days',
      celebration: '🎯 Consistency is the foundation of all great transformations!'
    },
    {
      id: 'half_kg',
      title: 'First Gains Unlocked!',
      description: 'You\'ve gained your first 0.5kg',
      icon: TrendingUp,
      achieved: totalGain >= 0.5,
      value: totalGain,
      threshold: 0.5,
      unit: 'kg',
      celebration: '💪 Your hard work is literally showing on the scale!'
    },
    {
      id: 'one_kg',
      title: 'Kilogram Crusher!',
      description: 'You\'ve gained a full kilogram',
      icon: Zap,
      achieved: totalGain >= 1,
      value: totalGain,
      threshold: 1,
      unit: 'kg',
      celebration: '🚀 1kg down, many more to go! You\'re officially bulking!'
    },
    {
      id: 'two_weeks',
      title: 'Streak Warrior!',
      description: 'Two weeks of consistent tracking',
      icon: Sparkles,
      achieved: totalDays >= 14,
      value: totalDays,
      threshold: 14,
      unit: 'days',
      celebration: '🔥 Habits are forming! This is where magic happens!'
    },
    {
      id: 'three_kg',
      title: 'Transformation Mode!',
      description: 'You\'ve gained 3kg total',
      icon: PartyPopper,
      achieved: totalGain >= 3,
      value: totalGain,
      threshold: 3,
      unit: 'kg',
      celebration: '🎉 People are starting to notice your gains!'
    }
  ];

  // Check for newly achieved milestones
  useEffect(() => {
    const newlyAchieved = milestones.find(m => 
      m.achieved && 
      localStorage.getItem(`milestone_${m.id}`) !== 'shown'
    );

    if (newlyAchieved) {
      setShowCelebration(newlyAchieved);
      localStorage.setItem(`milestone_${newlyAchieved.id}`, 'shown');
    }
  }, [totalGain, totalDays]);

  const nextMilestone = milestones.find(m => !m.achieved);

  if (showCelebration) {
    const IconComponent = showCelebration.icon;
    
    return (
      <Card className="grok-glow border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full grok-gradient mx-auto flex items-center justify-center">
            <IconComponent className="h-8 w-8 text-black" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              {showCelebration.title}
            </h3>
            <p className="text-muted-foreground">
              {showCelebration.description}
            </p>
            <p className="text-sm text-primary font-medium">
              {showCelebration.celebration}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {showCelebration.value.toFixed(1)}
              </p>
              <p className="text-muted-foreground">{showCelebration.unit}</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowCelebration(null)}
            className="grok-gradient h-10"
          >
            <Sparkles className="h-4 w-4 mr-2 text-black" />
            Keep Going!
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show progress to next milestone
  if (nextMilestone) {
    const IconComponent = nextMilestone.icon;
    const progress = (nextMilestone.value / nextMilestone.threshold) * 100;
    
    return (
      <Card className="grok-glow-hover border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Next Milestone</p>
              <p className="text-xs text-muted-foreground">{nextMilestone.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">
                {nextMilestone.value.toFixed(1)}/{nextMilestone.threshold}
              </p>
              <p className="text-xs text-muted-foreground">{nextMilestone.unit}</p>
            </div>
          </div>
          
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}