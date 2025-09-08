import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star, Target, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onStartTransformation: () => void;
}

export function WelcomeScreen({ onStartTransformation }: WelcomeScreenProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStartTransformation();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <AnimatePresence mode="wait">
          {!isStarting ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl mx-auto"
            >
              {/* Logo Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center justify-center w-24 h-24 mb-8"
              >
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-spin" 
                     style={{ animationDuration: '15s' }} />
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center shadow-xl">
                  <Zap className="h-10 w-10 text-black" />
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-6xl font-black mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Welcome to the Future
                </span>
                <br />
                <span className="text-white">of Fitness</span>
              </motion.h1>

              {/* Motto */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl md:text-2xl text-emerald-300/80 mb-8 font-medium"
              >
                We make the impossible possible for hardgainers.
              </motion.p>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto"
              >
                <Card className="bg-white/5 border-emerald-400/20 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Star className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-300">AI-Powered Analysis</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-emerald-400/20 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Target className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-300">Personalized Plans</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-emerald-400/20 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-300">Real Results</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 group"
                  data-testid="start-transformation-button"
                >
                  Start My Transformation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-slate-400 mt-6"
              >
                Join thousands of hardgainers who've transformed their bodies
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="starting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-spin" />
                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center shadow-xl">
                  <Zap className="h-12 w-12 text-black animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Initializing Your Journey
                </span>
              </h2>
              
              <p className="text-emerald-300/80">
                Preparing your personalized transformation protocol...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}