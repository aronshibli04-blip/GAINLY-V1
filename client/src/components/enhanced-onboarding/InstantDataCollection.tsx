import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Brain, User, Scale, Target, Activity, Zap } from 'lucide-react';

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
    goalWeight: ''
  });

  const [showWelcome, setShowWelcome] = useState(true);

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal exercise' },
    { value: 'light', label: 'Lightly Active', desc: '1-3 days/week light exercise' },
    { value: 'moderate', label: 'Moderately Active', desc: '3-5 days/week exercise' },
    { value: 'very', label: 'Very Active', desc: '6-7 days/week intense exercise' },
    { value: 'extreme', label: 'Extremely Active', desc: 'Physical job + daily exercise' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const isFormValid = () => {
    return formData.firstName && formData.age && formData.height && 
           formData.weight && formData.sex && formData.activityLevel && 
           formData.goalWeight;
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl"
        >
          {/* AI Brain Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Brain className="w-12 h-12 text-white" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-emerald-400/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              GAINLY AI COACH
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Year 2125 • Hardgainer Protocol Activated
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-6 mb-8"
          >
            <p className="text-2xl text-white font-semibold">
              Welcome, Future Hardgainer
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">
              I'm your AI Coach from the future. In 60 seconds, I'll analyze your body data 
              and generate your <span className="text-emerald-400 font-semibold">Personal Growth Protocol</span>.
            </p>
            <p className="text-md text-slate-500">
              This is just the beginning. Each day you log data, I'll sharpen your protocol 
              to unlock your <span className="text-purple-400 font-bold">Impossible Growth Mode</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Button 
              onClick={() => setShowWelcome(false)}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
              data-testid="button-begin-protocol"
            >
              <Zap className="w-5 h-5 mr-2" />
              Initialize Protocol
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-slate-800/90 backdrop-blur border-slate-700">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Data Acquisition</h2>
            <p className="text-slate-400">AI requires baseline metrics for protocol generation</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                    placeholder="Your name"
                    data-testid="input-first-name"
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
                    data-testid="input-age"
                  />
                </div>
              </div>

              {/* Row 2: Physical Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height" className="text-white font-medium">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                    placeholder="175"
                    data-testid="input-height"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-white font-medium">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                    placeholder="70.0"
                    data-testid="input-weight"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">Sex</Label>
                  <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white" data-testid="select-sex">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Activity Level */}
              <div>
                <Label className="text-white font-medium mb-3 block">Activity Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activityOptions.map((activity) => (
                    <motion.button
                      key={activity.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, activityLevel: activity.value }))}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        formData.activityLevel === activity.value
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`button-activity-${activity.value}`}
                    >
                      <div className="font-medium text-white text-sm">{activity.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{activity.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Row 4: Goal Weight */}
              <div className="max-w-xs">
                <Label htmlFor="goalWeight" className="text-white font-medium">Goal Weight (kg)</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  step="0.1"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, goalWeight: e.target.value }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="85.0"
                  data-testid="input-goal-weight"
                />
                {formData.weight && formData.goalWeight && (
                  <p className="text-emerald-400 text-sm mt-2">
                    Target gain: +{(parseFloat(formData.goalWeight) - parseFloat(formData.weight)).toFixed(1)}kg
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-generate-protocol"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Generate My Protocol
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}