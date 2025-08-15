import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { 
  User, 
  Target, 
  Calendar, 
  TrendingUp, 
  Settings, 
  Trash2, 
  Save,
  Scale,
  Zap,
  Trophy,
  Clock,
  Activity,
  BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";

export default function MobileProfile() {
  const { toast } = useToast();
  const { openMenu } = useMenu();
  const { 
    user, 
    setUser, 
    setGoalWeight,
    weightEntries, 
    calorieEntries,
    currentTdeeAnalysis,
    clearUserData 
  } = useUserStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    goalWeight: user?.goalWeight?.toString() || '',
    activityLevel: user?.activityLevel || 'moderately_active'
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate profile stats
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : user.weight;
  const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user.weight;
  const weightGained = currentWeight - startWeight;
  const goalWeight = user.goalWeight || currentWeight + 10;
  const progressToGoal = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
  
  const totalDaysTracked = new Set([
    ...weightEntries.map(w => w.date),
    ...calorieEntries.map(c => c.date)
  ]).size;

  const avgCaloriesPerDay = calorieEntries.length > 0 
    ? Math.round(calorieEntries.reduce((sum, entry) => sum + entry.calories, 0) / calorieEntries.length)
    : 0;

  const currentTdee = currentTdeeAnalysis?.tdee || 2400;

  const handleSave = () => {
    if (!editData.firstName.trim()) {
      toast({
        title: "Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = {
      ...user,
      firstName: editData.firstName,
      age: parseInt(editData.age),
      height: parseInt(editData.height),
      weight: parseFloat(editData.weight),
      activityLevel: editData.activityLevel
    };

    setUser(updatedUser);
    
    if (editData.goalWeight && parseFloat(editData.goalWeight) !== user.goalWeight) {
      setGoalWeight(parseFloat(editData.goalWeight));
    }

    setIsEditing(false);
    toast({
      title: "✅ Profile Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleClearData = () => {
    clearUserData();
    toast({
      title: "🗑️ Data Cleared",
      description: "All user data has been reset.",
    });
    window.location.href = '/setup';
  };

  const activityLevels = {
    sedentary: "Sedentary (Office work, little exercise)",
    lightly_active: "Light Activity (Light exercise 1-3 days/week)",
    moderately_active: "Moderate Activity (Exercise 3-5 days/week)",
    very_active: "Very Active (Hard exercise 6-7 days/week)",
    extremely_active: "Extremely Active (Physical job + exercise)"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Profile" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" 
                 style={{ animationDuration: '15s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center shadow-xl">
              <User className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              PROFILE
            </span>
          </h1>
          <p className="text-primary/70">Manage your account & view progress</p>
        </div>

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg mx-auto mb-2">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{weightGained >= 0 ? '+' : ''}{weightGained.toFixed(1)}kg</div>
              <div className="text-sm text-slate-400">Weight Gained</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/20 rounded-lg mx-auto mb-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">{totalDaysTracked}</div>
              <div className="text-sm text-slate-400">Days Tracked</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-lg mx-auto mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">{avgCaloriesPerDay}</div>
              <div className="text-sm text-slate-400">Avg Calories</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mx-auto mb-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{currentTdee}</div>
              <div className="text-sm text-slate-400">Current TDEE</div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Start: {startWeight}kg</span>
                <span>Current: {currentWeight}kg</span>
                <span>Goal: {goalWeight}kg</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, progressToGoal))} 
                className="h-3 bg-slate-700"
              />
              <div className="text-center text-sm text-slate-400">
                {Math.max(0, Math.min(100, progressToGoal)).toFixed(1)}% to goal
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-8 bg-slate-800/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Settings className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <Button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                  setEditData({
                    firstName: user.firstName || '',
                    age: user.age?.toString() || '',
                    height: user.height?.toString() || '',
                    weight: user.weight?.toString() || '',
                    goalWeight: user.goalWeight?.toString() || '',
                    activityLevel: user.activityLevel || 'moderately_active'
                  });
                }
              }}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/20"
              data-testid={isEditing ? "button-save-profile" : "button-edit-profile"}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="edit-name" className="text-primary">First Name</Label>
                  <Input
                    id="edit-name"
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    data-testid="input-edit-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-age" className="text-primary">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData({...editData, age: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-edit-age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-height" className="text-primary">Height (cm)</Label>
                    <Input
                      id="edit-height"
                      type="number"
                      value={editData.height}
                      onChange={(e) => setEditData({...editData, height: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-edit-height"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-weight" className="text-primary">Current Weight (kg)</Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      step="0.1"
                      value={editData.weight}
                      onChange={(e) => setEditData({...editData, weight: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-edit-weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-goal-weight" className="text-primary">Goal Weight (kg)</Label>
                    <Input
                      id="edit-goal-weight"
                      type="number"
                      step="0.1"
                      value={editData.goalWeight}
                      onChange={(e) => setEditData({...editData, goalWeight: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-edit-goal-weight"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-activity" className="text-primary">Activity Level</Label>
                  <select
                    id="edit-activity"
                    value={editData.activityLevel}
                    onChange={(e) => setEditData({...editData, activityLevel: e.target.value})}
                    className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                    data-testid="select-edit-activity"
                  >
                    {Object.entries(activityLevels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Name</div>
                    <div className="text-white font-semibold">{user.firstName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Age</div>
                    <div className="text-white font-semibold">{user.age} years</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Height</div>
                    <div className="text-white font-semibold">{user.height} cm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Current Weight</div>
                    <div className="text-white font-semibold">{currentWeight} kg</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Goal Weight</div>
                    <div className="text-white font-semibold">{goalWeight} kg</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Activity Level</div>
                    <div className="text-white font-semibold text-sm">{(activityLevels as any)[user.activityLevel]?.split(' (')[0] || user.activityLevel}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {totalDaysTracked >= 7 && (
                <Badge className="bg-primary/20 text-primary border-primary/40 p-3 flex flex-col items-center">
                  <Calendar className="h-6 w-6 mb-1" />
                  <span className="text-xs">7 Day Streak</span>
                </Badge>
              )}
              {weightGained >= 1 && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/40 p-3 flex flex-col items-center">
                  <TrendingUp className="h-6 w-6 mb-1" />
                  <span className="text-xs">First Kg</span>
                </Badge>
              )}
              {calorieEntries.length >= 10 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 p-3 flex flex-col items-center">
                  <Activity className="h-6 w-6 mb-1" />
                  <span className="text-xs">Data Master</span>
                </Badge>
              )}
              {progressToGoal >= 50 && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 p-3 flex flex-col items-center">
                  <Target className="h-6 w-6 mb-1" />
                  <span className="text-xs">Halfway Hero</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300/80 text-sm mb-4">
              This will permanently delete all your data including weight entries, calorie logs, and progress history.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                  data-testid="button-clear-data-trigger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-red-500/50">
                <DialogHeader>
                  <DialogTitle className="text-red-400">Are you absolutely sure?</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    This action cannot be undone. This will permanently delete all your data and progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleClearData}
                    variant="destructive" 
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600"
                    data-testid="button-confirm-clear-data"
                  >
                    Yes, delete everything
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}