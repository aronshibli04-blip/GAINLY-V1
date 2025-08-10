import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { calculateTdee } from "@/utils/tdee";
import { Zap, TrendingUp, Target } from "lucide-react";

export function MotivationCard() {
  const { weightEntries, calorieEntries } = useUserStore();
  
  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );

  const getMotivationalMessage = () => {
    if (totalDays === 0) {
      return {
        icon: Target,
        title: "Start Your Journey! 💪",
        message: "Today is the perfect day to begin tracking your hardgainer transformation. Every rep, every meal, every gram counts!"
      };
    }
    
    if (totalDays < 7) {
      return {
        icon: TrendingUp,
        title: `Day ${totalDays} - Keep Going! 🔥`,
        message: `You're ${7 - totalDays} days away from unlocking AI meal plans. Consistency is the key to breaking through hardgainer plateaus!`
      };
    }

    if (weightEntries.length >= 3) {
      const calculation = calculateTdee(weightEntries, calorieEntries, "user1");
      const trend = calculation.weightTrend;
      
      if (trend > 0.5) {
        return {
          icon: Zap,
          title: "Crushing It! 🚀",
          message: `You're gaining ${trend.toFixed(1)}kg/week! Your dedication is paying off. Keep this momentum going!`
        };
      } else if (trend > 0.1) {
        return {
          icon: TrendingUp,
          title: "Steady Progress 📈",
          message: `Gaining ${trend.toFixed(1)}kg/week. Consider increasing calories by 200-300 to hit that 1kg/week target!`
        };
      } else if (trend < -0.1) {
        return {
          icon: Target,
          title: "Time to Fuel Up! 🍽️",
          message: "You're losing weight. Time to increase those calories! Remember: hardgainers need to eat big to get big!"
        };
      } else {
        return {
          icon: Zap,
          title: "Break the Plateau! ⚡",
          message: "Weight is stable. Add 300-500 calories to your daily intake. Your body is ready for the next growth phase!"
        };
      }
    }

    return {
      icon: Zap,
      title: "AI Analysis Ready! 🧠",
      message: "You've got enough data for AI analysis. Time to optimize your nutrition and accelerate your gains!"
    };
  };

  const motivation = getMotivationalMessage();
  const IconComponent = motivation.icon;

  return (
    <Card className="grok-glow-hover border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full grok-gradient flex items-center justify-center flex-shrink-0">
            <IconComponent className="h-5 w-5 text-black" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">
              {motivation.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {motivation.message}
            </p>
          </div>
        </div>
        
        {totalDays > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tracking streak</span>
              <span className="text-primary font-medium">{totalDays} days</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}