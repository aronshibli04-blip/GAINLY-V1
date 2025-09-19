import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import type { CalorieEntry, WeightEntry, User } from "@/types";
import { 
  Plus, 
  TrendingUp, 
  Brain,
  Clock,
  Coffee,
  Utensils,
  Moon,
  Target,
  Zap,
  ChevronRight,
  Activity,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useMemo } from "react";

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href?: string;
  action?: () => void;
  priority: 'high' | 'medium' | 'low';
  context: string;
  gradient: string;
  textColor: string;
  borderColor: string;
}

interface EnhancedQuickActionsCardProps {
  targetCalories: number;
}

export function EnhancedQuickActionsCard({ targetCalories }: EnhancedQuickActionsCardProps) {
  const { user, weightEntries, calorieEntries } = useUserStore();
  
  // Smart contextual suggestions based on user data and time
  const smartActions = useMemo((): QuickAction[] => {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Return early if no user data
    if (!user) return [];
    
    // Check recent activity
    const todayCalories = calorieEntries.filter((entry: CalorieEntry) => entry.date === today);
    const todayWeight = weightEntries.find((entry: WeightEntry) => entry.date === today);
    const recentCalories = calorieEntries.filter((entry: CalorieEntry) => {
      const entryDate = new Date(entry.date);
      const diffDays = (now.getTime() - entryDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    });
    
    const actions: QuickAction[] = [];
    
    // Time-based meal suggestions (simplified since we don't have mealType in CalorieEntry)
    if (hour >= 6 && hour < 10 && todayCalories.length === 0) {
      actions.push({
        id: 'log_breakfast',
        title: 'Log Breakfast',
        subtitle: 'Start your gain day right',
        icon: Coffee,
        href: '/meals',
        priority: 'high',
        context: 'morning_meal',
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30'
      });
    } else if (hour >= 11 && hour < 15 && todayCalories.length < 2) {
      actions.push({
        id: 'log_lunch',
        title: 'Log Second Meal',
        subtitle: 'Keep the momentum going',
        icon: Utensils,
        href: '/meals',
        priority: 'high',
        context: 'midday_meal',
        gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
      });
    } else if (hour >= 17 && hour < 21 && todayCalories.length < 3) {
      actions.push({
        id: 'log_dinner',
        title: 'Log Evening Meal',
        subtitle: 'Fuel your evening gains',
        icon: Utensils,
        href: '/meals',
        priority: 'high',
        context: 'evening_meal',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30'
      });
    } else if ((hour >= 21 || hour < 6) && todayCalories.length < 4) {
      actions.push({
        id: 'log_snack',
        title: 'Log Evening Snack',
        subtitle: 'Late night gains boost',
        icon: Moon,
        href: '/meals',
        priority: 'medium',
        context: 'night_snack',
        gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        textColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/30'
      });
    }
    
    // Weight logging suggestions
    if (!todayWeight && hour >= 6 && hour < 11) {
      actions.push({
        id: 'log_weight',
        title: 'Log Weight',
        subtitle: 'Track morning progress',
        icon: TrendingUp,
        href: '/dashboard', // TODO: Add weight logging modal
        priority: 'high',
        context: 'morning_weight',
        gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30'
      });
    }
    
    // AI Coach suggestions based on progress
    const weeklyCalories = recentCalories.reduce((sum: number, entry: CalorieEntry) => sum + entry.calories, 0);
    const avgDailyCalories = weeklyCalories / 7;
    
    if (avgDailyCalories < targetCalories * 0.9) {
      actions.push({
        id: 'ai_meal_plan',
        title: 'AI Meal Plan',
        subtitle: 'Boost calorie intake',
        icon: Brain,
        href: '/ai-coach',
        priority: 'medium',
        context: 'low_calorie_intake',
        gradient: 'bg-gradient-to-r from-violet-500 to-purple-500',
        textColor: 'text-violet-400',
        borderColor: 'border-violet-500/30'
      });
    }
    
    // Training suggestions
    if (hour >= 14 && hour < 19) {
      actions.push({
        id: 'training_plan',
        title: 'Training Plan',
        subtitle: 'Prime time for gains',
        icon: Activity,
        href: '/training',
        priority: 'medium',
        context: 'afternoon_training',
        gradient: 'bg-gradient-to-r from-red-500 to-pink-500',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30'
      });
    }
    
    // Goals review suggestion
    if (user?.targetFFMI && user?.calculatedTargetWeight) {
      actions.push({
        id: 'review_goals',
        title: 'Review Goals',
        subtitle: 'Check FFMI progress',
        icon: Target,
        href: '/goals',
        priority: 'low',
        context: 'goal_review',
        gradient: 'bg-gradient-to-r from-teal-500 to-cyan-500',
        textColor: 'text-teal-400',
        borderColor: 'border-teal-500/30'
      });
    }
    
    // Fallback general actions if no contextual ones
    if (actions.length === 0) {
      actions.push({
        id: 'log_meal',
        title: 'Log Meal',
        subtitle: 'Quick nutrition tracking',
        icon: Plus,
        href: '/meals',
        priority: 'high',
        context: 'general',
        gradient: 'bg-gradient-to-r from-emerald-500 to-green-500',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
      });
    }
    
    // Sort by priority and return top 3
    return actions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3);
      
  }, [user, calorieEntries, weightEntries, targetCalories]);
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white font-semibold">
                Smart Actions
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalized for your goals
              </p>
            </div>
          </div>
          
          {/* Context Badge */}
          <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800/50 rounded-full">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-400">
              {new Date().getHours() < 12 ? 'Morning' :
               new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {smartActions.map((action, index) => (
          <div key={action.id} className="group">
            {action.href ? (
              <Link href={action.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full h-auto p-4 justify-between hover:scale-[1.02] transition-all duration-200",
                    "bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30",
                    action.borderColor
                  )}
                  data-testid={`action-${action.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-transform group-hover:scale-110",
                      action.gradient
                    )}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className={cn("font-medium", action.textColor)}>
                        {action.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {action.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.priority === 'high' && (
                      <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                        Priority
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                onClick={action.action}
                className={cn(
                  "w-full h-auto p-4 justify-between hover:scale-[1.02] transition-all duration-200",
                  "bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30",
                  action.borderColor
                )}
                data-testid={`action-${action.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-transform group-hover:scale-110",
                    action.gradient
                  )}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className={cn("font-medium", action.textColor)}>
                      {action.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {action.subtitle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {action.priority === 'high' && (
                    <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                      Priority
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            )}
          </div>
        ))}
        
        {/* Smart Insights */}
        <div className="mt-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-slate-300 font-medium">
                Today's Focus
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {smartActions.length} suggestions
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {smartActions[0]?.context === 'morning_meal' ? 'Start strong with a protein-rich breakfast to fuel your day.' :
             smartActions[0]?.context === 'low_calorie_intake' ? 'Your weekly average is below target. Focus on calorie-dense meals.' :
             smartActions[0]?.context === 'morning_weight' ? 'Morning weigh-ins provide the most consistent tracking data.' :
             'Keep building momentum with consistent tracking and smart nutrition choices.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}