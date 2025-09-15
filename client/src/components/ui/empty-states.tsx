import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Utensils, 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Plus,
  Sparkles,
  ChefHat,
  Timer,
  Trophy
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "meals" | "workouts" | "progress" | "achievements" | "default";
}

const variantConfig = {
  meals: {
    icon: ChefHat,
    gradient: "from-orange-400/20 to-yellow-400/20",
    iconColor: "text-orange-400",
    animation: "bounce",
  },
  workouts: {
    icon: Dumbbell,
    gradient: "from-red-400/20 to-pink-400/20",
    iconColor: "text-red-400",
    animation: "pulse",
  },
  progress: {
    icon: TrendingUp,
    gradient: "from-green-400/20 to-emerald-400/20",
    iconColor: "text-emerald-400",
    animation: "bounce",
  },
  achievements: {
    icon: Trophy,
    gradient: "from-yellow-400/20 to-amber-400/20",
    iconColor: "text-yellow-400",
    animation: "pulse",
  },
  default: {
    icon: Sparkles,
    gradient: "from-primary-cyan/20 to-accent-mint/20",
    iconColor: "text-primary-cyan",
    animation: "bounce",
  },
};

export function EmptyState({
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center space-y-6",
        "p-grid-4 min-h-[300px]",
        className
      )}
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          className={cn("absolute inset-0 bg-gradient-to-br", config.gradient)}
          animate={{ 
            background: [
              `linear-gradient(to bottom right, ${config.gradient.split(' ')[1]}, ${config.gradient.split(' ')[3]})`,
              `linear-gradient(to top left, ${config.gradient.split(' ')[3]}, ${config.gradient.split(' ')[1]})`,
              `linear-gradient(to bottom right, ${config.gradient.split(' ')[1]}, ${config.gradient.split(' ')[3]})`,
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ filter: "blur(40px)" }}
        />
      </div>

      {/* Icon */}
      <motion.div
        className={cn(
          "relative z-10 w-20 h-20 rounded-full glass-card",
          "flex items-center justify-center",
          config.iconColor
        )}
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          ...(config.animation === "bounce" ? {
            y: [0, -10, 0],
          } : {
            scale: [1, 1.1, 1],
          })
        }}
        transition={{ 
          scale: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          rotate: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          ...(config.animation === "bounce" ? {
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          } : {
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          })
        }}
      >
        <IconComponent className="w-10 h-10" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 space-y-3 max-w-sm">
        <motion.h3
          className="heading-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h3>
        
        <motion.p
          className="body-text-secondary text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {description}
        </motion.p>
      </div>

      {/* Action Button */}
      {action && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button onClick={action.onClick} className="gap-2">
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Specific empty state components for common use cases
export function EmptyMealsState({ onAddMeal }: { onAddMeal: () => void }) {
  return (
    <EmptyState
      variant="meals"
      title="No meals logged today"
      description="Start tracking your nutrition journey by logging your first meal. Every bite counts towards your goals!"
      action={{
        label: "Log First Meal",
        onClick: onAddMeal,
      }}
    />
  );
}

export function EmptyWorkoutsState({ onAddWorkout }: { onAddWorkout: () => void }) {
  return (
    <EmptyState
      variant="workouts"
      title="No workouts tracked"
      description="Begin your fitness journey by logging your first workout. Consistency is the key to transformation!"
      action={{
        label: "Start Workout",
        onClick: onAddWorkout,
      }}
    />
  );
}

export function EmptyProgressState({ onViewProgress }: { onViewProgress: () => void }) {
  return (
    <EmptyState
      variant="progress"
      title="Track for insights"
      description="Log your meals and workouts for at least a week to see meaningful progress insights and trends."
      action={{
        label: "View Dashboard",
        onClick: onViewProgress,
      }}
    />
  );
}

export function EmptyAchievementsState() {
  return (
    <EmptyState
      variant="achievements"
      title="Your achievements await"
      description="Complete daily goals and milestones to unlock badges and celebrate your fitness journey!"
    />
  );
}