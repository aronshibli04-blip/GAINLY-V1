import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Eye, Zap, Lock, ArrowRight } from "lucide-react";
import { getFeatureAccess, SubscriptionStatus } from "@/utils/tiers";

interface BodyPreview3DProps {
  userData: {
    height: number;
    weight: number;
    goalWeight: number;
    sex: 'male' | 'female';
  };
  subscription: SubscriptionStatus;
  onContinue: () => void;
  onUpgrade?: () => void;
}

export function BodyPreview3D({ userData, subscription, onContinue, onUpgrade }: BodyPreview3DProps) {
  const [currentView, setCurrentView] = useState<'current' | 'future'>('current');
  const [isLoading, setIsLoading] = useState(true);
  const features = getFeatureAccess(subscription);

  useEffect(() => {
    // Simulate 3D model loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const bmi = userData?.weight && userData?.height ? userData.weight / Math.pow(userData.height / 100, 2) : 0;
  const goalBmi = userData?.goalWeight && userData?.height ? userData.goalWeight / Math.pow(userData.height / 100, 2) : 0;
  const weightToGain = userData?.goalWeight && userData?.weight ? userData.goalWeight - userData.weight : 0;

  const getBodyType = (bmi: number) => {
    if (bmi < 18.5) return { type: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { type: "Normal", color: "text-green-400" };
    if (bmi < 30) return { type: "Overweight", color: "text-yellow-400" };
    return { type: "Obese", color: "text-red-400" };
  };

  const currentBodyType = getBodyType(bmi);
  const goalBodyType = getBodyType(goalBmi);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-4 overflow-hidden">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black mb-1"
        >
          {currentView === 'current' ? (
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Here's You Today
            </span>
          ) : (
            <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              The Future You
            </span>
          )}
        </motion.h1>
        
        {/* Integrated Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <Button
              variant={currentView === 'current' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('current')}
              className={`text-xs px-3 py-1 ${currentView === 'current' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            >
              Current
            </Button>
            <Button
              variant={currentView === 'future' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('future')}
              className={`text-xs px-3 py-1 ${currentView === 'future' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              Future
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 h-[calc(100%-120px)]">
        
        {/* TOP LEFT: Body Image */}
        <Card className="bg-slate-800/50 border-slate-700 w-full">
          <CardContent className="p-3 h-full">
            <div className="relative w-full h-full bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-lg border border-slate-600 overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Compact Body Silhouette */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div 
                        className={`w-16 h-20 rounded-full ${
                          currentView === 'current' 
                            ? 'bg-gradient-to-b from-purple-400/40 to-purple-600/40' 
                            : features.realisticBodyPreview
                              ? 'bg-gradient-to-b from-emerald-400/40 to-emerald-600/40'
                              : 'bg-gradient-to-b from-slate-400/20 to-slate-600/20 blur-sm'
                        }`}
                        style={{
                          transform: currentView === 'future' ? 'scaleX(1.1) scaleY(1.05)' : 'scale(1)'
                        }}
                      />

                      {/* Premium overlay */}
                      {currentView === 'future' && !features.realisticBodyPreview && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                          <Lock className="h-4 w-4 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic stats overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/60 backdrop-blur-sm rounded p-2">
                      <div className="text-center">
                        <p className="text-white text-sm font-bold">
                          {currentView === 'current' ? `${userData?.weight || 0}kg` : `${userData?.goalWeight || 0}kg`}
                        </p>
                        <p className="text-xs text-slate-400">
                          BMI {currentView === 'current' ? bmi.toFixed(1) : goalBmi.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TOP RIGHT: Body Analysis */}
        <Card className="bg-slate-800/50 border-slate-700 w-full">
          <CardContent className="p-3 h-full">
            <h3 className="text-sm font-bold mb-3 flex items-center text-purple-400">
              <Eye className="h-3 w-3 mr-1" />
              Analysis
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status</span>
                <Badge variant="outline" className={`text-xs px-2 py-0.5 ${currentView === 'current' ? currentBodyType.color : goalBodyType.color} border-current`}>
                  {currentView === 'current' ? currentBodyType.type : goalBodyType.type}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">To Gain</span>
                <span className="text-emerald-400 font-bold">+{weightToGain.toFixed(1)}kg</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Timeline</span>
                <span className="text-white font-bold">{Math.ceil(weightToGain / 0.5)}w</span>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-emerald-400 font-medium text-xs">Journey Phases:</p>
                <div className="text-xs text-slate-300">
                  <div className="flex items-center mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                    <span>Week 1-2: Calibration</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                    <span>Week 3-6: Growth</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                    <span>Week 7+: Transform</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM LEFT: Weight Progress */}
        <Card className="bg-slate-800/50 border-slate-700 w-full">
          <CardContent className="p-3 h-full">
            <h3 className="text-sm font-bold mb-3 text-emerald-400">Weight Progress</h3>
            
            <div className="space-y-3">
              <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs">Current</span>
                  <span className="text-slate-400 text-xs">Goal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-bold text-lg">{userData?.weight || 0}kg</span>
                  <span className="text-emerald-400 font-bold text-lg">{userData?.goalWeight || 0}kg</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: currentView === 'current' ? '0%' : '100%' }}
                ></div>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-400">Projected gain</p>
                <p className="text-emerald-400 font-bold">+{weightToGain.toFixed(1)}kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM RIGHT: Action Button */}
        <Card className="bg-slate-800/50 border-slate-700 w-full">
          <CardContent className="p-3 h-full flex flex-col justify-center">
            <Button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black font-bold text-sm mb-2"
              data-testid="continue-to-calibration"
            >
              {currentView === 'future' ? 'I Want This' : 'See My Future'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            {/* Premium upgrade - compact */}
            {currentView === 'future' && !features.realisticBodyPreview && onUpgrade && (
              <Button
                onClick={onUpgrade}
                variant="outline"
                size="sm"
                className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs"
                data-testid="upgrade-premium-button"
              >
                <Zap className="mr-1 h-3 w-3" />
                Premium
              </Button>
            )}
            
            <p className="text-xs text-slate-500 text-center mt-2">
              {currentView === 'current' 
                ? "Your starting point" 
                : "Your destination"}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}