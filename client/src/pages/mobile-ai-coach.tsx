import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { InteractiveAIChat } from "@/components/ui/interactive-ai-chat";
import { useMenu } from "@/components/ui/menu-context";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, TrendingUp, Target, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateTdee } from "@/utils/tdee";

export default function MobileAICoach() {
  const { toast } = useToast();
  const { openMenu } = useMenu();
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    weightEntries, 
    calorieEntries, 
    activityEntries,
    currentTdeeAnalysis,
    setTdeeAnalysis
  } = useUserStore();

  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );

  const handleGenerateAnalysis = () => {
    if (totalDays < 7) {
      toast({ 
        title: "Need more data", 
        description: "Track for at least 7 days to generate analysis",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Calculate TDEE analysis
    const calculation = calculateTdee(weightEntries, calorieEntries, "user1");
    
    const analysis = {
      id: Date.now().toString(),
      userId: "user1",
      tdee: calculation.tdee,
      surplus: calculation.surplus,
      targetCalories: calculation.targetCalories,
      confidence: calculation.confidence,
      dataPoints: Math.min(weightEntries.length, calorieEntries.length),
      weekNumber: Math.ceil(totalDays / 7),
      createdAt: new Date().toISOString(),
    };

    setTdeeAnalysis(analysis);
    setIsGenerating(false);
    
    toast({ 
      title: "Analysis complete!", 
      description: `Your TDEE is ${calculation.tdee} calories`
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-purple-400";
    if (confidence >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="AI Coach" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(45)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-spin" 
                 style={{ animationDuration: '15s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-xl">
              <Brain className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI COACH
            </span>
          </h1>
          <p className="text-purple-400/70">Intelligent metabolic analysis & guidance</p>
        </div>

        {/* Data Status */}
        <Card className="ai-coach-glow-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Data Collection</h3>
                <p className="text-sm text-muted-foreground">
                  {totalDays >= 7 ? "Ready for analysis" : `${totalDays}/7 days tracked`}
                </p>
              </div>
              <Badge 
                variant={totalDays >= 7 ? "default" : "outline"}
                className={totalDays >= 7 ? "grok-gradient text-black" : ""}
              >
                {totalDays >= 7 ? "Complete" : "In Progress"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Section */}
        {totalDays >= 7 && (
          <Card className="ai-coach-glow-hover">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-400" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentTdeeAnalysis ? (
                <Button 
                  onClick={handleGenerateAnalysis}
                  disabled={isGenerating}
                  className="w-full grok-gradient h-12"
                  data-testid="button-generate-analysis"
                >
                  <Zap className="h-5 w-5 mr-2 text-black" />
                  {isGenerating ? "Analyzing..." : "Generate TDEE Analysis"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/20">
                      <p className="text-xs text-muted-foreground">Calculated TDEE</p>
                      <p className="text-xl font-bold text-purple-400">
                        {currentTdeeAnalysis.tdee} kcal
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/20">
                      <p className="text-xs text-muted-foreground">Target Calories</p>
                      <p className="text-xl font-bold text-purple-400">
                        {currentTdeeAnalysis.targetCalories} kcal
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(currentTdeeAnalysis.confidence)}`}>
                        {getConfidenceLabel(currentTdeeAnalysis.confidence)}
                      </span>
                      <Badge variant="outline">
                        {Math.round(currentTdeeAnalysis.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerateAnalysis}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full"
                    data-testid="button-refresh-analysis"
                  >
                    Refresh Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Insights */}
        <Card className="ai-coach-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weightEntries.length >= 3 ? (
              <div className="p-3 rounded-lg bg-muted/20">
                <p className="text-sm text-white font-medium">Weight Trend</p>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const calculation = calculateTdee(weightEntries, calorieEntries, "user1");
                    const trend = calculation.weightTrend;
                    if (trend > 0.3) return "Great! You're gaining weight consistently 📈";
                    if (trend > 0.1) return "You're gaining weight slowly. Consider increasing calories 📊";
                    if (trend < -0.1) return "You're losing weight. Increase your calorie intake 📉";
                    return "Weight is stable. Time to add more calories for gains ⚖️";
                  })()}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/20">
                <p className="text-sm text-white font-medium">Getting Started</p>
                <p className="text-xs text-muted-foreground">
                  Track your weight for a few more days to see trends
                </p>
              </div>
            )}

            {calorieEntries.length >= 5 && (
              <div className="p-3 rounded-lg bg-muted/20">
                <p className="text-sm text-white font-medium">Calorie Consistency</p>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const dailyCalories = new Map<string, number>();
                    calorieEntries.forEach(entry => {
                      const existing = dailyCalories.get(entry.date) || 0;
                      dailyCalories.set(entry.date, existing + entry.calories);
                    });
                    const calories = Array.from(dailyCalories.values());
                    const avg = calories.reduce((sum, cal) => sum + cal, 0) / calories.length;
                    const variance = calories.reduce((sum, cal) => sum + Math.pow(cal - avg, 2), 0) / calories.length;
                    const stdDev = Math.sqrt(variance);
                    
                    if (stdDev > 500) return "Try to be more consistent with daily calorie intake 📊";
                    if (stdDev < 200) return "Great job maintaining consistent calorie intake! 🎯";
                    return "Your calorie intake is fairly consistent 👍";
                  })()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactive AI Chat */}
        <InteractiveAIChat 
          currentTdeeAnalysis={currentTdeeAnalysis}
          userProgress={{
            totalDays,
            weightEntries,
            calorieEntries,
            activityEntries
          }}
        />

        {/* Action Recommendations */}
        <Card className="ai-coach-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalDays < 7 ? (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400 font-medium">Continue Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Track for {7 - totalDays} more days to unlock AI meal planning
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-400 font-medium">Ready for Meal Planning</p>
                <p className="text-xs text-muted-foreground">
                  Generate personalized meal plans based on your TDEE
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <BottomNav />
    </div>
  );
}