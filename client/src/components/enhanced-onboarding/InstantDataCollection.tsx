import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Scale, Target, Zap } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    height: '',
    weight: '',
    sex: '',
    activityLevel: '',
    goalWeight: '',
    dietaryPreferences: [] as string[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const restrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Shellfish-Free', 'Low-Sodium', 'Kosher', 'Halal'
  ];

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
    // Validate required fields
    if (!formData.firstName || !formData.age || !formData.height || 
        !formData.weight || !formData.sex || !formData.activityLevel || 
        !formData.goalWeight) {
      return;
    }

    const data: UserBasicData = {
      firstName: formData.firstName,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      sex: formData.sex as 'male' | 'female',
      activityLevel: formData.activityLevel,
      goalWeight: parseFloat(formData.goalWeight)
    };

    onComplete(data);
  };

  const toggleDietaryPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.age && formData.sex;
      case 2:
        return formData.height && formData.weight;
      case 3:
        return formData.activityLevel;
      case 4:
        return formData.goalWeight;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Personal Information</h3>
              <p className="text-slate-400">Let's start with the basics</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-white font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="age" className="text-white font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="25"
                />
              </div>

              <div>
                <Label className="text-white font-medium">Sex</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                  <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Body Measurements</h3>
              <p className="text-slate-400">Current physical stats</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="height" className="text-white font-medium">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="175"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-white font-medium">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="70.5"
                />
              </div>
            </div>

            {formData.height && formData.weight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30"
              >
                <p className="text-emerald-400 font-medium text-center">
                  BMI: {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                </p>
                <p className="text-slate-400 text-sm text-center mt-1">
                  Perfect for the hardgainer protocol
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Activity Level</h3>
              <p className="text-slate-400">How active are you daily?</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
                { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { value: 'very', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                { value: 'extreme', label: 'Extremely Active', desc: 'Physical job + exercise' },
              ].map((activity) => (
                <motion.button
                  key={activity.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, activityLevel: activity.value }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.activityLevel === activity.value
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-white">{activity.label}</div>
                  <div className="text-sm text-slate-400 mt-1">{activity.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Goals & Preferences</h3>
              <p className="text-slate-400">What's your target?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="goalWeight" className="text-white font-medium">Goal Weight (kg)</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  step="0.1"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, goalWeight: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="80"
                />
                {formData.weight && formData.goalWeight && (
                  <p className="text-emerald-400 text-sm mt-2">
                    Target gain: +{(parseFloat(formData.goalWeight) - parseFloat(formData.weight)).toFixed(1)}kg
                  </p>
                )}
              </div>

              <div>
                <Label className="text-white font-medium mb-3 block">Dietary Preferences (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {restrictions.map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={formData.dietaryPreferences.includes(restriction)}
                        onCheckedChange={() => toggleDietaryPreference(restriction)}
                      />
                      <Label htmlFor={restriction} className="text-sm text-slate-300 cursor-pointer">
                        {restriction}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.dietaryPreferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.dietaryPreferences.map((pref) => (
                      <Badge key={pref} variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${(i * 10) % 100}%`,
              top: `${(i * 15) % 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Initialize Protocol
          </h1>
          <p className="text-slate-400">AI needs your baseline data to design your Personal Growth Protocol</p>
        </motion.div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-700 min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold"
            >
              {currentStep === totalSteps ? 'Generate My Plan' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}