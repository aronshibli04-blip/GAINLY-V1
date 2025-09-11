import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/userStore';
import { 
  Brain, 
  Target, 
  Scale, 
  Utensils, 
  Activity, 
  Calendar, 
  Zap,
  Trophy,
  Unlock,
  Star,
  TrendingUp,
  Gift,
  Camera,
  Pill,
  Play
} from 'lucide-react';

interface UserBasicData {
  firstName: string;
  age: number;
  height: number;
  weight: number;
  sex: 'male' | 'female';
  activityLevel: string;
  goalWeight: number;
}

interface BasePlan {
  targetCalories: number;
  tdeeEstimate: number;
  surplus: number;
  trainingDays: number;
  projectedWeight: number;
  timeToGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

interface DailyReward {
  day: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  preview?: string;
  actionLabel?: string;
  content?: React.ReactNode;
  onClick?: () => void;
}

interface GamifiedCalibrationProps {
  userData: UserBasicData;
  basePlan: BasePlan;
  onComplete: () => void;
}

export function GamifiedCalibration({ userData, basePlan, onComplete }: GamifiedCalibrationProps) {
  const { toast } = useToast();
  const { addWeightEntry, addCalorieEntry, addActivityEntry, weightEntries, calorieEntries } = useUserStore();
  
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [todayReward, setTodayReward] = useState<DailyReward | null>(null);
  const [activeReward, setActiveReward] = useState<DailyReward | null>(null);
  const [showRewardContent, setShowRewardContent] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: '',
    calories: '',
    activityDescription: ''
  });

  const getTrainingPlan = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-emerald-400 mb-4">Your Training Split</h4>
      <div className="space-y-3">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">Day 1 & 4: Upper Body</h5>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Bench Press: 4x6-8</li>
            <li>• Bent-Over Rows: 4x6-8</li>
            <li>• Overhead Press: 3x8-10</li>
            <li>• Pull-ups: 3x8-12</li>
            <li>• Dips: 3x10-15</li>
          </ul>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">Day 2 & 5: Lower Body</h5>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Squats: 4x6-8</li>
            <li>• Deadlifts: 4x6-8</li>
            <li>• Bulgarian Split Squats: 3x10 each</li>
            <li>• Hip Thrusts: 3x12-15</li>
            <li>• Calf Raises: 4x15-20</li>
          </ul>
        </div>
      </div>
      <Button 
        className="w-full bg-emerald-500 hover:bg-emerald-600"
        onClick={() => window.location.href = '/training'}
      >
        Open Full Training App
      </Button>
    </div>
  );

  const getNutritionPlan = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-orange-400 mb-4">High-Calorie Meal Ideas</h4>
      <div className="space-y-3">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">Mass Gainer Smoothie (850 cal)</h5>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• 300ml whole milk</li>
            <li>• 1 banana</li>
            <li>• 2 tbsp peanut butter</li>
            <li>• 1 scoop whey protein</li>
            <li>• 1 tbsp olive oil</li>
          </ul>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">Loaded Rice Bowl (750 cal)</h5>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• 150g white rice</li>
            <li>• 120g grilled chicken</li>
            <li>• 1 avocado</li>
            <li>• 2 tbsp olive oil</li>
            <li>• Mixed vegetables</li>
          </ul>
        </div>
      </div>
      <Button 
        className="w-full bg-orange-500 hover:bg-orange-600"
        onClick={() => window.location.href = '/meals'}
      >
        Open Meal Logger & AI Plans
      </Button>
    </div>
  );

  const getSupplementGuide = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-purple-400 mb-4">Supplement Stack</h4>
      <div className="space-y-3">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h5 className="font-semibold text-white mb-2">Essential Stack</h5>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>• <strong>Creatine:</strong> 5g daily for strength & size</li>
            <li>• <strong>Whey Protein:</strong> 1-2 scoops post-workout</li>
            <li>• <strong>Mass Gainer:</strong> 1000+ cal shakes between meals</li>
            <li>• <strong>Fish Oil:</strong> 2g daily for recovery</li>
          </ul>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        *Consult healthcare provider before starting supplements
      </div>
    </div>
  );

  const getMotivationalContent = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-blue-400 mb-4">Hardgainer Success Stories</h4>
      <div className="space-y-3">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-white font-semibold mb-2">Lars: 65kg → 85kg på 8 måneder</p>
          <p className="text-sm text-slate-300">"Nøkkelen var konsistens med 4000+ kalori-planen og sammensatte øvelser. Jeg la på meg 20kg solid muskelmasse."</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-white font-semibold mb-2">Ingrid: 58kg → 72kg på 6 måneder</p>
          <p className="text-sm text-slate-300">"Flytende kalorier forandret alt. Proteinshakes gjorde det mulig å nå målene mine selv med lav appetitt."</p>
        </div>
      </div>
      <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
        <p className="text-emerald-400 text-sm font-medium">Din reise starter nå. Hvert gram teller.</p>
      </div>
    </div>
  );

  const dailyRewards: DailyReward[] = [
    {
      day: 1,
      title: "Training Preview",
      description: "Unlock your personalized workout plan preview",
      icon: <Target className="w-6 h-6" />,
      unlocked: false,
      preview: "Your training split: Push/Pull/Legs optimized for hardgainers",
      actionLabel: "View Training Plan",
      content: getTrainingPlan(),
      onClick: () => {
        setActiveReward(dailyRewards[0]);
        setShowRewardContent(true);
      }
    },
    {
      day: 2,
      title: "Nutrition Preview",
      description: "Access high-calorie meal suggestions",
      icon: <Utensils className="w-6 h-6" />,
      unlocked: false,
      preview: "Mass gainer recipes and liquid calorie strategies unlocked",
      actionLabel: "View Meal Ideas",
      content: getNutritionPlan(),
      onClick: () => {
        setActiveReward(dailyRewards[1]);
        setShowRewardContent(true);
      }
    },
    {
      day: 3,
      title: "AI Body Scan Update",
      description: "Enhanced body composition analysis",
      icon: <Camera className="w-6 h-6" />,
      unlocked: false,
      preview: "Body scan shows 1.2% muscle mass increase prediction",
      actionLabel: "View Analysis",
      onClick: () => toast({
        title: "Body Scan Updated",
        description: "Based on your data: muscle mass trending +1.2%. Keep logging to improve accuracy!",
      })
    },
    {
      day: 4,
      title: "Custom Supplement Guide",
      description: "Personalized supplement recommendations",
      icon: <Pill className="w-6 h-6" />,
      unlocked: false,
      preview: "Creatine + whey protein stack optimized for your metabolism",
      actionLabel: "View Supplements",
      content: getSupplementGuide(),
      onClick: () => {
        setActiveReward(dailyRewards[3]);
        setShowRewardContent(true);
      }
    },
    {
      day: 5,
      title: "Motivational Content",
      description: "Unlock exclusive hardgainer success stories",
      icon: <Play className="w-6 h-6" />,
      unlocked: false,
      preview: "3 transformation videos from similar body types",
      actionLabel: "Read Stories",
      content: getMotivationalContent(),
      onClick: () => {
        setActiveReward(dailyRewards[4]);
        setShowRewardContent(true);
      }
    },
    {
      day: 6,
      title: "Advanced Metrics",
      description: "Detailed progress tracking unlocked",
      icon: <TrendingUp className="w-6 h-6" />,
      unlocked: false,
      preview: "TDEE accuracy increased to 94% confidence level",
      actionLabel: "View Metrics",
      onClick: () => toast({
        title: "Advanced Metrics Unlocked!",
        description: "TDEE confidence: 94%. Weight trend: +0.3kg/week. Surplus efficiency: Excellent.",
      })
    },
    {
      day: 7,
      title: "Full Plan Activated",
      description: "Complete access to your personalized system",
      icon: <Trophy className="w-6 h-6" />,
      unlocked: false,
      preview: "All features unlocked - The hardgainer curse ends today!",
      actionLabel: "Activate Plan",
      onClick: () => onComplete()
    }
  ];

  const [rewards, setRewards] = useState<DailyReward[]>(dailyRewards);

  useEffect(() => {
    // Calculate progress based on unique days with data
    const uniqueWeightDays = new Set(weightEntries.map(w => w.date)).size;
    const uniqueCalorieDays = new Set(calorieEntries.map(c => c.date)).size;
    const dataEntryDays = Math.max(uniqueWeightDays, uniqueCalorieDays);
    
    const progress = Math.min((dataEntryDays / 7) * 100, 100);
    setCalibrationProgress(progress);
    setCurrentDay(Math.min(dataEntryDays + 1, 7));

    // Update rewards based on progress
    const updatedRewards = rewards.map(reward => ({
      ...reward,
      unlocked: dataEntryDays >= reward.day
    }));
    setRewards(updatedRewards);

    // Check if calibration is complete
    if (dataEntryDays >= 7) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [weightEntries, calorieEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.calories) {
      toast({
        title: "Please fill in weight and calories",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Add entries
    addWeightEntry({
      userId: 'user1',
      weight: parseFloat(formData.weight),
      date: today
    });
    
    addCalorieEntry({
      userId: 'user1',
      calories: parseInt(formData.calories),
      description: formData.activityDescription,
      date: today
    });

    if (formData.activityDescription) {
      addActivityEntry({
        userId: 'user1',
        type: 'light',
        value: 1,
        date: today
      });
    }

    // Show reward for current day
    const todayRewardData = rewards.find(r => r.day === currentDay);
    if (todayRewardData && !todayRewardData.unlocked) {
      setTodayReward(todayRewardData);
      setShowRewardModal(true);
    }

    // Clear form
    setFormData({
      weight: '',
      calories: '',
      activityDescription: ''
    });

    toast({
      title: `Day ${currentDay} logged successfully!`,
      description: "AI is processing your data...",
    });
  };

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setTodayReward(null);
  };

  const daysRemaining = Math.max(0, 7 - Math.floor(calibrationProgress / (100/7)));

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Setup Mode Active
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            Day {Math.min(currentDay, 7)} of 7 • {userData.firstName}'s Plan Development
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Setup Progress</span>
              <span>{calibrationProgress.toFixed(0)}%</span>
            </div>
            <Progress 
              value={calibrationProgress} 
              className="w-full h-4 bg-slate-700"
            />
            <p className="text-emerald-400 mt-2 font-medium">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Setup Complete!"}
            </p>
          </div>

          {daysRemaining > 0 && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 px-4 py-1">
              Each entry unlocks new AI capabilities
            </Badge>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Daily Logging */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Brain className="w-5 h-5 mr-2 text-emerald-400" />
                  Today's Data Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="weight" className="text-white font-medium">
                      Weight (kg) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder="70.5"
                      data-testid="input-daily-weight"
                    />
                  </div>

                  <div>
                    <Label htmlFor="calories" className="text-white font-medium">
                      Calories Consumed <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder={basePlan.targetCalories.toString()}
                      data-testid="input-daily-calories"
                    />
                    <p className="text-sm text-slate-400 mt-1">
                      Target: {basePlan.targetCalories} calories
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="activity" className="text-white font-medium">
                      Activity Notes (Optional)
                    </Label>
                    <Textarea
                      id="activity"
                      value={formData.activityDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, activityDescription: e.target.value }))}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                      placeholder="Gym session, walked 5000 steps, etc..."
                      rows={3}
                      data-testid="textarea-activity"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!formData.weight || !formData.calories}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-3 disabled:opacity-50"
                    data-testid="button-log-daily-data"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Log Day {Math.min(currentDay, 7)} Data
                  </Button>
                </form>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-3">Your Progress:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-400">{weightEntries.length}</p>
                      <p className="text-xs text-slate-400">Weight Entries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-400">{calorieEntries.length}</p>
                      <p className="text-xs text-slate-400">Calorie Entries</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Rewards Track */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Gift className="w-5 h-5 mr-2 text-purple-400" />
                  Daily Unlocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={reward.day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        reward.unlocked 
                          ? 'border-emerald-500 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20' 
                          : currentDay === reward.day
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-600 bg-slate-800/50'
                      }`}
                      onClick={reward.unlocked && reward.onClick ? reward.onClick : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            reward.unlocked 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : currentDay === reward.day
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-slate-700 text-slate-500'
                          }`}>
                            {reward.unlocked ? (
                              <Unlock className="w-5 h-5" />
                            ) : (
                              reward.icon
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              reward.unlocked ? 'text-emerald-400' : 'text-white'
                            }`}>
                              Day {reward.day}: {reward.title}
                            </p>
                            <p className="text-sm text-slate-400">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {reward.unlocked && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                              <Star className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                          {currentDay === reward.day && !reward.unlocked && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                              Today
                            </Badge>
                          )}
                          {reward.unlocked && reward.actionLabel && (
                            <Button
                              size="sm"
                              className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (reward.onClick) reward.onClick();
                              }}
                            >
                              {reward.actionLabel}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {reward.unlocked && reward.preview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-slate-700"
                        >
                          <p className="text-sm text-emerald-400 mb-2">{reward.preview}</p>
                          {reward.unlocked && reward.onClick && (
                            <p className="text-xs text-slate-500">👆 Click to access full content</p>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-emerald-500/30">
            <p className="text-lg text-white mb-2">
              Remember: You can always view your <span className="text-emerald-400 font-bold">Base Plan</span> during setup
            </p>
            <p className="text-slate-400 text-sm">
              Each day of logging makes the AI 15% more accurate. Your impossible growth awaits.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && todayReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-emerald-500/50"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  {todayReward.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Reward Unlocked!</h3>
                <p className="text-lg text-emerald-400 mb-3">{todayReward.title}</p>
                <p className="text-slate-300 mb-6">{todayReward.description}</p>
                
                {todayReward.preview && (
                  <div className="bg-emerald-500/10 rounded-lg p-4 mb-6 border border-emerald-500/30">
                    <p className="text-sm text-emerald-400">{todayReward.preview}</p>
                  </div>
                )}
                
                <Button 
                  onClick={closeRewardModal}
                  className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white font-bold px-6"
                >
                  Continue Setup
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Content Modal */}
      <AnimatePresence>
        {showRewardContent && activeReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-emerald-500/50 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    {activeReward.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{activeReward.title}</h3>
                    <p className="text-slate-400">{activeReward.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRewardContent(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="mb-6">
                {activeReward.content}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowRewardContent(false)}
                  className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white font-bold px-6"
                >
                  Continue Setup
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}