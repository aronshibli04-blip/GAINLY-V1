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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-2"
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
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-300"
          >
            {currentView === 'current' 
              ? "This is your body preview. Together, we'll track your progress week by week."
              : "This is what's waiting for you at your goal weight. Every log, every meal, every rep brings you closer."}
          </motion.p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            <Button
              variant={currentView === 'current' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('current')}
              className={currentView === 'current' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Current Body
            </Button>
            <Button
              variant={currentView === 'future' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('future')}
              className={currentView === 'future' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              Future Body
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 3D Preview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="relative aspect-[3/4] bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600 overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400">Generating 3D model...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Placeholder 3D Model */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Basic body silhouette */}
                        <div 
                          className={`w-20 h-32 rounded-full ${
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
                        
                        {/* Premium overlay for future body */}
                        {currentView === 'future' && !features.realisticBodyPreview && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                            <div className="text-center">
                              <Lock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                              <p className="text-xs text-yellow-400 font-medium">Premium</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">Weight</p>
                            <p className="font-bold text-white">
                              {currentView === 'current' ? `${userData.weight}kg` : `${userData.goalWeight}kg`}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">BMI</p>
                            <p className={`font-bold ${currentView === 'current' ? currentBodyType.color : goalBodyType.color}`}>
                              {currentView === 'current' ? bmi.toFixed(1) : goalBmi.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Enhancement Notice */}
              {currentView === 'future' && !features.realisticBodyPreview && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center text-sm text-yellow-400">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Upgrade to Premium for realistic 3D visualization with muscle growth details</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats and Progress */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-400" />
                  Body Analysis
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Status</span>
                    <Badge variant="outline" className={`${currentBodyType.color} border-current`}>
                      {currentBodyType.type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Goal Status</span>
                    <Badge variant="outline" className={`${goalBodyType.color} border-current`}>
                      {goalBodyType.type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Weight to Gain</span>
                    <span className="text-emerald-400 font-bold">+{weightToGain.toFixed(1)}kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Est. Timeline</span>
                    <span className="text-white font-bold">{Math.ceil(weightToGain / 0.5)} weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transformation Timeline */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Your Journey Ahead</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                    <span className="text-sm">Week 1-2: Metabolism calibration</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                    <span className="text-sm">Week 3-6: Initial muscle growth</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                    <span className="text-sm">Week 7+: Visible transformation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onContinue}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black font-bold"
                data-testid="continue-to-calibration"
              >
                {currentView === 'future' ? 'I Want This' : 'See My Future'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {!features.realisticBodyPreview && onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  variant="outline"
                  size="lg"
                  className="w-full border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                  data-testid="upgrade-premium-button"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Unlock Premium Features
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}