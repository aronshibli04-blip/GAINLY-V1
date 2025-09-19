import { useState } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { BodyPreview3D } from "./BodyPreview3D";
import { PremiumUpsell } from "./PremiumUpsell";
import { InstantDataCollection } from "../enhanced-onboarding/InstantDataCollection";
import { BasePlanPreview } from "../enhanced-onboarding/BasePlanPreview";
import { useUserStore } from "@/store/userStore";
import { mockSubscriptionService } from "@/utils/tiers";

// Preserve existing types
interface UserBasicData {
  firstName: string;
  age: number;
  height: number;
  weight: number;
  sex: 'male' | 'female';
  activityLevel: string;
  // FFMI-based goal system (replaces arbitrary goalWeight)
  bodyFatPercentage: number;
  targetFFMI: number;
  calculatedTargetWeight: number;
  timelineMonths: number;
}

interface BasePlan {
  bmr: number;
  tdee: number;
  caloriesForSurplus: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  trainingDays: number;
  estimatedWeeksToGoal: number;
  activityMultiplier: number;
  // Additional fields to match BasePlanPreview interface
  targetCalories: number;
  tdeeEstimate: number;
  surplus: number;
  projectedWeight: number;
  timeToGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

type FlowStep = 'welcome' | 'data_collection' | 'body_preview' | 'premium_upsell' | 'plan_preview' | 'complete';

export function EnhancedOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [userData, setUserData] = useState<UserBasicData | null>(null);
  const [basePlan, setBasePlan] = useState<BasePlan | null>(null);
  const { setUser, completeOnboarding, updatePhase, setTdeeAnalysis, subscription, upgradeSubscription, startTrial } = useUserStore();

  // Preserve existing AI analysis logic
  const analyzeActivityLevel = (activityDescription: string): number => {
    const description = activityDescription.toLowerCase();
    
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
    
    if (extremeActivityCount >= 1 || highActivityCount >= 3) {
      return 2.2;
    } else if (highActivityCount >= 2) {
      return 1.9;
    } else if (highActivityCount >= 1) {
      return 1.725;
    } else if (moderateActivityCount >= 1) {
      return 1.55;
    } else {
      return 1.375;
    }
  };

  // Preserve existing plan generation logic
  const generateBasePlan = (data: UserBasicData): BasePlan => {
    const activityMultiplier = analyzeActivityLevel(data.activityLevel);
    
    let bmr: number;
    if (data.sex === 'male') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    }
    
    const tdee = bmr * activityMultiplier;
    const caloriesForSurplus = Math.round(tdee + 1100);
    const proteinGrams = Math.round(data.weight * 2.2);
    const carbGrams = Math.round((caloriesForSurplus * 0.45) / 4);
    const fatGrams = Math.round((caloriesForSurplus * 0.25) / 9);
    
    const weightToGain = data.calculatedTargetWeight - data.weight;
    const estimatedWeeksToGoal = Math.ceil(weightToGain / 1);
    
    let trainingDays = 4;
    if (activityMultiplier >= 1.9) trainingDays = 6;
    else if (activityMultiplier >= 1.725) trainingDays = 5;
    
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      caloriesForSurplus,
      proteinGrams,
      carbGrams,
      fatGrams,
      trainingDays,
      estimatedWeeksToGoal,
      activityMultiplier,
      // Additional fields to match BasePlanPreview interface
      targetCalories: caloriesForSurplus,
      tdeeEstimate: Math.round(tdee),
      surplus: 1100,
      projectedWeight: data.calculatedTargetWeight,
      timeToGoal: estimatedWeeksToGoal,
      proteinTarget: proteinGrams,
      carbTarget: carbGrams,
      fatTarget: fatGrams,
    };
  };

  const handleStartTransformation = () => {
    setCurrentStep('data_collection');
  };

  const handleDataCollectionComplete = (data: UserBasicData) => {
    setUserData(data);
    const plan = generateBasePlan(data);
    setBasePlan(plan);
    setCurrentStep('body_preview');
  };

  const handleBodyPreviewContinue = () => {
    setCurrentStep('premium_upsell');
  };

  const handleUpgradeSubscription = (type: any) => {
    upgradeSubscription(type);
    setCurrentStep('plan_preview');
  };

  const handleContinueFree = () => {
    setCurrentStep('plan_preview');
  };

  const handlePlanComplete = () => {
    if (userData && basePlan) {
      // Set user data
      const user = {
        id: 'user1',
        firstName: userData.firstName,
        age: userData.age,
        height: userData.height,
        weight: userData.weight,
        goalWeight: userData.calculatedTargetWeight,
        sex: userData.sex,
        activityLevel: userData.activityLevel,
        username: userData.firstName.toLowerCase(),
        createdAt: new Date().toISOString(),
        password: '',
        hasCompletedCalibration: true, // Skip calibration since we have AI analysis
      };
      
      setUser(user);
      
      // Set TDEE analysis (match TdeeAnalysis interface)
      const analysis = {
        id: Date.now().toString(),
        userId: user.id,
        tdee: basePlan.tdee,
        surplus: 1100,
        confidence: 0.9, // high confidence as number
        weekNumber: 1,
        targetCalories: basePlan.caloriesForSurplus,
        dataPoints: 7,
        createdAt: new Date().toISOString(),
      };
      
      setTdeeAnalysis(analysis);
      completeOnboarding();
    }
  };

  const handleShowUpgrade = () => {
    setCurrentStep('premium_upsell');
  };

  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen onStartTransformation={handleStartTransformation} />;
    
    case 'data_collection':
      return <InstantDataCollection onComplete={handleDataCollectionComplete} />;
    
    case 'body_preview':
      if (!userData) return null;
      return (
        <BodyPreview3D
          userData={userData}
          subscription={subscription}
          onContinue={handleBodyPreviewContinue}
          onUpgrade={handleShowUpgrade}
        />
      );
    
    case 'premium_upsell':
      return (
        <PremiumUpsell
          onUpgrade={handleUpgradeSubscription}
          onContinueFree={handleContinueFree}
        />
      );
    
    case 'plan_preview':
      if (!userData || !basePlan) return null;
      return (
        <BasePlanPreview
          userData={userData}
          basePlan={basePlan}
          onStartApp={handlePlanComplete}
        />
      );
    
    default:
      return null;
  }
}