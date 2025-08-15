import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Gift, Star, Zap, Crown, Heart, Coffee, Camera, ShoppingBag, Gamepad2, Wand2, Sparkles, Flame } from "lucide-react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";
import { useUserStore } from "@/store/userStore";
import { RewardCustomizer } from "@/components/reward-customizer";
import { MicroCelebration } from "@/components/ui/micro-celebration";

export function MobileGoals() {
  const { openMenu } = useMenu();
  const { user, weightEntries } = useUserStore();
  const [customRewards, setCustomRewards] = useState<{[key: number]: string}>({});
  
  // Get current weight from latest entry
  const currentWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : 70;
    
  const targetWeight = user?.goalWeight || 85;

  const updateReward = (goalWeight: number, newReward: string) => {
    setCustomRewards(prev => ({ ...prev, [goalWeight]: newReward }));
  };

  // Generate dynamic micro goals based on current weight (Hybrid model: 2kg for big rewards)
  const generateMicroGoals = () => {
    const startWeight = Math.floor(currentWeight);
    const endWeight = targetWeight;
    const goals = [];
    
    // Create major milestone goals for every 2kg + target weight
    for (let weight = startWeight + 2; weight <= endWeight; weight += 2) {
      // If we overshoot the target, adjust to target weight
      if (weight > endWeight) weight = endWeight;
      
      // Alternate between different reward themes and icons
      const rewardThemes = [
        { theme: "Supplement/Health", icon: <Star className="h-4 w-4" />, default: "Protein, creatine eller supplement" },
        { theme: "Tech/Gadget", icon: <Camera className="h-4 w-4" />, default: "Tech-gadget eller elektronikk" },
        { theme: "Wellness", icon: <Heart className="h-4 w-4" />, default: "Massage, spa eller wellness" },
        { theme: "Social", icon: <Coffee className="h-4 w-4" />, default: "Restaurant eller aktivitet med venner" },
        { theme: "Experience", icon: <Gift className="h-4 w-4" />, default: "Ny opplevelse eller event" },
        { theme: "Shopping", icon: <ShoppingBag className="h-4 w-4" />, default: "Noe du har ønsket deg lenge" },
        { theme: "Game/Fun", icon: <Gamepad2 className="h-4 w-4" />, default: "Spill, hobby eller utstyr" },
        { theme: "Fashion", icon: <Crown className="h-4 w-4" />, default: "Nye klær eller stil-oppgradering" }
      ];
      
      const milestonesCompleted = Math.floor((weight - startWeight) / 2) - 1;
      const themeIndex = milestonesCompleted % rewardThemes.length;
      const theme = rewardThemes[Math.max(0, themeIndex)];
      
      // Special rewards for major milestones
      let reward = theme.default;
      let description = `${weight}kg - ${weight - startWeight}kg fremgang!`;
      
      if (weight === endWeight) {
        reward = "MÅLVEKT OPPNÅDD! Storslått feiring: helgetur, coaching-pakke eller noe stort";
        description = "🎉 Målvekt oppnådd - tid for stor feiring!";
      } else if ((weight - startWeight) >= 10) {
        reward = "Stor belønning for utrolig fremgang!";
        description = `${weight - startWeight}kg fremgang - du er en legende!`;
      }
      
      goals.push({
        weight,
        reward: customRewards[weight] || reward,
        icon: theme.icon,
        description,
        completed: currentWeight >= weight,
        isMajorMilestone: true
      });
    }
    
    return goals;
  };

  const microGoals = generateMicroGoals();

  const nextGoal = microGoals.find(goal => !goal.completed);
  const completedGoals = microGoals.filter(goal => goal.completed).length;
  const progressPercentage = (completedGoals / microGoals.length) * 100;
  const weightProgress = ((currentWeight - 70) / ((user?.goalWeight || 85) - 70)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Mikro mål" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6">
        
        {/* Micro Celebrations & Progress */}
        <MicroCelebration />
        
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin" 
                 style={{ animationDuration: '8s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-xl">
              <Target className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              MIKRO MÅL
            </span>
          </h1>
          <p className="text-blue-400/70">Mikro mål er trappetrinn mot destinasjonen.</p>
          <p className="text-blue-400/70 font-semibold">Mål: {targetWeight}KG</p>
        </div>

        {/* Current Progress Overview */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20 hover:border-blue-400/40 transition-colors mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Trophy className="h-5 w-5" />
              Fremgang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Vekt fremgang</span>
                  <span className="text-sm font-medium">{currentWeight}kg / {targetWeight}kg</span>
                </div>
                <Progress 
                  value={Math.min(weightProgress, 100)} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Mål fullført</span>
                  <span className="text-sm font-medium">{completedGoals} / {microGoals.length}</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Goal Highlight */}
        {nextGoal && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-400/40 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Zap className="h-5 w-5" />
                Neste mål
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-400">{nextGoal.weight}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{nextGoal.reward}</div>
                    <div className="text-sm text-slate-400">{nextGoal.description}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {(nextGoal.weight - currentWeight).toFixed(1)}kg to go!
                    </div>
                  </div>
                </div>
                {nextGoal.icon}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Major Milestones (2kg intervals) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">Store Milepæler (hver 2kg)</h3>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/40 text-xs">
              Store belønninger
            </Badge>
          </div>
          
          {microGoals.map((goal, index) => (
            <Card 
              key={goal.weight}
              className={`transition-all duration-300 ${
                goal.completed 
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-400/40' 
                  : goal === nextGoal
                    ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-400/40'
                    : 'bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-slate-600/20'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      goal.completed 
                        ? 'bg-green-400/20 text-green-400' 
                        : goal === nextGoal
                          ? 'bg-blue-400/20 text-blue-400'
                          : 'bg-slate-600/20 text-slate-400'
                    }`}>
                      <span className="text-sm font-bold">{goal.weight}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        goal.completed ? 'text-green-400' : 'text-white'
                      }`}>
                        {goal.reward}
                      </div>
                      <div className="text-sm text-slate-400">{goal.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {goal.completed ? (
                        <Badge className="bg-green-400/20 text-green-400 border-green-400/40">
                          <Trophy className="h-3 w-3 mr-1" />
                          Fullført
                        </Badge>
                      ) : goal === nextGoal ? (
                        <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/40">
                          <Target className="h-3 w-3 mr-1" />
                          Aktivt
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          <Target className="h-3 w-3 mr-1" />
                          Venter
                        </Badge>
                      )}
                      
                      <div className={`${
                        goal.completed ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        {goal.icon}
                      </div>
                    </div>
                    
                    {/* AI Customization Button */}
                    <RewardCustomizer
                      goalWeight={goal.weight}
                      currentReward={goal.reward}
                      onRewardChange={(newReward) => updateReward(goal.weight, newReward)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dopamin Psychology Info */}
        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-400/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Psykologi-Basert Motivasjon</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Systemet bruker forskningsbaserte dopamin-teknikker: micro-rewards (0.5kg), daglige streaks, 
              og store milepæler (2kg) for optimal motivasjon.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/40 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                Daglige streaks
              </Badge>
              <Badge variant="outline" className="text-orange-400 border-orange-400/40 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Micro-seire (0.5kg)
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400/40 text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                Store milepæler (2kg)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Personalization Info */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-400/20 mt-4">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wand2 className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">AI-Tilpassede Belønninger</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Klikk "Tilpass" på et mål for å la AI-en lage personlige belønninger basert på dine interesser og ønsker.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-purple-400 border-purple-400/40">
                <Sparkles className="h-3 w-3 mr-1" />
                Personlig
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400/40">
                <Wand2 className="h-3 w-3 mr-1" />
                AI-drevet
              </Badge>
              <Badge variant="outline" className="text-green-400 border-green-400/40">
                <Heart className="h-3 w-3 mr-1" />
                Motiverende
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-blue-400/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-400">{completedGoals}</div>
              <div className="text-sm text-slate-400">Mål oppnådd</div>
            </div>
            <p className="text-slate-300 text-sm">
              {completedGoals === 0 && "Din reise starter nå! Første mål venter på deg."}
              {completedGoals > 0 && completedGoals < 4 && "Fantastisk start! Du er på rett vei."}
              {completedGoals >= 4 && completedGoals < 7 && "Utrolig fremgang! Du mestrer dette."}
              {completedGoals >= 7 && "Du er en legende! Målet er innen rekkevidde."}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}