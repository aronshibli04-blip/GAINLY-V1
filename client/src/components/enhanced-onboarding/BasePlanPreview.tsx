import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Dumbbell, 
  ChefHat, 
  Calendar, 
  TrendingUp, 
  Zap,
  User,
  Scale,
  Activity
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

interface BasePlanPreviewProps {
  userData: UserBasicData;
  basePlan: BasePlan;
  onStartApp: () => void;
}

export function BasePlanPreview({ userData, basePlan, onStartApp }: BasePlanPreviewProps) {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'analyzing' | 'results' | 'ready'>('analyzing');

  useEffect(() => {
    // Simulate AI analysis with realistic progression
    const phases = [
      { progress: 15, message: "Analyzing body composition...", duration: 800 },
      { progress: 35, message: "Calculating metabolic requirements...", duration: 600 },
      { progress: 55, message: "Creating training plan...", duration: 700 },
      { progress: 75, message: "Optimizing nutrition plan...", duration: 600 },
      { progress: 90, message: "Running future projections...", duration: 500 },
      { progress: 100, message: "Plan creation complete!", duration: 300 }
    ];

    let currentPhaseIndex = 0;
    
    const runAnalysis = () => {
      if (currentPhaseIndex < phases.length) {
        const phase = phases[currentPhaseIndex];
        
        setTimeout(() => {
          setAnalysisProgress(phase.progress);
          
          if (phase.progress === 100) {
            setTimeout(() => {
              setCurrentPhase('results');
              setShowResults(true);
              
              setTimeout(() => {
                setCurrentPhase('ready');
              }, 2000);
            }, 500);
          }
          
          currentPhaseIndex++;
          runAnalysis();
        }, phase.duration);
      }
    };

    runAnalysis();
  }, []);

  const getTrainingSplit = () => {
    const splits = {
      4: { name: "Upper/Lower Split", days: ["Upper Body", "Lower Body", "Upper Body", "Lower Body"] },
      5: { name: "Push/Pull/Legs+", days: ["Push", "Pull", "Legs", "Upper", "Lower"] },
      6: { name: "Push/Pull/Legs x2", days: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"] }
    };
    return splits[basePlan.trainingDays as keyof typeof splits] || splits[4];
  };

  const weightGainNeeded = userData.goalWeight - userData.weight;
  const bmi = userData.weight / Math.pow(userData.height / 100, 2);
  const bodyScanData = {
    currentBmi: bmi.toFixed(1),
    targetBmi: (userData.goalWeight / Math.pow(userData.height / 100, 2)).toFixed(1),
    muscleGainPotential: "High", // For hardgainers
    metabolicType: "Fast"
  };

  if (currentPhase === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-4">Lager din personlige plan...</h2>
          <p className="text-slate-400 mb-8">Processing your data with future algorithms...</p>

          <div className="mb-6">
            <Progress 
              value={analysisProgress} 
              className="w-full h-3 bg-slate-700"
            />
            <p className="text-emerald-400 mt-3 font-medium">{analysisProgress}% Complete</p>
          </div>

          <div className="space-y-2 text-slate-300">
            <motion.p
              key={analysisProgress}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm"
            >
              {analysisProgress < 15 && "Scanning body composition..."}
              {analysisProgress >= 15 && analysisProgress < 35 && "Calculating metabolic requirements..."}
              {analysisProgress >= 35 && analysisProgress < 55 && "Creating training plan..."}
              {analysisProgress >= 55 && analysisProgress < 75 && "Optimizing nutrition plan..."}
              {analysisProgress >= 75 && analysisProgress < 100 && "Running future projections..."}
              {analysisProgress >= 100 && "Plan creation complete!"}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Your Base Plan
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Welcome to the future, {userData.firstName}
          </p>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-4 py-1">
            This is your starting point. Each day unlocks more power.
          </Badge>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Body Analysis */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <User className="w-5 h-5 mr-2 text-emerald-400" />
                  Body Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Current</p>
                    <p className="text-2xl font-bold text-white">{userData.weight}kg</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Target</p>
                    <p className="text-2xl font-bold text-emerald-400">{userData.goalWeight}kg</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">BMI</span>
                    <span className="text-white">{bodyScanData.currentBmi} → {bodyScanData.targetBmi}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Muscle Potential</span>
                    <span className="text-emerald-400">{bodyScanData.muscleGainPotential}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Metabolism</span>
                    <span className="text-blue-400">{bodyScanData.metabolicType}</span>
                  </div>
                </div>

                {/* Placeholder Body Image */}
                <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                  <User className="w-16 h-16 mx-auto text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">Body Scan Placeholder</p>
                  <p className="text-xs text-emerald-400 mt-1">Updates daily during calibration</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center Column - Nutrition Plan */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ChefHat className="w-5 h-5 mr-2 text-orange-400" />
                  Nutrition Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-400">{basePlan.targetCalories}</p>
                  <p className="text-slate-400 text-sm">Daily Calories</p>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 mt-2">
                    +{basePlan.surplus} Surplus
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">{basePlan.proteinTarget}g</p>
                    <p className="text-xs text-slate-400">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">{basePlan.carbTarget}g</p>
                    <p className="text-xs text-slate-400">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">{basePlan.fatTarget}g</p>
                    <p className="text-xs text-slate-400">Fat</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Sample Hardgainer Meals:</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-emerald-400">• Mass Gainer Smoothie (800 cal)</p>
                    <p className="text-emerald-400">• Chicken & Rice Bowl (650 cal)</p>
                    <p className="text-emerald-400">• Pasta with Meat Sauce (900 cal)</p>
                    <p className="text-slate-500 text-xs mt-2">Full meal plans unlock during calibration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Training Plan */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800/90 backdrop-blur border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Dumbbell className="w-5 h-5 mr-2 text-purple-400" />
                  Training Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{basePlan.trainingDays} Days/Week</p>
                  <p className="text-slate-400 text-sm">{getTrainingSplit().name}</p>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-3">Weekly Split:</p>
                  <div className="space-y-2">
                    {getTrainingSplit().days.map((day, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-white text-sm">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Focus Areas:</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">• Compound Movements</p>
                    <p className="text-purple-400">• Progressive Overload</p>
                    <p className="text-purple-400">• Mass Building Rep Ranges</p>
                    <p className="text-slate-500 text-xs mt-2">Detailed workouts unlock during calibration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section - Projections */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800/90 backdrop-blur border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-center justify-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                Future Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{basePlan.timeToGoal} Weeks</p>
                  <p className="text-slate-400 text-sm">Estimated Timeline</p>
                  <p className="text-xs text-slate-500 mt-1">Based on 0.5kg/week gain</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{basePlan.projectedWeight.toFixed(1)}kg</p>
                  <p className="text-slate-400 text-sm">Projected Weight</p>
                  <p className="text-xs text-slate-500 mt-1">After initial phase</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">1kg</p>
                  <p className="text-slate-400 text-sm">Weekly Target</p>
                  <p className="text-xs text-slate-500 mt-1">Steady progress goal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-emerald-500/30 mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              Your protocol is ready! 
            </h3>
            <p className="text-slate-300 mb-4">
              Start logging immediately and we'll help you stay on track. Your <span className="text-emerald-400 font-bold">Weight Gain Journey</span> begins now.
            </p>
            <p className="text-sm text-slate-400">
              Full app access • Immediate tracking • Personalized recommendations
            </p>
          </div>

          <Button 
            onClick={onStartApp}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
            data-testid="button-enter-app"
          >
            <Zap className="w-5 h-5 mr-2" />
            Enter GAINLY App
          </Button>
          
          <p className="text-xs text-slate-500 mt-3">
            Your hardgainer protocol is activated and ready to use
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}