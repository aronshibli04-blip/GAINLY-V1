import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Plus, Clock, Target, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MobileTraining() {
  const { toast } = useToast();
  const { openMenu } = useMenu();
  const { addActivityEntry, activityEntries } = useUserStore();

  const [activityType, setActivityType] = useState<string>("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activityEntries.filter(a => a.date === today);

  const handleLogActivity = () => {
    if (!activityType || !duration) {
      toast({ title: "Select activity type and duration", variant: "destructive" });
      return;
    }

    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 8) {
      toast({ title: "Enter valid duration (0.1-8 hours)", variant: "destructive" });
      return;
    }

    addActivityEntry({
      date: today,
      type: activityType as any,
      value: durationNum,
      userId: "user1"
    });

    setActivityType("");
    setDuration("");
    setDescription("");
    toast({ 
      title: "Workout logged!", 
      description: `${durationNum}h ${activityType} training added` 
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'light': return '🚶';
      case 'moderate': return '🏃';
      case 'heavy': return '💪';
      default: return '🏃';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'light': return 'Light Activity';
      case 'moderate': return 'Moderate Training';
      case 'heavy': return 'Heavy Training';
      default: return type;
    }
  };

  // Calculate training frequency and impact on weight gain
  const lastWeekTraining = activityEntries.filter(a => {
    const entryDate = new Date(a.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const trainingFrequency = lastWeekTraining.length;
  const optimalFrequency = 3; // 3x per week for muscle gain
  const trainingGap = Math.max(0, optimalFrequency - trainingFrequency);

  const lastTrainingEntry = activityEntries[0];
  const daysSinceLastTraining = lastTrainingEntry 
    ? Math.floor((new Date().getTime() - new Date(lastTrainingEntry.date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return (
    <div className="mobile-container">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Training" 
        onOpenMenu={openMenu}
      />
      
      <div className="content-with-bottom-nav pt-16 p-4 space-y-4">

        {/* Training Impact on Weight Gain */}
        <Card className={`${daysSinceLastTraining >= 3 ? 'border-red-500/40 bg-red-500/10' : trainingFrequency >= 3 ? 'border-green-500/40 bg-green-500/10' : 'border-yellow-500/40 bg-yellow-500/10'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center justify-between ${daysSinceLastTraining >= 3 ? 'text-red-400' : trainingFrequency >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Training Impact on 1kg/Week Goal
              </div>
              <Badge variant="outline" className={`${daysSinceLastTraining >= 3 ? 'text-red-400 border-red-400' : trainingFrequency >= 3 ? 'text-green-400 border-green-400' : 'text-yellow-400 border-yellow-400'}`}>
                {trainingFrequency}/3 this week
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Training Target</span>
                <span className="font-semibold text-white">{trainingFrequency} / 3 sessions</span>
              </div>
              <Progress value={(trainingFrequency / 3) * 100} className="h-2" />
            </div>

            {daysSinceLastTraining >= 3 && (
              <div className="bg-red-500/20 border border-red-500/40 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-400 font-medium text-sm">MUSCLE LOSS RISK</span>
                </div>
                <p className="text-red-300 text-xs">
                  {daysSinceLastTraining} days without training! Without resistance training, weight gain will be mostly fat instead of muscle.
                </p>
              </div>
            )}

            {trainingGap > 0 && daysSinceLastTraining < 3 && (
              <div className="bg-yellow-500/20 border border-yellow-500/40 p-3 rounded-lg">
                <p className="text-yellow-300 text-xs">
                  Need {trainingGap} more training session{trainingGap > 1 ? 's' : ''} this week for optimal muscle gain from your 1100kcal surplus.
                </p>
              </div>
            )}

            {trainingFrequency >= 3 && (
              <div className="bg-green-500/20 border border-green-500/40 p-3 rounded-lg">
                <p className="text-green-300 text-xs">
                  Perfect! Your training frequency ensures your 1100kcal surplus builds quality muscle mass.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-white mb-1">Training Log</h1>
          <p className="text-sm text-muted-foreground">
            Track your workouts and activity
          </p>
        </div>

        {/* Today's Summary */}
        <Card className="grok-glow-hover">
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Today's Training</p>
            <p className="text-lg font-bold text-white">
              {todayActivities.length > 0 
                ? `${todayActivities.reduce((sum, a) => sum + a.value, 0).toFixed(1)}h` 
                : "Not logged"}
            </p>
          </CardContent>
        </Card>

        {/* Activity Logging */}
        <Card className="grok-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-primary" />
              Log Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Activity Type
              </Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="grok-input mt-1" data-testid="select-activity-type">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">🚶 Light Activity (walking, stretching)</SelectItem>
                  <SelectItem value="moderate">🏃 Moderate Training (cardio, bodyweight)</SelectItem>
                  <SelectItem value="heavy">💪 Heavy Training (weightlifting, HIIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm text-muted-foreground">
                Duration (hours)
              </Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="duration"
                  type="number"
                  placeholder="1.5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="grok-input flex-1"
                  step="0.1"
                  data-testid="input-duration"
                />
                <Button 
                  onClick={handleLogActivity}
                  className="grok-gradient px-6"
                  data-testid="button-log-activity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="workout-desc" className="text-sm text-muted-foreground">
                Workout notes (optional)
              </Label>
              <Input
                id="workout-desc"
                placeholder="Push day, squats 3x8, bench press..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="grok-input mt-1"
                data-testid="input-workout-description"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Activity Buttons */}
        <Card className="grok-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Quick Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 grok-glow-hover"
                onClick={() => {
                  setActivityType("moderate");
                  setDuration("1");
                }}
                data-testid="button-quick-moderate"
              >
                <span className="text-lg">🏃</span>
                <span className="text-xs">1h Moderate</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 grok-glow-hover"
                onClick={() => {
                  setActivityType("heavy");
                  setDuration("1.5");
                }}
                data-testid="button-quick-heavy"
              >
                <span className="text-lg">💪</span>
                <span className="text-xs">1.5h Heavy</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activities */}
        {todayActivities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Today's Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getActivityIcon(activity.type)}
                    </span>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {getActivityLabel(activity.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {activity.value}h
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      <BottomNav />
    </div>
  );
}