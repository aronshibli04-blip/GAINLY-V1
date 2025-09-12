import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { 
  Bell, 
  X, 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  Dumbbell,
  AlertTriangle
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: 'reminder' | 'achievement' | 'insight' | 'warning' | 'celebration' | 'urgent';
  title: string;
  message: string;
  icon: any;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  dismissed?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

export function SmartNotifications() {
  const { toast } = useToast();
  const { user, weightEntries, calorieEntries, activityEntries, currentTdeeAnalysis } = useUserStore();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate smart notifications based on user data
  useEffect(() => {
    if (!user) return;

    const newNotifications: SmartNotification[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if user hasn't logged today
    const hasLoggedToday = weightEntries.some(entry => entry.date === today) || 
                          calorieEntries.some(entry => entry.date === today);

    if (!hasLoggedToday && now.getHours() >= 18) {
      newNotifications.push({
        id: `daily-reminder-${today}`,
        type: 'reminder',
        title: 'Daily Check-in',
        message: "Don't forget to log your weight and calories today!",
        icon: Calendar,
        color: 'text-primary',
        priority: 'medium',
        createdAt: now,
        actionLabel: 'Log Now',
        actionCallback: () => {
          // Navigate to home page for logging
          window.location.href = '/';
        }
      });
    }

    // Check for weight gain milestones
    if (weightEntries.length >= 2) {
      const currentWeight = weightEntries[0].weight;
      const startWeight = weightEntries[weightEntries.length - 1].weight;
      const weightGained = currentWeight - startWeight;

      if (weightGained >= 1 && weightGained < 1.1) {
        newNotifications.push({
          id: `milestone-1kg-${Date.now()}`,
          type: 'achievement',
          title: 'First Kilogram!',
          message: `Congratulations! You have gained ${weightGained.toFixed(1)}kg. Keep up the great work!`,
          icon: Award,
          color: 'text-yellow-400',
          priority: 'high',
          createdAt: now
        });
      }

      if (weightGained >= 5 && weightGained < 5.1) {
        newNotifications.push({
          id: `milestone-5kg-${Date.now()}`,
          type: 'celebration',
          title: 'Amazing Progress!',
          message: `You have gained ${weightGained.toFixed(1)}kg! This is fantastic progress on your journey.`,
          icon: TrendingUp,
          color: 'text-green-400',
          priority: 'high',
          createdAt: now
        });
      }
    }

    // Check for long streaks
    const uniqueDays = new Set([
      ...weightEntries.map(w => w.date),
      ...calorieEntries.map(c => c.date)
    ]).size;

    if (uniqueDays === 7) {
      newNotifications.push({
        id: `streak-7-${Date.now()}`,
        type: 'achievement',
        title: '7-Day Streak!',
        message: 'You have logged data for 7 days straight. Your consistency is paying off!',
        icon: CheckCircle,
        color: 'text-primary',
        priority: 'high',
        createdAt: now
      });
    }

    // AGGRESSIVE SURPLUS TRACKING - 1100kcal surplus for 1kg/week
    const todayCalories = calorieEntries
      .filter(c => c.date === today)
      .reduce((sum, c) => sum + c.calories, 0);
    
    const targetTdee = currentTdeeAnalysis?.tdee || 2500;
    const requiredCalories = targetTdee + 1100;
    const caloriesRemaining = Math.max(0, requiredCalories - todayCalories);
    const currentHour = new Date().getHours();
    
    // Critical evening deficit alert
    if (currentHour >= 20 && caloriesRemaining > 500) {
      newNotifications.push({
        id: `critical-deficit-${today}`,
        type: 'urgent',
        title: '🚨 CRITICAL DEFICIT ALERT',
        message: `You need ${caloriesRemaining} calories to hit your 1kg/week target! Emergency protocol needed.`,
        icon: AlertTriangle,
        color: 'text-red-400',
        priority: 'critical',
        createdAt: now,
        actionLabel: 'Emergency Foods',
        actionCallback: () => {
          window.location.href = '/meals';
        }
      });
    }
    
    // Afternoon warning for insufficient calories
    if (currentHour >= 15 && currentHour < 20 && caloriesRemaining > 800) {
      newNotifications.push({
        id: `afternoon-warning-${today}`,
        type: 'warning',
        title: 'Falling Behind Calorie Target',
        message: `You need ${caloriesRemaining} more calories today. Start eating bigger portions now!`,
        icon: Clock,
        color: 'text-orange-400',
        priority: 'high',
        createdAt: now,
        actionLabel: 'Log Food',
        actionCallback: () => {
          window.location.href = '/meals';
        }
      });
    }
    
    // Training reminder for weight gain
    const lastTrainingEntry = activityEntries.find(a => 
      a && (a.type === 'heavy' || a.type === 'moderate')
    );
    const daysSinceTraining = lastTrainingEntry 
      ? Math.floor((now.getTime() - new Date(lastTrainingEntry.date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceTraining >= 2) {
      newNotifications.push({
        id: `training-reminder-${Date.now()}`,
        type: 'reminder',
        title: 'Training Required for Muscle Gain',
        message: `No training logged for ${daysSinceTraining} days. Training is essential for quality weight gain!`,
        icon: Dumbbell,
        color: 'text-blue-400',
        priority: 'high',
        createdAt: now,
        actionLabel: 'Log Training',
        actionCallback: () => {
          window.location.href = '/training';
        }
      });
    }

    // Check for inconsistent logging
    const daysSinceLastLog = weightEntries.length > 0 
      ? Math.floor((now.getTime() - new Date(weightEntries[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceLastLog >= 3) {
      newNotifications.push({
        id: `missing-logs-${Date.now()}`,
        type: 'reminder',
        title: 'We Miss You!',
        message: `It's been ${daysSinceLastLog} days since your last log. Consistent tracking helps our AI give better recommendations.`,
        icon: Clock,
        color: 'text-blue-400',
        priority: 'medium',
        createdAt: now,
        actionLabel: 'Log Data',
        actionCallback: () => {
          window.location.href = '/';
        }
      });
    }

    // Weekly motivation boost
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1 && now.getHours() >= 9 && now.getHours() <= 12) { // Monday morning
      newNotifications.push({
        id: `monday-motivation-${today}`,
        type: 'insight',
        title: 'New Week, New Gains',
        message: 'Start this week strong! Consistent effort leads to amazing transformations.',
        icon: Zap,
        color: 'text-purple-400',
        priority: 'low',
        createdAt: now
      });
    }

    // Filter out dismissed notifications and duplicates
    const existingIds = new Set(notifications.map(n => n.id));
    const filteredNew = newNotifications.filter(n => 
      !existingIds.has(n.id) && 
      !notifications.find(existing => existing.id === n.id && existing.dismissed)
    );

    if (filteredNew.length > 0) {
      setNotifications(prev => [...filteredNew, ...prev].slice(0, 10)); // Keep max 10 notifications
    }
  }, [user, weightEntries, calorieEntries]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);
  const hasHighPriority = activeNotifications.some(n => n.priority === 'high');

  if (activeNotifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell - Inline in status bar */}
      <Button
        onClick={() => setShowNotifications(!showNotifications)}
        variant="ghost"
        size="sm"
        className="relative text-primary hover:bg-primary/20 h-8 px-2"
        data-testid="button-notifications"
      >
        <Bell className="h-4 w-4" />
        {activeNotifications.length > 0 && (
          <Badge className={`absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center p-0 ${
            hasHighPriority ? 'bg-red-500 text-white' : 'bg-primary text-black'
          }`}>
            {activeNotifications.length}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed top-16 left-4 z-40 w-80 max-h-96 overflow-y-auto">
          <Card className="bg-slate-900/95 border-primary/30 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-0">
              <div className="sticky top-0 bg-slate-800/90 p-3 border-b border-primary/20 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-primary">Notifications</h3>
                  <Button
                    onClick={() => setShowNotifications(false)}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    data-testid="button-close-notifications"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1 p-2">
                {activeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      notification.priority === 'high' 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${notification.color}`}>
                        <notification.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold text-sm ${notification.color}`}>
                            {notification.title}
                          </h4>
                          <Button
                            onClick={() => dismissNotification(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="w-4 h-4 p-0 opacity-50 hover:opacity-100"
                            data-testid={`button-dismiss-${notification.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {notification.createdAt.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {notification.actionLabel && notification.actionCallback && (
                            <Button
                              onClick={() => {
                                notification.actionCallback?.();
                                dismissNotification(notification.id);
                                setShowNotifications(false);
                              }}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2 border-primary/30 text-primary hover:bg-primary/20"
                              data-testid={`button-action-${notification.id}`}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}