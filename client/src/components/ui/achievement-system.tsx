import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { Trophy, Flame, Target, Calendar, TrendingUp, Zap, Award, Star } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AchievementSystem() {
  const { weightEntries, calorieEntries, user } = useUserStore();

  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );

  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user?.weight || 0;
  const startWeight = user?.weight || 0;
  const totalGain = currentWeight - startWeight;

  const achievements: Achievement[] = [
    {
      id: 'first_log',
      title: 'First Steps',
      description: 'Log your first weight entry',
      icon: Target,
      unlocked: weightEntries.length > 0,
      rarity: 'common'
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Track for 7 consecutive days',
      icon: Calendar,
      unlocked: totalDays >= 7,
      progress: Math.min(totalDays, 7),
      maxProgress: 7,
      rarity: 'common'
    },
    {
      id: 'first_kg',
      title: 'First Kilogram',
      description: 'Gain your first kg',
      icon: TrendingUp,
      unlocked: totalGain >= 1,
      progress: Math.min(totalGain, 1),
      maxProgress: 1,
      rarity: 'rare'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Track for 30 days',
      icon: Flame,
      unlocked: totalDays >= 30,
      progress: Math.min(totalDays, 30),
      maxProgress: 30,
      rarity: 'epic'
    },
    {
      id: 'bulk_beast',
      title: 'Bulk Beast',
      description: 'Gain 5kg total',
      icon: Zap,
      unlocked: totalGain >= 5,
      progress: Math.min(totalGain, 5),
      maxProgress: 5,
      rarity: 'epic'
    },
    {
      id: 'hardgainer_hero',
      title: 'Hardgainer Hero',
      description: 'Gain 10kg total',
      icon: Award,
      unlocked: totalGain >= 10,
      progress: Math.min(totalGain, 10),
      maxProgress: 10,
      rarity: 'legendary'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nextAchievement = achievements.find(a => !a.unlocked);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'legendary': return 'text-yellow-400 border-yellow-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  if (achievements.length === 0) return null;

  return (
    <Card className="grok-glow-hover border-primary/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-semibold text-white">Achievements</span>
          </div>
          <Badge className="grok-gradient text-black">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        {/* Next Achievement Progress */}
        {nextAchievement && nextAchievement.maxProgress && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <nextAchievement.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{nextAchievement.title}</p>
                <p className="text-xs text-muted-foreground">{nextAchievement.description}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <div className="flex-1 bg-muted/20 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(nextAchievement.progress! / nextAchievement.maxProgress!) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {nextAchievement.progress?.toFixed(1)}/{nextAchievement.maxProgress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Grid */}
        <div className="grid grid-cols-3 gap-2">
          {achievements.slice(0, 6).map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`p-2 rounded-lg border text-center transition-all ${
                  achievement.unlocked 
                    ? `${getRarityColor(achievement.rarity)} bg-primary/5` 
                    : 'border-muted/30 bg-muted/5 opacity-50'
                }`}
              >
                <IconComponent className={`h-5 w-5 mx-auto mb-1 ${
                  achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="text-xs font-medium text-white truncate">
                  {achievement.title}
                </p>
                {achievement.unlocked && (
                  <Star className="h-3 w-3 mx-auto mt-1 text-yellow-400" />
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            Keep going! You're building an incredible transformation story.
          </div>
        )}
      </CardContent>
    </Card>
  );
}