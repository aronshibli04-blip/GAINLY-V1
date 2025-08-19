import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Trophy, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to GAINLY",
      icon: <Zap className="h-12 w-12 text-emerald-400" />,
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-white/90">
            The AI-powered fitness app designed specifically for hardgainers
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-emerald-900/30 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm text-emerald-300">Smart Weight Tracking</p>
            </div>
            <div className="bg-purple-900/30 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-400 mb-2" />
              <p className="text-sm text-purple-300">AI Meal Planning</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Track Your Progress",
      icon: <Target className="h-12 w-12 text-blue-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Log your weight daily and track calories to get accurate TDEE calculations
          </p>
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400/30">
            <h4 className="font-semibold text-blue-300 mb-2">What you'll track:</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Daily weight measurements</li>
              <li>• Meal calories and nutrition</li>
              <li>• Activity levels</li>
              <li>• Progress photos</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Build Daily Routines",
      icon: <CheckCircle2 className="h-12 w-12 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Create habits that support your weight gain goals with our gamified routine system
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-purple-900/20 p-3 rounded-lg">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
                +25 XP
              </Badge>
              <span className="text-white/80">Complete daily nutrition goals</span>
            </div>
            <div className="flex items-center gap-3 bg-purple-900/20 p-3 rounded-lg">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                +30 XP
              </Badge>
              <span className="text-white/80">Log meals consistently</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI-Powered Features",
      icon: <Sparkles className="h-12 w-12 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-white/90">
            Unlock powerful AI features to accelerate your weight gain journey
          </p>
          <div className="grid gap-3">
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-400/30">
              <h4 className="font-semibold text-yellow-300 mb-2">📷 Photo Nutrition Scanning</h4>
              <p className="text-sm text-white/70">
                Take photos of nutrition labels for instant meal logging
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-400/30">
              <h4 className="font-semibold text-green-300 mb-2">🤖 Personalized Meal Plans</h4>
              <p className="text-sm text-white/70">
                AI generates meal plans based on your TDEE and preferences
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/95 border-emerald-400/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="border-emerald-400/30 text-emerald-400">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <span className="text-xs text-white/50">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          
          <CardTitle className="text-xl text-white">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={currentStep < steps.length - 1 ? 
                () => setCurrentStep(currentStep + 1) : 
                onComplete
              }
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}