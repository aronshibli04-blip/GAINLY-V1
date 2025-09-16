import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { CircularProgress, AnimatedProgressRing } from "@/components/ui/circular-progress";
import { PageTransition } from "@/components/ui/page-transition";
import { EmptyMealsState, EmptyWorkoutsState } from "@/components/ui/empty-states";
import { CelebrationModal, MicroCelebration } from "@/components/ui/celebration-animations";
import { useUserStore } from "@/store/userStore";
import { useSideMenu } from "@/hooks/use-side-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Activity, 
  Plus, 
  Flame, 
  Trophy, 
  Star,
  Calendar,
  Scale,
  Utensils,
  Dumbbell
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function MobileHomeDemo() {
  const { openMenu } = useSideMenu();
  const { toast } = useToast();
  const { 
    user, 
    weightEntries, 
    calorieEntries,
    currentTdeeAnalysis 
  } = useUserStore();

  const [celebrationState, setCelebrationState] = useState<{
    show: boolean;
    type: "achievement" | "milestone" | "streak" | "goal";
    title: string;
    description: string;
    points: number;
  }>({
    show: false,
    type: "achievement",
    title: "",
    description: "",
    points: 0,
  });

  // Sample data for demo
  const todayCalories = 2400;
  const targetCalories = 2800;
  const currentWeight = user?.weight || 70;
  const goalWeight = user?.calculatedTargetWeight || user?.goalWeight || 80;
  const weightProgress = ((currentWeight - 70) / (goalWeight - 70)) * 100;

  const handleCelebration = (type: "achievement" | "milestone" | "streak" | "goal") => {
    setCelebrationState({
      show: true,
      type,
      title: type === "achievement" ? "First Week Complete!" : 
             type === "milestone" ? "2kg Gained!" :
             type === "streak" ? "7 Day Streak!" : "Daily Goal Achieved!",
      description: "You're making incredible progress on your fitness journey!",
      points: 250,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="skeleton w-20 h-20 rounded-full mx-auto"></div>
          <div className="skeleton w-32 h-4"></div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-background">
      <div className="mobile-container">
        <MobileHeader 
          title="GAINLY" 
          onOpenMenu={openMenu}
        />

        <div className="content-with-bottom-nav px-grid-2 py-grid-3 space-y-grid-3">
          
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-center space-y-2"
          >
            <h1 className="heading-1">Welcome back, {user.firstName}!</h1>
            <p className="body-text-secondary">Ready to crush your goals today?</p>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            <Card variant="premium" className="text-center p-grid-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/20">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="heading-3">{currentWeight}kg</div>
                  <div className="caption-text">Current Weight</div>
                </div>
              </div>
            </Card>

            <Card variant="premium" className="text-center p-grid-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-secondary/20">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="heading-3">{goalWeight}kg</div>
                  <div className="caption-text">Goal Weight</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Progress Rings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card variant="premium" className="p-grid-4">
              <CardHeader className="text-center pb-grid-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-grid-4">
                <div className="grid grid-cols-2 gap-6">
                  <AnimatedProgressRing
                    progress={todayCalories}
                    total={targetCalories}
                    label="Calories"
                    color="primary"
                    size={100}
                  />
                  <AnimatedProgressRing
                    progress={Math.round(weightProgress)}
                    total={100}
                    label="Weight Goal"
                    unit="%"
                    color="secondary"
                    size={100}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            <MicroCelebration trigger={false} type="bounce">
              <Link href="/meals">
                <Card variant="premium" className="touch-target cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-grid-3 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-orange-400/20 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="heading-3">Log Meal</div>
                    <div className="caption-text">Track nutrition</div>
                  </CardContent>
                </Card>
              </Link>
            </MicroCelebration>

            <MicroCelebration trigger={false} type="bounce">
              <Link href="/training">
                <Card variant="premium" className="touch-target cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-grid-3 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-400/20 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="heading-3">Workout</div>
                    <div className="caption-text">Start training</div>
                  </CardContent>
                </Card>
              </Link>
            </MicroCelebration>
          </motion.div>

          {/* Achievement Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card variant="premium" className="p-grid-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Achievements
                  </span>
                  <Badge className="bg-yellow-400/20 text-yellow-400">
                    Level {getLevelFromXP(1250)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-grid-3">
                <div className="flex justify-between items-center">
                  <span className="body-text">Progress to next level</span>
                  <span className="body-text-secondary">1,250 / 1,500 XP</span>
                </div>
                <Progress value={83} className="h-2" />
                
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {["achievement", "milestone", "streak", "goal"].map((type, index) => (
                    <motion.button
                      key={type}
                      onClick={() => handleCelebration(type as any)}
                      className="flex flex-col items-center space-y-1 p-2 rounded-lg touch-target touch-feedback hover:bg-card/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {type === "achievement" && <Trophy className="w-6 h-6 text-yellow-400" />}
                      {type === "milestone" && <Target className="w-6 h-6 text-primary" />}
                      {type === "streak" && <Flame className="w-6 h-6 text-orange-400" />}
                      {type === "goal" && <Star className="w-6 h-6 text-emerald-400" />}
                      <span className="caption-text">Test</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Demo Empty States */}
          {weightEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <Card variant="premium">
                <EmptyMealsState onAddMeal={() => toast({ title: "Navigate to Meals", description: "Tap the Meals tab to start logging!" })} />
              </Card>
            </motion.div>
          )}

        </div>

        <BottomNav />
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        show={celebrationState.show}
        onComplete={() => setCelebrationState(prev => ({ ...prev, show: false }))}
        type={celebrationState.type}
        title={celebrationState.title}
        description={celebrationState.description}
        points={celebrationState.points}
      />
    </PageTransition>
  );
}

// Helper function for demo
function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 250) + 1;
}