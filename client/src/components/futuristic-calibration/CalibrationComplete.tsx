import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CalibrationCompleteProps {
  onActivateProtocol: () => void;
  userData: {
    startWeight: number;
    avgCalories: number;
    estimatedTDEE: number;
  };
}

export function CalibrationComplete({ onActivateProtocol, userData }: CalibrationCompleteProps) {
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showBodyTransformation, setShowBodyTransformation] = useState(false);

  useEffect(() => {
    // Unlock animation sequence
    const progressTimer = setInterval(() => {
      setUnlockProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => setShowResults(true), 500);
          setTimeout(() => setShowBodyTransformation(true), 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(progressTimer);
  }, []);

  const projectedWeight = userData.startWeight + 8; // Projected 8kg gain
  const recommendedSurplus = Math.max(500, userData.estimatedTDEE * 0.15);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Success particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            animate={{
              y: [window.innerHeight, -50],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent mb-4">
            CALIBRATION COMPLETE
          </h1>
          <p className="text-white text-xl">
            Your body signature has been decoded.
          </p>
        </motion.div>

        {/* Unlock Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: unlockProgress < 100 ? 1 : 0 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="bg-slate-800/70 rounded-2xl p-6 border border-emerald-500/30">
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">🔓</div>
              <p className="text-white font-medium">Unlocking Personal Protocol</p>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"
                style={{ width: `${unlockProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-slate-400">
              <span>Processing...</span>
              <span>{unlockProgress}%</span>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="max-w-lg mx-auto mb-8"
          >
            <div className="bg-gradient-to-r from-emerald-900/50 to-purple-900/50 rounded-2xl p-6 border border-emerald-500/30">
              <h3 className="text-white font-bold text-xl mb-6 text-center">
                🧬 Your Personal Growth Protocol
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {userData.estimatedTDEE.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">Daily TDEE</div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    +{Math.round(recommendedSurplus)}
                  </div>
                  <div className="text-sm text-slate-300">Surplus Needed</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <h4 className="text-emerald-400 font-semibold mb-2">🎯 Target Calories</h4>
                <div className="text-3xl font-bold text-white text-center">
                  {(userData.estimatedTDEE + recommendedSurplus).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400 text-center mt-1">
                  kcal/day for optimal growth
                </div>
              </div>

              <div className="text-center">
                <p className="text-emerald-400 font-medium">
                  🚀 Projected 90-Day Result
                </p>
                <p className="text-white text-lg">
                  {userData.startWeight}kg → {projectedWeight}kg
                </p>
                <p className="text-sm text-slate-400">
                  +{(projectedWeight - userData.startWeight).toFixed(1)}kg lean muscle gain
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Body Transformation Visual */}
        {showBodyTransformation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-sm mx-auto mb-8"
          >
            <div className="bg-slate-800/70 rounded-2xl p-6 border border-purple-500/30">
              <h4 className="text-white font-bold text-center mb-4">
                Body Transformation Preview
              </h4>
              
              <div className="flex justify-center space-x-12 mb-4">
                {/* Before */}
                <div className="text-center">
                  <motion.div
                    className="w-16 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full mb-2 relative mx-auto"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute inset-2 bg-slate-500 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-slate-600 rounded-full"></div>
                  </motion.div>
                  <p className="text-xs text-slate-400">Before</p>
                  <p className="text-sm font-bold text-white">{userData.startWeight}kg</p>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center">
                  <motion.div
                    animate={{ x: [0, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-emerald-400 text-2xl"
                  >
                    →
                  </motion.div>
                </div>
                
                {/* After */}
                <div className="text-center">
                  <motion.div
                    className="w-20 h-28 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-full mb-2 relative mx-auto"
                    whileHover={{ scale: 1.05 }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="absolute inset-2 bg-emerald-500 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-12 bg-emerald-600 rounded-full"></div>
                  </motion.div>
                  <p className="text-xs text-emerald-400">After 90 Days</p>
                  <p className="text-sm font-bold text-white">{projectedWeight}kg</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-emerald-400 text-sm font-medium">
                  Breaking the hardgainer curse.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activation Button */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <Button
              onClick={onActivateProtocol}
              className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative">🚀 Activate Protocol</span>
            </Button>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-slate-400 text-sm mt-4 max-w-md mx-auto"
            >
              Your personalized meal plans, workouts, and growth strategy are ready.
              <br />
              <span className="text-emerald-400">The hardgainer curse ends now.</span>
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}