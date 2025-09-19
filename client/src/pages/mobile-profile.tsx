import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  Star,
  Award,
  Flame,
  ChefHat,
  Camera,
  Edit3,
  Info,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useSideMenu } from "@/hooks/use-side-menu";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { calculateTdee } from "@/utils/tdee";
import { getTargetWeight } from "@/utils/weight-utils";

export default function MobileProfile() {
  const { toast } = useToast();
  const { openMenu } = useSideMenu();
  const { isVisible: isHeaderVisible } = useScrollDirection(50);
  const { 
    user, 
    setUser, 
    setTargetWeight,
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
    targetWeight: getTargetWeight(user)?.toString() || '',
    activityLevel: user?.activityLevel || 'moderately_active'
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate profile stats with null safety
  const currentWeight = weightEntries?.length > 0 ? weightEntries[0]?.weight || user.weight : user.weight;
  const startWeight = weightEntries?.length > 0 ? weightEntries[weightEntries.length - 1]?.weight || user.weight : user.weight;
  const weightGained = (currentWeight || 0) - (startWeight || 0);
  const targetWeight = getTargetWeight(user);
  const progressToGoal = targetWeight && startWeight && currentWeight && targetWeight > startWeight && currentWeight > startWeight 
    ? ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100
    : 0;
  
  const totalDaysTracked = Array.from(new Set([
    ...weightEntries.map(w => w.date),
    ...calorieEntries.map(c => c.date)
  ])).length;

  const avgCaloriesPerDay = calorieEntries?.length > 0 
    ? Math.round(calorieEntries.reduce((sum, entry) => sum + (entry?.calories || 0), 0) / calorieEntries.length)
    : 0;

  // USE stored AI Analysis value as the source of truth
  // All components must show the same TDEE as AI Analysis  
  const currentTdee = currentTdeeAnalysis?.tdee || 3750;
  const targetCalories = currentTdeeAnalysis?.targetCalories || 4850;
  

  // Advanced statistics
  const stats = useMemo(() => {
    const last7Days = calorieEntries?.slice(0, 7) || [];
    const last7DaysCalories = last7Days.reduce((sum, entry) => sum + (entry?.calories || 0), 0);
    const weeklyAverage = last7Days.length > 0 ? Math.round(last7DaysCalories / last7Days.length) : 0;
    
    // Streak calculation
    const uniqueDates = Array.from(new Set(calorieEntries?.map(entry => entry.date) || []));
    const sortedDates = uniqueDates.sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expectedDateStr) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Weekly gain rate
    const weeklyGainRate = totalDaysTracked > 0 ? (weightGained / totalDaysTracked) * 7 : 0;
    
    // Consistency score (0-100)
    const consistencyScore = totalDaysTracked > 0 ? Math.min(100, (currentStreak / totalDaysTracked) * 100) : 0;
    
    return {
      weeklyAverage,
      currentStreak,
      weeklyGainRate,
      consistencyScore,
      isOnTrack: Math.abs(weeklyGainRate - 1.0) < 0.3
    };
  }, [calorieEntries, weightGained, totalDaysTracked]);

  // Achievement system
  const achievements = useMemo(() => {
    const earned = [];
    
    // Basic achievements
    if (totalDaysTracked >= 1) earned.push({ id: 'first_day', title: 'Første dag', desc: 'Startet reisen', icon: Star, color: 'blue' });
    if (totalDaysTracked >= 7) earned.push({ id: 'week_warrior', title: 'Ukekriger', desc: '7 dager sporet', icon: Calendar, color: 'green' });
    if (totalDaysTracked >= 30) earned.push({ id: 'month_master', title: 'Månedsmester', desc: '30 dager sporet', icon: Trophy, color: 'purple' });
    
    // Weight achievements
    if (weightGained >= 1) earned.push({ id: 'first_kg', title: 'Første kilo', desc: 'Økte 1kg', icon: Scale, color: 'emerald' });
    if (weightGained >= 5) earned.push({ id: 'heavy_hitter', title: 'Tungvekter', desc: 'Økte 5kg', icon: TrendingUp, color: 'orange' });
    
    // Consistency achievements
    if (stats.currentStreak >= 3) earned.push({ id: 'streak_3', title: 'På riktig spor', desc: '3 dager på rad', icon: Flame, color: 'red' });
    if (stats.currentStreak >= 7) earned.push({ id: 'streak_7', title: 'Uke sterk', desc: '7 dager på rad', icon: Award, color: 'yellow' });
    if (stats.currentStreak >= 21) earned.push({ id: 'streak_21', title: 'Vane mester', desc: '21 dager på rad', icon: CheckCircle, color: 'indigo' });
    
    // Calorie achievements
    if (calorieEntries?.length >= 50) earned.push({ id: 'data_wizard', title: 'Data tryllekunstner', desc: '50+ måltider logget', icon: BarChart3, color: 'cyan' });
    if (avgCaloriesPerDay >= 3500) earned.push({ id: 'calorie_crusher', title: 'Kalori knuser', desc: '3500+ snitt per dag', icon: Zap, color: 'pink' });
    
    return earned;
  }, [totalDaysTracked, weightGained, stats.currentStreak, calorieEntries, avgCaloriesPerDay]);

  const handleSave = () => {
    if (!editData.firstName.trim()) {
      toast({
        title: "Feil",
        description: "Fornavn er påkrevd",
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
    
    if (editData.targetWeight && parseFloat(editData.targetWeight) !== getTargetWeight(user)) {
      setTargetWeight(parseFloat(editData.targetWeight));
    }

    setIsEditing(false);
    toast({
      title: "✅ Profil oppdatert",
      description: "Endringene dine er lagret.",
    });
  };

  const handleClearData = async () => {
    try {
      // ENHANCED RESET HANDLER - Added for comprehensive "Reset App" functionality
      // Now properly calls async clearUserData function with database clearing
      console.log('🔄 Reset App button pressed - starting comprehensive reset...');
      
      await clearUserData(); // Now awaits the async function
      
      toast({
        title: "🗑️ App tilbakestilt",
        description: "All data er slettet. Starter fra level 1.",
      });
      
      // Force a complete page reload to ensure clean state
      // This ensures onboarding starts fresh without any lingering state
      setTimeout(() => {
        window.location.href = '/setup';
      }, 1000); // Small delay to show the toast
      
    } catch (error) {
      console.error('❌ Reset failed:', error);
      toast({
        title: "⚠️ Reset feilet",
        description: "Prøv igjen eller last siden på nytt.",
        variant: "destructive"
      });
    }
  };

  const activityLevels = {
    sedentary: "Stillesittende (Kontorarbeid, lite trening)",
    lightly_active: "Lett aktivitet (Lett trening 1-3 dager/uke)",
    moderately_active: "Moderat aktivitet (Trening 3-5 dager/uke)",
    very_active: "Svært aktiv (Hard trening 6-7 dager/uke)",
    extremely_active: "Ekstremt aktiv (Fysisk jobb + trening)"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle & Auto-Hide */}
      <MobileHeader 
        title="Profile" 
        onOpenMenu={openMenu}
        isVisible={isHeaderVisible}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/20 rounded-full animate-pulse"
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
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-spin" 
                 style={{ animationDuration: '15s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 flex items-center justify-center shadow-xl">
              <User className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              PROFIL
            </span>
          </h1>
          <p className="text-indigo-400/70">Personlige innstillinger & prestasjonsdashboard</p>
        </div>

        {/* Enhanced Stats Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full bg-slate-800/50">
            <TabsTrigger value="overview" className="text-xs">Oversikt</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">Prestasjoner</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">Innsikt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-indigo-400/20 hover:border-indigo-400/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-400/20 rounded-lg mx-auto mb-2">
                <Scale className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-400">{(weightGained || 0) >= 0 ? '+' : ''}{(weightGained || 0).toFixed(1)}kg</div>
              <div className="text-sm text-slate-400">Vektøkning</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-violet-400/20 hover:border-violet-400/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-400/20 rounded-lg mx-auto mb-2">
                <Calendar className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-violet-400">{totalDaysTracked || 0}</div>
              <div className="text-sm text-slate-400">Dager sporet</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-400/20 hover:border-purple-400/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-400/20 rounded-lg mx-auto mb-2">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{avgCaloriesPerDay || 0}</div>
              <div className="text-sm text-slate-400">Snitt kalorier</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-pink-400/20 hover:border-pink-400/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-pink-400/20 rounded-lg mx-auto mb-2">
                <BarChart3 className="h-5 w-5 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-pink-400">{currentTdee || 0}</div>
              <div className="text-sm text-slate-400">Nåværende TDEE</div>
            </CardContent>
          </Card>
            </div>
            
            {/* Streak & Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-400/20 rounded-lg mx-auto mb-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
                  <div className="text-sm text-slate-400">Dagers rekke</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-400/20 rounded-lg mx-auto mb-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">{stats.weeklyGainRate.toFixed(1)}</div>
                  <div className="text-sm text-slate-400">kg/uke rate</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {/* Achievement Gallery */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Trophy className="h-5 w-5" />
                  Prestasjoner ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Ingen prestasjoner ennå</p>
                    <p className="text-sm text-slate-500">Fortsett å spore for å låse opp trofeer!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const IconComponent = achievement.icon;
                      return (
                        <Badge 
                          key={achievement.id}
                          className={`bg-${achievement.color}-400/20 text-${achievement.color}-400 border-${achievement.color}-400/40 p-4 flex flex-col items-center gap-2 h-auto`}
                        >
                          <IconComponent className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-semibold text-xs">{achievement.title}</div>
                            <div className="text-xs opacity-80">{achievement.desc}</div>
                          </div>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {/* Performance Insights */}
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-purple-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <BarChart3 className="h-5 w-5" />
                  Ytelsesinnsikt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Consistency Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Konsistens poengsum</span>
                    <span className="text-purple-400 font-semibold">{Math.round(stats.consistencyScore)}%</span>
                  </div>
                  <Progress value={stats.consistencyScore} className="h-2 bg-slate-700" />
                  <p className="text-xs text-slate-500">
                    {stats.consistencyScore >= 80 ? 'Utmerket! Du er svært konsistent.' :
                     stats.consistencyScore >= 60 ? 'Bra! Fortsett å bygge vaner.' :
                     'Fokuser på daglig sporing for bedre resultater.'}
                  </p>
                </div>

                {/* Weekly Performance */}
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    Ukentlig ytelse
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Gjennomsnitt siste uke:</span>
                      <div className="text-white font-semibold">{stats.weeklyAverage} kcal</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Vektøkning rate:</span>
                      <div className={`font-semibold ${stats.isOnTrack ? 'text-green-400' : 'text-orange-400'}`}>
                        {stats.weeklyGainRate.toFixed(2)} kg/uke
                      </div>
                    </div>
                  </div>
                  
                  {!stats.isOnTrack && (
                    <div className="mt-3 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-orange-400" />
                        <span className="text-orange-400 font-medium text-sm">Anbefaling</span>
                      </div>
                      <p className="text-orange-300 text-xs">
                        {stats.weeklyGainRate < 0.7 
                          ? `Øk daglig inntak med ${Math.round((1.0 - stats.weeklyGainRate) * 500)} kalorier for optimal vektøkning.`
                          : `Reduser daglig inntak med ${Math.round((stats.weeklyGainRate - 1.0) * 500)} kalorier.`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Goal Progress */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-indigo-400/20 hover:border-indigo-400/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Target className="h-5 w-5" />
              Målprogresjon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Start: {(startWeight || 0).toFixed(1)}kg</span>
                <span>Nå: {(currentWeight || 0).toFixed(1)}kg</span>
                <span>Target: {(targetWeight || 0).toFixed(1)}kg</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, progressToGoal || 0))} 
                className="h-3 bg-slate-700"
              />
              <div className="text-center text-sm text-slate-400">
                {Math.max(0, Math.min(100, progressToGoal || 0)).toFixed(1)}% til målet
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-8 bg-slate-800/50 border-indigo-400/20 hover:border-indigo-400/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <Settings className="h-5 w-5" />
              Profilinformasjon
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
                    targetWeight: getTargetWeight(user)?.toString() || '',
                    activityLevel: user.activityLevel || 'moderately_active'
                  });
                }
              }}
              variant="outline"
              size="sm"
              className="border-indigo-400/30 text-indigo-400 hover:bg-indigo-400/20"
              data-testid={isEditing ? "button-save-profile" : "button-edit-profile"}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {isEditing ? 'Lagre' : 'Rediger'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="edit-name" className="text-indigo-400">Fornavn</Label>
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
                    <Label htmlFor="edit-age" className="text-indigo-400">Alder</Label>
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
                    <Label htmlFor="edit-height" className="text-indigo-400">Høyde (cm)</Label>
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
                    <Label htmlFor="edit-weight" className="text-indigo-400">Nåværende vekt (kg)</Label>
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
                    <Label htmlFor="edit-target-weight" className="text-indigo-400">Target Weight (kg)</Label>
                    <Input
                      id="edit-target-weight"
                      type="number"
                      step="0.1"
                      value={editData.targetWeight}
                      onChange={(e) => setEditData({...editData, targetWeight: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      data-testid="input-edit-target-weight"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-activity" className="text-indigo-400">Aktivitetsnivå</Label>
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
                    <div className="text-sm text-slate-400">Navn</div>
                    <div className="text-white font-semibold">{user.firstName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Alder</div>
                    <div className="text-white font-semibold">{user.age} år</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Høyde</div>
                    <div className="text-white font-semibold">{user.height} cm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Nåværende vekt</div>
                    <div className="text-white font-semibold">{(currentWeight || 0).toFixed(1)} kg</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Target Weight</div>
                    <div className="text-white font-semibold">{(targetWeight || 0).toFixed(1)} kg</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Aktivitetsnivå</div>
                    <div className="text-white font-semibold text-sm">{(activityLevels as any)[user.activityLevel]?.split(' (')[0] || user.activityLevel}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}