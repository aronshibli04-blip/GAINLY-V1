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

  // Generate base plan immediately after data collection
  const generateBasePlan = (data: UserBasicData): BasePlan => {
    // Calculate BMR using Mifflin-St Jeor equation
    const bmr = data.sex === 'male' 
      ? 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
      : 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    
    // Activity multipliers (conservative estimates for base plan)
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very': 1.725,
      'extreme': 1.9
    };
    
    const multiplier = activityMultipliers[data.activityLevel as keyof typeof activityMultipliers] || 1.4;
    const tdeeEstimate = Math.round(bmr * multiplier);
    
    // Aggressive surplus for hardgainers (15-20% above TDEE)
    const surplus = Math.max(500, Math.round(tdeeEstimate * 0.17));
    const targetCalories = tdeeEstimate + surplus;
    
    // Macros: 1.8g protein/kg, 30% fat, rest carbs
    const proteinTarget = Math.round(data.weight * 1.8);
    const fatTarget = Math.round((targetCalories * 0.3) / 9);
    const carbTarget = Math.round((targetCalories - (proteinTarget * 4) - (fatTarget * 9)) / 4);
    
    // Projections
    const weightGain = data.goalWeight - data.weight;
    const timeToGoal = Math.max(8, Math.round((weightGain / 0.5) * 1.2)); // Realistic timeline
    const projectedWeight = data.weight + (timeToGoal * 0.4); // Conservative estimate
    
    return {
      targetCalories,
      tdeeEstimate,
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