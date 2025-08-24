import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { AICoachIntro } from './AICoachIntro';
import { CalibrationDay } from './CalibrationDay';
import { CalibrationComplete } from './CalibrationComplete';
import { useUserStore } from '@/store/userStore';

interface CalibrationData {
  weight: number;
  calories: number;
  activityLevel: string;
  sleep?: number;
}

type FlowStep = 'splash' | 'intro' | 'calibration' | 'complete';

export function FuturisticCalibrationFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('splash');
  const [currentDay, setCurrentDay] = useState(1);
  const [calibrationData, setCalibrationData] = useState<CalibrationData[]>([]);
  const { setUser, completeOnboarding } = useUserStore();

  // Load existing calibration data if any
  useEffect(() => {
    const savedData = localStorage.getItem('calibration_data');
    const savedDay = localStorage.getItem('calibration_day');
    const savedStep = localStorage.getItem('calibration_step');
    
    if (savedData) {
      setCalibrationData(JSON.parse(savedData));
    }
    if (savedDay) {
      setCurrentDay(parseInt(savedDay));
    }
    if (savedStep && ['splash', 'intro', 'calibration', 'complete'].includes(savedStep)) {
      setCurrentStep(savedStep as FlowStep);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('calibration_step', currentStep);
    localStorage.setItem('calibration_day', currentDay.toString());
    localStorage.setItem('calibration_data', JSON.stringify(calibrationData));
  }, [currentStep, currentDay, calibrationData]);

  const handleBeginCalibration = () => {
    setCurrentStep('intro');
  };

  const handleIntroComplete = () => {
    setCurrentStep('calibration');
  };

  const handleDayComplete = (data: CalibrationData) => {
    const updatedData = [...calibrationData];
    updatedData[currentDay - 1] = data;
    setCalibrationData(updatedData);

    if (currentDay === 7) {
      setCurrentStep('complete');
    } else {
      setCurrentDay(prev => prev + 1);
    }
  };

  const handleActivateProtocol = () => {
    // Calculate TDEE from collected data
    const avgWeight = calibrationData.reduce((sum, day) => sum + day.weight, 0) / calibrationData.length;
    const avgCalories = calibrationData.reduce((sum, day) => sum + day.calories, 0) / calibrationData.length;
    
    // Simple TDEE estimation (this would be more sophisticated in real implementation)
    const estimatedTDEE = Math.round(avgCalories * 1.4); // Rough multiplier for hardgainers

    // Create user profile
    const userProfile = {
      id: `user_${Date.now()}`,
      username: 'hardgainer',
      firstName: 'User',
      name: 'User',
      startWeight: calibrationData[0]?.weight || avgWeight,
      currentWeight: avgWeight,
      weight: avgWeight,
      goalWeight: avgWeight + 10, // Default 10kg goal
      age: 25,
      height: 175,
      sex: 'male' as const,
      gender: 'male',
      activityLevel: calibrationData[0]?.activityLevel || 'moderate',
      tdee: estimatedTDEE,
      calorieGoal: estimatedTDEE + 500, // 500 calorie surplus
      phase: 'tracking' as const,
      createdAt: new Date().toISOString(),
      dietaryPreferences: [],
    };

    setUser(userProfile);
    completeOnboarding();

    // Clear calibration data
    localStorage.removeItem('calibration_data');
    localStorage.removeItem('calibration_day');
    localStorage.removeItem('calibration_step');
  };

  const getUserData = () => {
    if (calibrationData.length === 0) {
      return {
        startWeight: 70,
        avgCalories: 2500,
        estimatedTDEE: 3500
      };
    }

    const startWeight = calibrationData[0]?.weight || 70;
    const avgCalories = calibrationData.reduce((sum, day) => sum + day.calories, 0) / calibrationData.length;
    const estimatedTDEE = Math.round(avgCalories * 1.4);

    return {
      startWeight,
      avgCalories,
      estimatedTDEE
    };
  };

  switch (currentStep) {
    case 'splash':
      return <SplashScreen onBeginCalibration={handleBeginCalibration} />;
    
    case 'intro':
      return <AICoachIntro onComplete={handleIntroComplete} />;
    
    case 'calibration':
      return (
        <CalibrationDay
          day={currentDay}
          onComplete={handleDayComplete}
          existingData={calibrationData[currentDay - 1]}
        />
      );
    
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