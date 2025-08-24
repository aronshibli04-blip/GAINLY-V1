import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { AICoachIntro } from './AICoachIntro';
import { InitialProfileSetup } from './InitialProfileSetup';
import { CalibrationComplete } from './CalibrationComplete';
import { useUserStore } from '@/store/userStore';

interface CalibrationData {
  weight: number;
  calories: number;
  activityLevel: string;
  sleep?: number;
}

interface ProfileData {
  firstName: string;
  age: string;
  height: string;
  weight: string;
  sex: string;
  activityLevel: string;
  goalWeight: string;
  dietaryPreferences: string[];
}

type FlowStep = 'splash' | 'intro' | 'profile' | 'complete';

export function FuturisticCalibrationFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('splash');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { setUser, completeOnboarding } = useUserStore();

  // Load existing data if any
  useEffect(() => {
    const savedProfile = localStorage.getItem('profile_data');
    const savedStep = localStorage.getItem('calibration_step');
    
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    if (savedStep && ['splash', 'intro', 'profile', 'complete'].includes(savedStep)) {
      setCurrentStep(savedStep as FlowStep);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('calibration_step', currentStep);
    if (profileData) {
      localStorage.setItem('profile_data', JSON.stringify(profileData));
    }
  }, [currentStep, profileData]);

  const handleBeginCalibration = () => {
    setCurrentStep('intro');
  };

  const handleIntroComplete = () => {
    setCurrentStep('profile');
  };

  const handleProfileComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentStep('complete');
  };

  const handleActivateProtocol = () => {
    if (!profileData) return;

    const weight = parseFloat(profileData.weight);
    const height = parseFloat(profileData.height);
    const age = parseInt(profileData.age);
    const goalWeight = parseFloat(profileData.goalWeight);
    
    // Calculate BMR using Mifflin-St Jeor equation
    const bmr = profileData.sex === 'male' 
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extreme: 1.9
    };
    
    const estimatedTDEE = Math.round(bmr * activityMultipliers[profileData.activityLevel as keyof typeof activityMultipliers]);

    // Create user profile
    const userProfile = {
      id: `user_${Date.now()}`,
      username: profileData.firstName.toLowerCase(),
      firstName: profileData.firstName,
      name: profileData.firstName,
      startWeight: weight,
      currentWeight: weight,
      weight: weight,
      goalWeight: goalWeight,
      age: age,
      height: height,
      sex: profileData.sex as 'male' | 'female',
      gender: profileData.sex,
      activityLevel: profileData.activityLevel,
      tdee: estimatedTDEE,
      calorieGoal: estimatedTDEE + 500, // 500 calorie surplus for hardgainers
      phase: 'tracking' as const,
      createdAt: new Date().toISOString(),
      dietaryPreferences: profileData.dietaryPreferences.map(name => ({ name, isAllergy: false })),
    };

    setUser(userProfile);
    completeOnboarding();

    // Clear stored data
    localStorage.removeItem('profile_data');
    localStorage.removeItem('calibration_step');
  };

  const getUserData = () => {
    if (!profileData) {
      return {
        startWeight: 70,
        avgCalories: 2500,
        estimatedTDEE: 3500
      };
    }

    const weight = parseFloat(profileData.weight);
    const height = parseFloat(profileData.height);
    const age = parseInt(profileData.age);
    
    // Calculate BMR and TDEE
    const bmr = profileData.sex === 'male' 
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extreme: 1.9
    };
    
    const estimatedTDEE = Math.round(bmr * activityMultipliers[profileData.activityLevel as keyof typeof activityMultipliers]);

    return {
      startWeight: weight,
      avgCalories: estimatedTDEE - 300, // Simulated current intake below TDEE
      estimatedTDEE
    };
  };

  switch (currentStep) {
    case 'splash':
      return <SplashScreen onBeginCalibration={handleBeginCalibration} />;
    
    case 'intro':
      return <AICoachIntro onComplete={handleIntroComplete} />;
    
    case 'profile':
      return <InitialProfileSetup onComplete={handleProfileComplete} />;
    
    case 'complete':
      return (
        <CalibrationComplete
          onActivateProtocol={handleActivateProtocol}
          userData={getUserData()}
        />
      );
    
    default:
      return <SplashScreen onBeginCalibration={handleBeginCalibration} />;
  }
}