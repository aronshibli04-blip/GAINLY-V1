import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AICoachIntroProps {
  onComplete: () => void;
}

export function AICoachIntro({ onComplete }: AICoachIntroProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const messages = [
    {
      text: "Hi there! I'm your AI Coach, and I'm here to help you succeed.",
      subtext: "Getting to know your profile... Analysis complete.",
      delay: 2000
    },
    {
      text: "My goal is to help you gain weight faster and easier than ever before.",
      subtext: "Preparing your personalized recommendations...",
      delay: 3000
    },
    {
      text: "First, let's collect some data about you to create your personalized plan.",
      subtext: "Starting your 7-day data collection period.",
      delay: 2500
    }
  ];

  useEffect(() => {
    if (currentMessage < messages.length) {
      const timer = setTimeout(() => {
        setShowNext(true);
        setTimeout(() => {
          if (currentMessage === messages.length - 1) {
            onComplete();
          } else {
            setCurrentMessage(prev => prev + 1);
            setShowNext(false);
          }
        }, 1000);
      }, messages[currentMessage].delay);

      return () => clearTimeout(timer);
    }
  }, [currentMessage, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-emerald-400 font-mono text-xs"
            animate={{
              y: [-20, (window?.innerHeight ?? 800) + 20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              delay: i * 0.8,
            }}
            style={{
              left: `${(i * 6.67) % 100}%`,
            }}
          >
            {Array.from({ length: 20 }, () => 
              String.fromCharCode(0x30A0 + Math.random() * 96)
            ).join('')}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* AI Avatar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-12"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <div className="text-4xl">🤖</div>
              </div>
            </div>
            {/* Scanning rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Message Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed">
              {messages[currentMessage]?.text}
            </h2>
            <p className="text-emerald-400 text-lg font-medium">
              {messages[currentMessage]?.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="absolute bottom-20 flex space-x-3">
          {messages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentMessage ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
              animate={{
                scale: index === currentMessage ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: index === currentMessage ? Infinity : 0 }}
            />
          ))}
        </div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: currentMessage === 1 ? 1 : 0 }}
          className="absolute inset-x-0 bottom-40 mx-6"
        >
          <div className="bg-black/50 rounded-lg p-4 border border-blue-500/30">
            <div className="w-full h-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded flex items-center justify-center">
              <p className="text-blue-400 text-sm">
                🎬 AI Video Integration Point
              </p>
            </div>
            <p className="text-slate-400 text-xs mt-2 text-center">
              Replace with VEO3 AI introduction video
            </p>
          </div>
        </motion.div>

        {showNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="animate-bounce text-emerald-400">⬇</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}