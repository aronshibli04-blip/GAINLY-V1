import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InstantDataCollection } from './InstantDataCollection';
import { BasePlanPreview } from './BasePlanPreview';
import { useUserStore } from '@/store/userStore';

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
  timeToGoal: number; // weeks
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

type FlowStep = 'data_collection' | 'base_plan';

export function EnhancedOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('data_collection');
  const [userData, setUserData] = useState<UserBasicData | null>(null);
  const [basePlan, setBasePlan] = useState<BasePlan | null>(null);
  const { setUser, completeOnboarding, updatePhase } = useUserStore();

  // Analyze activity description to determine accurate multiplier
  const analyzeActivityLevel = (activityDescription: string): number => {
    const description = activityDescription.toLowerCase();
    
    // Keywords and patterns for different activity levels
    const highActivityKeywords = [
      'physical job', 'construction', 'warehouse', 'delivery', 'retail',
      'grocery store', 'restaurant', 'walking', 'standing all day',
      '15k', '20k', '10k', 'steps', 'daily training', 'gym', 
      'hypertrophy', 'weightlifting', 'cardio', '6x', '5x', '4x per week'
    ];
    
    const moderateActivityKeywords = [
      'office', 'desk job', 'sitting', 'computer', '3x per week',
      'moderate exercise', 'weekend activities'
    ];
    
    const extremeActivityKeywords = [
      'athlete', 'professional sports', 'twice a day', 'daily intense',
      'manual labor', 'farming', 'military'
    ];
    
    // Count activity indicators
    let highActivityCount = 0;
    let extremeActivityCount = 0;
    let moderateActivityCount = 0;
    
    highActivityKeywords.forEach(keyword => {
      if (description.includes(keyword)) highActivityCount++;
    });
    
    extremeActivityKeywords.forEach(keyword => {
      if (description.includes(keyword)) extremeActivityCount++;
    });
    
    moderateActivityKeywords.forEach(keyword => {
      if (description.includes(keyword)) moderateActivityCount++;
    });
    
    // Determine multiplier based on activity analysis
    if (extremeActivityCount >= 1 || highActivityCount >= 3) {
      return 2.2; // Very high activity (e.g., physical job + daily training)
    } else if (highActivityCount >= 2) {
      return 1.9; // High activity (e.g., active job or frequent training)
    } else if (highActivityCount >= 1) {
      return 1.725; // Above average activity
    } else if (moderateActivityCount >= 1) {
      return 1.55; // Moderate activity
    } else {
      return 1.375; // Light activity (fallback)
    }
  };

  // Generate base plan immediately after data collection
  const generateBasePlan = (data: UserBasicData): BasePlan => {
    // Calculate BMR using Mifflin-St Jeor equation
    const bmr = data.sex === 'male' 
      ? 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
      : 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    
    // Analyze activity description for accurate multiplier
    const multiplier = analyzeActivityLevel(data.activityLevel);
    const tdeeEstimate = Math.round(bmr * multiplier);
    
    // Ensure TDEE is within reasonable bounds but allow for high-activity individuals
    const boundedTdee = Math.max(1800, Math.min(6000, tdeeEstimate));
    
    // Aggressive surplus for hardgainers (1100 calories for 1kg/week gain)
    const surplus = 1100;
    const targetCalories = boundedTdee + surplus;
    
    // Macros: 1.8g protein/kg, 30% fat, rest carbs
    const proteinTarget = Math.round(data.weight * 1.8);
    const fatTarget = Math.round((targetCalories * 0.3) / 9);
    const carbTarget = Math.round((targetCalories - (proteinTarget * 4) - (fatTarget * 9)) / 4);
    
    // Projections
    const weightGain = data.goalWeight - data.weight;
    const timeToGoal = Math.max(8, Math.round((weightGain / 1.0) * 1.2)); // 1kg/week realistic timeline
    const projectedWeight = data.weight + (timeToGoal * 0.8); // More aggressive estimate
    
    return {
      targetCalories,
      tdeeEstimate: boundedTdee,
      surplus,
      trainingDays: 4, // Default training split
      projectedWeight: Math.min(projectedWeight, data.goalWeight),
      timeToGoal,
      proteinTarget,
      carbTarget,
      fatTarget
    };
  };

  const handleDataCollection = (data: UserBasicData) => {
    setUserData(data);
    const plan = generateBasePlan(data);
    setBasePlan(plan);
    
    // Save basic user data to store
    const user = {
      id: 'user1', // Demo user ID
      username: data.firstName.toLowerCase(),
      firstName: data.firstName,
      age: data.age,
      sex: data.sex,
      height: data.height,
      weight: data.weight,
      goalWeight: data.goalWeight,
      activityLevel: data.activityLevel,
      createdAt: new Date().toISOString(),
      calibrationStartDate: new Date().toISOString(),
      hasCompletedCalibration: true
    };
    
    setUser(user);
    setCurrentStep('base_plan');
  };

  const handleStartApp = () => {
    completeOnboarding();
    updatePhase('tracking');
    // Navigate to main app
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Futuristic background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-40"
            animate={{
              y: [0, -30, 0],
              x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 'data_collection' && (
            <motion.div
              key="data_collection"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
            >
              <InstantDataCollection onComplete={handleDataCollection} />
            </motion.div>
          )}

          {currentStep === 'base_plan' && userData && basePlan && (
            <motion.div
              key="base_plan"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
            >
              <BasePlanPreview 
                userData={userData}
                basePlan={basePlan}
                onStartApp={handleStartApp}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}