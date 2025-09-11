import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, User, Activity, Target, Utensils } from 'lucide-react';

interface UserBasicData {
  firstName: string;
  age: number;
  height: number;
  weight: number;
  sex: 'male' | 'female';
  activityLevel: string;
  goalWeight: number;
}

interface InstantDataCollectionProps {
  onComplete: (data: UserBasicData) => void;
}

export function InstantDataCollection({ onComplete }: InstantDataCollectionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    height: '',
    weight: '',
    sex: '',
    activityDescription: '',
    goalWeight: '',
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
        !formData.weight || !formData.sex || !formData.goalWeight) {
      return;
    }

    const data: UserBasicData = {
      firstName: formData.firstName,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      sex: formData.sex as 'male' | 'female',
      activityLevel: formData.activityDescription || 'moderate',
      goalWeight: parseFloat(formData.goalWeight)
    };

    onComplete(data);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.age;
      case 2:
        return formData.sex && formData.height && formData.weight && formData.goalWeight;
      case 3:
        return true; // Activity description is optional
      case 4:
        return true; // Dietary preferences are optional
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-8 h-8 text-white" />;
      case 2: return <Activity className="w-8 h-8 text-white" />;
      case 3: return <Target className="w-8 h-8 text-white" />;
      case 4: return <Utensils className="w-8 h-8 text-white" />;
      default: return <User className="w-8 h-8 text-white" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Personal Info';
      case 2: return 'Body Stats';
      case 3: return 'Activity Level';
      case 4: return 'Diet Preferences';
      default: return 'Personal Info';
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
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Label className="text-emerald-400 text-sm font-medium">FIRST NAME</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg"
                  placeholder="Name Required"
                  data-testid="input-first-name"
                />
              </div>

              <div>
                <Label className="text-emerald-400 text-sm font-medium">AGE</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg"
                  placeholder="Biological Age Required"
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
                <Label className="text-emerald-400 text-sm font-medium">BIOLOGICAL SEX</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                  <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg" data-testid="select-sex">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-emerald-400 text-sm font-medium">HEIGHT (CM)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg"
                  placeholder="Height Required"
                  data-testid="input-height"
                />
              </div>

              <div>
                <Label className="text-emerald-400 text-sm font-medium">CURRENT WEIGHT (KG)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg"
                  placeholder="Current Weight (kg)"
                  data-testid="input-weight"
                />
              </div>

              <div>
                <Label className="text-emerald-400 text-sm font-medium">GOAL WEIGHT (KG)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, goalWeight: e.target.value }))}
                  className="mt-2 bg-slate-800 border-slate-600 text-white h-14 rounded-xl text-lg"
                  placeholder="Goal Weight"
                  data-testid="input-goal-weight"
                />
              </div>

              {formData.weight && formData.goalWeight && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30"
                >
                  <p className="text-emerald-400 font-medium text-center">
                    Target gain: +{(parseFloat(formData.goalWeight) - parseFloat(formData.weight)).toFixed(1)}kg
                  </p>
                  <p className="text-slate-400 text-sm text-center mt-1">
                    Optimal for hardgainer protocol
                  </p>
                </motion.div>
              )}
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
            <div>
              <Label className="text-emerald-400 text-sm font-medium">ACTIVITY PROFILE DESCRIPTION</Label>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                Describe your daily routine for precise AI metabolic analysis
              </p>
              <Textarea
                value={formData.activityDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, activityDescription: e.target.value }))}
                className="mt-2 bg-slate-800 border-slate-600 text-white rounded-xl min-h-[120px] text-sm resize-none"
                placeholder="Example: I work 8 hours at a grocery store taking 15k-20k steps daily, then do 1 hour hypertrophy training 4x per week. On weekends I'm mostly sedentary but do light household activities."
                data-testid="textarea-activity"
              />
            </div>
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
            <div>
              <Label className="text-emerald-400 text-sm font-medium mb-3 block">DIETARY PARAMETERS (OPTIONAL)</Label>
              <p className="text-slate-400 text-sm mb-4">
                Configure nutritional processing constraints for AI meal optimization
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => toggleDietaryPreference(option)}
                    className={`flex items-center p-3 rounded-xl border transition-all text-left ${
                      formData.dietaryPreferences.includes(option)
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`option-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.dietaryPreferences.includes(option)
                        ? 'border-emerald-400 bg-emerald-400'
                        : 'border-slate-500'
                    }`}>
                      {formData.dietaryPreferences.includes(option) && (
                        <div className="w-2 h-2 bg-black rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-purple-900 relative overflow-x-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      <div className="relative z-10 px-4 py-8 min-h-screen flex flex-col justify-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* AI Brain Icon */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-emerald-400/50"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <motion.h1 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            PROFILE SETUP
          </motion.h1>
          
          <motion.h2 
            className="text-xl text-white font-semibold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ENTER YOUR BODY DATA
          </motion.h2>
          
          <motion.p 
            className="text-slate-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            AI analyzing your metabolism for personalized recommendations
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>CALIBRATION PROGRESS</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Form Container */}
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          {/* Biometric Initialization Header */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-2xl p-6 border border-emerald-500/30 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">BODY DATA SETUP</h3>
                <p className="text-emerald-400 text-sm">● Alt klart for din plan!</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Advanced AI algorithms require precise biometric data to construct your unique metabolic profile
            </p>
          </div>

          {/* Step Content */}
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-700 min-h-[400px] flex flex-col">
            {/* Step Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {getStepIcon(currentStep)}
              </div>
              <h4 className="text-emerald-400 font-bold text-lg mb-2 flex items-center justify-center">
                <span className="bg-emerald-500 text-black px-3 py-1 rounded-full text-sm mr-3">
                  {String(currentStep).padStart(2, '0')}
                </span>
                {getStepTitle(currentStep)}
              </h4>
            </div>

            {/* Step Form Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-12 px-6"
              data-testid="button-back"
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black font-bold h-12 px-6"
              data-testid="button-next"
            >
              {currentStep === totalSteps ? 'START YOUR PLAN' : 'Next'}
            </Button>
          </div>

          {/* Bottom Icon */}
          <div className="flex justify-center mt-6">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}