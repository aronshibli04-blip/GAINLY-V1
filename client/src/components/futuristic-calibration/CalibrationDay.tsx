import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalibrationDayProps {
  day: number;
  onComplete: (data: CalibrationData) => void;
  existingData?: CalibrationData;
}

interface CalibrationData {
  weight: number;
  calories: number;
  activityLevel: string;
  sleep?: number;
}

export function CalibrationDay({ day, onComplete, existingData }: CalibrationDayProps) {
  const [data, setData] = useState<CalibrationData>({
    weight: existingData?.weight || 0,
    calories: existingData?.calories || 0,
    activityLevel: existingData?.activityLevel || '',
    sleep: existingData?.sleep || 8,
  });

  const [showBodyPreview, setShowBodyPreview] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const progressPercentage = Math.round((day / 7) * 100);

  useEffect(() => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowBodyPreview(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (data.weight && data.calories && data.activityLevel) {
      onComplete(data);
    }
  };

  const getDayMessage = () => {
    switch (day) {
      case 1:
        return {
          title: "Day 1: Initial Body Scan",
          subtitle: "Establishing your metabolic baseline",
          aiMessage: "Excellent. Your body signature is being recorded. I can already detect unique hardgainer patterns."
        };
      case 2:
        return {
          title: "Day 2: Metabolic Analysis",
          subtitle: "Analyzing your energy expenditure patterns",
          aiMessage: `${progressPercentage}% calibrated. Your metabolism is ${data.calories > 2500 ? 'extremely fast' : 'moderately fast'} - exactly what I expected.`
        };
      case 7:
        return {
          title: "Day 7: Final Calibration",
          subtitle: "Completing your Personal Protocol",
          aiMessage: "Perfect. Calibration complete. Your body's growth formula is now unlocked."
        };
      default:
        return {
          title: `Day ${day}: Continuous Monitoring`,
          subtitle: "Refining your metabolic profile",
          aiMessage: `Day ${day} of calibration complete. The data reveals you're burning ~${Math.round(data.calories * 1.4)} kcal/day.`
        };
    }
  };

  const { title, subtitle, aiMessage } = getDayMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Scanning effect */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
          animate={{
            top: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-emerald-400 text-lg">{subtitle}</p>
          
          {/* Progress bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Calibration Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Body preview section */}
        {showBodyPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="max-w-sm mx-auto bg-slate-800/50 rounded-2xl p-6 border border-emerald-500/30">
              <h3 className="text-white font-bold text-center mb-4">
                Body Scan Analysis
              </h3>
              <div className="flex justify-center space-x-8 mb-4">
                {/* Before silhouette */}
                <div className="text-center">
                  <div className="w-16 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full mb-2 relative">
                    <div className="absolute inset-2 bg-slate-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-slate-400">Current</p>
                </div>
                
                <div className="flex items-center">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-emerald-400"
                  >
                    →
                  </motion.div>
                </div>
                
                {/* After silhouette */}
                <div className="text-center">
                  <div className="w-20 h-24 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-full mb-2 relative">
                    <div className="absolute inset-2 bg-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-emerald-400">90 Days</p>
                </div>
              </div>
              <p className="text-center text-sm text-slate-300">
                Projected Muscle Growth: +{Math.round(data.weight * 0.15)}kg
              </p>
            </div>
          </motion.div>
        )}

        {/* Data entry form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <div className="space-y-6">
              <div>
                <Label htmlFor="weight" className="text-white font-medium">
                  Current Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ''}
                  onChange={(e) => setData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="70.5"
                />
              </div>

              <div>
                <Label htmlFor="calories" className="text-white font-medium">
                  Calories Eaten Today
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={data.calories || ''}
                  onChange={(e) => setData(prev => ({ ...prev, calories: parseInt(e.target.value) }))}
                  className="mt-2 bg-slate-700 border-slate-600 text-white"
                  placeholder="2500"
                />
              </div>

              <div>
                <Label className="text-white font-medium">Activity Level</Label>
                <Select value={data.activityLevel} onValueChange={(value) => setData(prev => ({ ...prev, activityLevel: value }))}>
                  <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                    <SelectItem value="light">Light activity</SelectItem>
                    <SelectItem value="moderate">Moderate activity</SelectItem>
                    <SelectItem value="very">Very active</SelectItem>
                    <SelectItem value="extreme">Extremely active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {day > 1 && (
                <div>
                  <Label htmlFor="sleep" className="text-white font-medium">
                    Hours of Sleep
                  </Label>
                  <Input
                    id="sleep"
                    type="number"
                    value={data.sleep || ''}
                    onChange={(e) => setData(prev => ({ ...prev, sleep: parseInt(e.target.value) }))}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                    placeholder="8"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!data.weight || !data.calories || !data.activityLevel}
              className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300"
            >
              {day === 7 ? 'Complete Calibration' : 'Log Day ' + day}
            </Button>
          </div>
        </motion.div>

        {/* AI Message */}
        {data.weight && data.calories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <p className="text-emerald-400 font-medium text-sm">AI Coach Analysis</p>
                  <p className="text-white text-sm mt-1">{aiMessage}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scanning progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scanProgress < 100 ? 1 : 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-slate-800/90 rounded-full px-4 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Scanning... {scanProgress}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}