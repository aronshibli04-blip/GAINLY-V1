import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onBeginCalibration: () => void;
}

export function SplashScreen({ onBeginCalibration }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full opacity-30"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${(i * 5.26) % 100}%`,
              top: `${(i * 7.89) % 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {showContent && (
          <>
            {/* Logo with glow effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="mb-8"
            >
              <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                GAINLY
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-emerald-400 to-purple-400 mx-auto rounded-full"></div>
            </motion.div>

            {/* Futuristic motto */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-12 max-w-lg"
            >
              <p className="text-xl text-slate-300 mb-2 font-light tracking-wide">
                Gain weight fast with
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
                INNOVATIVE TECHNOLOGY
              </p>
              <p className="text-lg text-slate-400 font-light">
                Making the impossible, possible —
                <br />
                <span className="text-emerald-400 font-medium">especially for hardgainers</span>
              </p>
            </motion.div>

            {/* Holographic preview placeholder */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mb-8 relative"
            >
              <div className="w-48 h-48 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 rounded-full animate-ping"></div>
                <div className="absolute inset-8 flex items-center justify-center">
                  <div className="text-6xl">🚀</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                AI Body Transformation Protocol v2.125
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              onClick={onBeginCalibration}
              className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative">Begin Calibration</span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-sm text-slate-500 mt-6 max-w-md"
            >
              Your personalized growth protocol awaits.
              <br />
              Prepare for 7 days of advanced body scanning.
            </motion.p>
          </>
        )}
      </div>

      {/* Scanning lines effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
      </motion.div>
    </div>
  );
}