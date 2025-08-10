import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Dumbbell, Coffee, Target, TrendingUp } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  completed: boolean;
  category: 'nutrition' | 'tracking' | 'mindset' | 'consistency';
}

export function DailyChallenges() {
  const { weightEntries, calorieEntries, user } = useUserStore();
  const { toast } = useToast();
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split('T')[0];
  const todayWeight = weightEntries.find(w => w.date === today);
  const todayCalories = calorieEntries.filter(c => c.date === today);
  const totalTodayCalories = todayCalories.reduce((sum, c) => sum + c.calories, 0);

  const challenges: Challenge[] = [
    {
      id: 'log_weight',
      title: 'Morning Weigh-In',
      description: 'Log your weight for today',
      icon: Target,
      points: 10,
      completed: !!todayWeight || completedChallenges.has('log_weight'),
      category: 'tracking'
    },
    {
      id: 'hit_calories',
      title: 'Fuel Up',
      description: 'Log at least 2000 calories today',
      icon: Coffee,
      points: 15,
      completed: totalTodayCalories >= 2000 || completedChallenges.has('hit_calories'),
      category: 'nutrition'
    },
    {
      id: 'consistency_streak',
      title: 'Stay Consistent',
      description: 'Track for 3 days in a row',
      icon: TrendingUp,
      points: 20,
      completed: weightEntries.length >= 3 || completedChallenges.has('consistency_streak'),
      category: 'consistency'
    },
    {
      id: 'mindset_check',
      title: 'Growth Mindset',
      description: 'Acknowledge one thing you\'re proud of today',
      icon: Dumbbell,
      points: 10,
      completed: completedChallenges.has('mindset_check'),
      category: 'mindset'
    }
  ];

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);

  const handleCompleteChallenge = (challengeId: string) => {
    const newCompleted = new Set(completedChallenges);
    newCompleted.add(challengeId);
    setCompletedChallenges(newCompleted);
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      toast({
        title: "Challenge Complete! 🎉",
        description: `+${challenge.points} points for ${challenge.title}`,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'bg-green-500/20 text-green-400';
      case 'tracking': return 'bg-blue-500/20 text-blue-400';
      case 'mindset': return 'bg-purple-500/20 text-purple-400';
      case 'consistency': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="grok-glow-hover border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center justify-between">
          <span>Daily Challenges</span>
          <Badge className="grok-gradient text-black">
            {totalPoints} pts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => {
          const IconComponent = challenge.icon;
          const isCompleted = challenge.completed;
          
          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-lg border transition-all ${
                isCompleted 
                  ? 'border-primary/30 bg-primary/5' 
                  : 'border-muted/30 bg-muted/5 hover:border-primary/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <p className={`text-sm font-medium ${
                      isCompleted ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {challenge.title}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(challenge.category)}`}
                    >
                      {challenge.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-xs text-primary font-medium">
                  +{challenge.points}
                </div>
                {!isCompleted && challenge.id === 'mindset_check' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    className="h-7 text-xs"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {completedCount === challenges.length && (
          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">🔥 All challenges complete!</p>
            <p className="text-xs text-muted-foreground">You're on fire today, keep it up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}