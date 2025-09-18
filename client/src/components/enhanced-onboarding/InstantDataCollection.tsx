import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BodyFatSelector } from '@/components/ui/body-fat-selector';
import { FFMIGoalSelector } from '@/components/ui/ffmi-goal-selector';
import { TrendingUp, User, Activity, Target, Utensils, Zap } from 'lucide-react';

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

interface InstantDataCollectionProps {
  onComplete: (data: UserBasicData) => void;
}

export function InstantDataCollection({ onComplete }: InstantDataCollectionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Updated to include body fat and FFMI goal steps
  
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    height: '',
    weight: '',
    sex: '',
    activityDescription: '',
    bodyFatPercentage: null as number | null,
    targetFFMI: null as number | null,
    calculatedTargetWeight: null as number | null,
    timelineMonths: null as number | null,
    dietaryPreferences: [] as string[],
  });

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Nut-Free', 'Shellfish-Free', 'Low-Sodium', 'Kosher', 'Halal'
  ];

  const toggleDietaryPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.age || !formData.height || 
        !formData.weight || !formData.sex || !formData.bodyFatPercentage ||
        !formData.targetFFMI || !formData.calculatedTargetWeight) {
      return;
    }

    const data: UserBasicData = {
      firstName: formData.firstName,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      sex: formData.sex as 'male' | 'female',
      activityLevel: formData.activityDescription || 'moderate',
      bodyFatPercentage: formData.bodyFatPercentage,
      targetFFMI: formData.targetFFMI,
      calculatedTargetWeight: formData.calculatedTargetWeight,
      timelineMonths: formData.timelineMonths || 12
    };

    onComplete(data);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.age;
      case 2:
        return formData.sex && formData.height && formData.weight;
      case 3:
        return formData.bodyFatPercentage !== null;
      case 4:
        return formData.targetFFMI !== null && formData.calculatedTargetWeight !== null;
      case 5:
        return true; // Activity description and dietary preferences are optional
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-8 h-8 text-white" />;
      case 2: return <Activity className="w-8 h-8 text-white" />;
      case 3: return <TrendingUp className="w-8 h-8 text-white" />;
      case 4: return <Target className="w-8 h-8 text-white" />;
      case 5: return <Utensils className="w-8 h-8 text-white" />;
      default: return <User className="w-8 h-8 text-white" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Personal Info";
      case 2: return "Body Stats";
      case 3: return "Body Composition";
      case 4: return "Fitness Goals";
      case 5: return "Preferences";
      default: return "Setup";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Tell us about yourself';
      case 2: return 'Your current measurements';
      case 3: return 'Your body fat percentage';
      case 4: return 'Set your fitness goal scientifically';
      case 5: return 'Activity level and preferences';
      default: return 'Setup';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col justify-center h-full"
          >
            {/* Motiverende tekst */}
            <div className="text-center mb-8">
              <h3 className="text-white text-xl font-bold mb-2">
                La oss komme i gang med din transformasjon
              </h3>
              <p className="text-slate-400 text-sm">
                Dette tar bare 30 sekunder
              </p>
            </div>

            {/* Input felter */}
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">FIRST NAME</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-2 bg-slate-800/80 border-slate-600 text-white h-12 rounded-lg text-base focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]"
                  placeholder="Your name"
                  data-testid="input-first-name"
                />
              </div>

              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">AGE</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-2 bg-slate-800/80 border-slate-600 text-white h-12 rounded-lg text-base focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]"
                  placeholder="25"
                  data-testid="input-age"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">BIOLOGICAL SEX</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                  <SelectTrigger className="mt-2 bg-slate-800/80 border-slate-600 text-white h-12 rounded-lg text-base focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]" data-testid="select-sex">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">HEIGHT (CM)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="mt-2 bg-slate-800/80 border-slate-600 text-white h-12 rounded-lg text-base focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]"
                  placeholder="175"
                  data-testid="input-height"
                />
              </div>

              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">CURRENT WEIGHT (KG)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="mt-2 bg-slate-800/80 border-slate-600 text-white h-12 rounded-lg text-base focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]"
                  placeholder="70.0"
                  data-testid="input-weight"
                />
              </div>

              <div className="bg-[#00F5FF]/10 rounded-xl border border-[#00F5FF]/20 p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-[#00F5FF]" />
                    <span className="text-[#00F5FF] font-medium">Scientific Goal Setting</span>
                  </div>
                  <p className="text-sm text-white/70">
                    We'll calculate your optimal target weight scientifically in the next steps 
                    based on your body composition and FFMI goals!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <BodyFatSelector
              gender={formData.sex as 'male' | 'female'}
              selectedPercentage={formData.bodyFatPercentage}
              onSelect={(percentage) => setFormData(prev => ({ 
                ...prev, 
                bodyFatPercentage: percentage 
              }))}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {formData.weight && formData.height && formData.bodyFatPercentage && formData.sex ? (
              <FFMIGoalSelector
                currentWeight={parseFloat(formData.weight)}
                height={parseFloat(formData.height)}
                bodyFatPercentage={formData.bodyFatPercentage}
                age={parseInt(formData.age) || 25}
                gender={formData.sex as 'male' | 'female'}
                selectedFFMI={formData.targetFFMI || undefined}
                selectedTargetWeight={formData.calculatedTargetWeight || undefined}
                onGoalSelect={(ffmi, targetWeight, timeline) => setFormData(prev => ({
                  ...prev,
                  targetFFMI: ffmi,
                  calculatedTargetWeight: targetWeight,
                  timelineMonths: timeline
                }))}
              />
            ) : (
              <div className="text-center p-6 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-amber-400">Please complete the previous steps first</p>
              </div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-3"
          >
            <div className="space-y-3">
              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide">ACTIVITY PROFILE DESCRIPTION</Label>
                <p className="text-slate-400 text-sm mt-1 mb-2">
                  Describe your daily routine for precise AI metabolic analysis
                </p>
                <Textarea
                  value={formData.activityDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityDescription: e.target.value }))}
                  className="mt-2 bg-slate-800/80 border-slate-600 text-white rounded-lg h-16 text-sm resize-none focus:border-[#00F5FF] focus:ring-1 focus:ring-[#00F5FF]"
                  placeholder="Example: I work 8 hours at a grocery store taking 15k-20k steps daily, then do 1 hour hypertrophy training 4x per week."
                  data-testid="textarea-activity"
                />
              </div>
              
              <div>
                <Label className="text-white text-sm font-bold uppercase tracking-wide mb-2 block">DIETARY PREFERENCES (OPTIONAL)</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {dietaryOptions.map((option) => (
                    <motion.button
                      key={option}
                      type="button"
                      onClick={() => toggleDietaryPreference(option)}
                      className={`flex items-center py-1.5 px-2 rounded-lg border transition-all text-left ${
                        formData.dietaryPreferences.includes(option)
                          ? 'border-[#00F5FF] bg-[#00F5FF]/20 text-[#00F5FF]'
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      data-testid={`option-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 mr-2 ${
                        formData.dietaryPreferences.includes(option)
                          ? 'border-[#00F5FF] bg-[#00F5FF]'
                          : 'border-slate-500'
                      }`}>
                        {formData.dietaryPreferences.includes(option) && (
                          <div className="w-1 h-1 bg-black rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="text-xs font-medium truncate">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-dvh min-h-0 bg-[#0F0F10] relative">
      {/* Thin progress bar at very top */}
      <div className="w-full bg-slate-800 h-1">
        <motion.div
          className="h-full bg-[#00F5FF]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="px-6 py-4 max-w-md mx-auto flex-1 min-h-0 flex flex-col">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            GAINLY
          </h1>
          <p className="text-[#00F5FF] text-sm font-medium">
            Profile Setup ({Math.round((currentStep / totalSteps) * 100)}% Complete)
          </p>
        </div>

        {/* Glassmorphism Card Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 flex-1 min-h-0 flex flex-col h-full">
          {/* Step Header - Compact */}
          <div className="flex items-center mb-4">
            <span className="bg-[#00F5FF] text-black px-3 py-1 rounded-full text-sm font-bold mr-3">
              {String(currentStep).padStart(2, '0')}
            </span>
            <h2 className="text-white font-bold text-lg">
              {getStepTitle(currentStep)}
            </h2>
          </div>

          {/* Step Form Content - No excessive spacing */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation - Modern Buttons */}
          <div className="flex justify-between mt-4 pt-4 border-t border-slate-700/50">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-11 px-6 rounded-xl"
              data-testid="button-back"
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-[#00F5FF] hover:bg-[#00F5FF]/90 text-black font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#00F5FF]/20"
              data-testid="button-next"
            >
              {currentStep === totalSteps ? 'START YOUR PLAN' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}