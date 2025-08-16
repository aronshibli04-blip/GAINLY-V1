import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Scale, Utensils, Activity, Clock, Zap, RotateCcw, FastForward } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function CalibrationMode() {
  const { toast } = useToast();
  const { user, setUser, addWeightEntry, addCalorieEntry, addActivityEntry, weightEntries, calorieEntries, clearUserData } = useUserStore();
  
  const [formData, setFormData] = useState({
    weight: '',
    calories: '',
    activityDescription: ''
  });

  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(7);

  useEffect(() => {
    if (user?.calibrationStartDate) {
      const startDate = new Date(user.calibrationStartDate);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate progress based on unique days with data entries
      const uniqueWeightDays = new Set(weightEntries.map(w => w.date)).size;
      const uniqueCalorieDays = new Set(calorieEntries.map(c => c.date)).size;
      const dataEntryDays = Math.max(uniqueWeightDays, uniqueCalorieDays);
      
      const remaining = Math.max(0, 7 - dataEntryDays);
      setDaysRemaining(remaining);
      setCalibrationProgress(Math.min((dataEntryDays / 7) * 100, 100));

      // Check if calibration is complete (7 days of data)
      if (dataEntryDays >= 7 && !user.hasCompletedCalibration) {
        setUser({ ...user, hasCompletedCalibration: true });
        toast({
          title: "🎉 AI Calibration Complete!",
          description: "Full neural network capabilities are now unlocked.",
        });
        // Use a timeout to allow state to update before navigation
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
  }, [user, setUser, toast, weightEntries, calorieEntries]);

  const handleSkipCalibration = () => {
    if (user && !user.hasCompletedCalibration) {
      setUser({ ...user, hasCompletedCalibration: true });
      toast({
        title: "Calibration Skipped",
        description: "Jumping to main app for testing.",
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.weight || !formData.calories || !formData.activityDescription.trim()) {
      toast({
        title: "All fields required",
        description: "Please provide weight, calories, and activity data.",
        variant: "destructive"
      });
      return;
    }

    // Validate inputs
    const weight = parseFloat(formData.weight);
    const calories = parseInt(formData.calories);

    if (weight < 40 || weight > 200) {
      toast({
        title: "Invalid weight",
        description: "Weight must be between 40-200 kg",
        variant: "destructive"
      });
      return;
    }

    if (calories < 500 || calories > 8000) {
      toast({
        title: "Invalid calories",
        description: "Calories must be between 500-8000",
        variant: "destructive"
      });
      return;
    }

    // Store today's data
    const today = new Date().toISOString().split('T')[0];
    
    // Add weight entry
    addWeightEntry({
      userId: user?.id || 'user',
      weight: weight,
      date: today
    });

    // Add calorie entry
    addCalorieEntry({
      userId: user?.id || 'user',
      calories: calories,
      description: `Daily intake: ${calories} calories`,
      date: today
    });

    // Add activity entry (storing description in a simple way)
    addActivityEntry({
      userId: user?.id || 'user',
      type: 'moderate', // Default to moderate activity
      value: formData.activityDescription.length, // Use description length as a simple metric
      date: today
    });

    toast({
      title: "✅ Data Recorded",
      description: `Neural network processing ${today} calibration data...`,
    });

    // Clear form
    setFormData({
      weight: '',
      calories: '',
      activityDescription: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Advanced Neural Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.4) 1px, transparent 0),
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 40px 40px, 40px 40px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      {/* Holographic Scan Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" 
             style={{ 
               top: '20%', 
               animation: 'scan-vertical 8s ease-in-out infinite alternate' 
             }} />
        <div className="absolute h-full w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent" 
             style={{ 
               left: '30%', 
               animation: 'scan-horizontal 10s ease-in-out infinite alternate' 
             }} />
      </div>

      {/* Neural Network Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${20 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 25}%`,
            }}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse shadow-lg"
                   style={{ 
                     boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.5)',
                     animationDelay: `${i * 0.5}s`
                   }} />
              <div className="absolute inset-0 w-3 h-3 bg-primary/20 rounded-full animate-ping" 
                   style={{ animationDelay: `${i * 0.5 + 1}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Energy Flowing Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px"
            style={{
              left: '0%',
              top: `${20 + i * 12}%`,
              width: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)',
              animation: `energy-flow-${i % 3} 4s linear infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Compact Brain Hologram */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" 
                   style={{ animationDuration: '15s' }} />
              <div className="absolute inset-1 rounded-full border border-primary/40 animate-spin" 
                   style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
              <div className="relative z-10 w-12 h-12 rounded-full grok-gradient flex items-center justify-center shadow-xl">
                <Brain className="h-7 w-7 text-black animate-pulse" />
              </div>
            </div>
            
            <div className="text-left">
              <h1 className="text-4xl font-black mb-2 tracking-tight">
                <span className="grok-text-gradient">
                  AI CALIBRATION MODE
                </span>
              </h1>
              <p className="text-base text-primary/70 max-w-md">
                Track for 7 days • AI learns your metabolism • Get precise recommendations
              </p>
            </div>
          </div>

          {/* Advanced Progress Section */}
          <div className="max-w-lg mx-auto space-y-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-primary/20">
            <div className="flex items-center justify-between text-lg">
              <span className="text-primary/80 font-semibold tracking-wider">CALIBRATION STATUS</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-bold text-xl">{Math.floor(calibrationProgress)}%</span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-primary/30">
                <div 
                  className="h-full grok-gradient rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${calibrationProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0 h-4 bg-gradient-to-r from-primary/20 to-transparent rounded-full animate-pulse" />
            </div>
            
            <div className="flex items-center justify-center gap-3 text-primary/70">
              <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-base font-medium tracking-wider">
                {daysRemaining} DAYS REMAINING
              </span>
            </div>

            {/* Developer Controls - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-primary/20">
                {calibrationProgress >= 100 ? (
                  <Button
                    onClick={() => {
                      if (user && !user.hasCompletedCalibration) {
                        setUser({ ...user, hasCompletedCalibration: true });
                        toast({
                          title: "🎉 AI Calibration Complete!",
                          description: "Full neural network capabilities are now unlocked.",
                        });
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1000);
                      }
                    }}
                    variant="default"
                    size="sm"
                    className="neural-button"
                    data-testid="button-complete-calibration"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Complete Calibration
                  </Button>
                ) : (
                  <Button
                    onClick={handleSkipCalibration}
                    variant="outline"
                    size="sm"
                    className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200"
                    data-testid="button-skip-calibration"
                  >
                    <FastForward className="h-4 w-4 mr-2" />
                    Skip Calibration (Testing)
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Futuristic Data Entry Terminal */}
        <div className="max-w-3xl mx-auto">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border-2 border-primary/30 shadow-2xl shadow-primary/20">
            {/* Terminal Header */}
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 border-b border-primary/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="text-primary/80 font-mono text-sm tracking-wider">NEURAL_INTERFACE_v2.7.1</span>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/40 animate-pulse font-mono">
                  ACTIVE_SESSION
                </Badge>
              </div>
            </div>

            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-3xl font-black mb-3 tracking-tight">
                <span className="grok-text-gradient flex items-center justify-center gap-3">
                  <Calendar className="h-8 w-8 text-primary animate-pulse" />
                  ↑ DATA ACQUISITION PROTOCOL ↑
                </span>
              </CardTitle>
              <p className="text-primary/70 text-lg font-light tracking-wide">
                » Submit biometric parameters for neural processing «
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Weight Entry */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <Label htmlFor="weight" className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Current Weight (kg)
                    </Label>
                  </div>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="40"
                    max="200"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                    className="neural-input h-14 text-lg"
                    placeholder="► ENTER WEIGHT VALUE"
                    data-testid="input-daily-weight"
                  />
                </div>

                {/* Calories Entry */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <Label htmlFor="calories" className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Total Calories Consumed
                    </Label>
                  </div>
                  <Input
                    id="calories"
                    type="number"
                    min="500"
                    max="8000"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    required
                    className="neural-input h-14 text-lg"
                    placeholder="► ENTER CALORIE COUNT"
                    data-testid="input-daily-calories"
                  />
                </div>

                {/* Activity Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <Label htmlFor="activityDescription" className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Activity Description
                    </Label>
                  </div>
                  <Textarea
                    id="activityDescription"
                    value={formData.activityDescription}
                    onChange={(e) => setFormData({...formData, activityDescription: e.target.value})}
                    required
                    className="neural-input min-h-[120px] text-lg resize-none"
                    placeholder="► DESCRIBE DAILY ACTIVITIES: training, work patterns, movement intensity..."
                    data-testid="textarea-daily-activity"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <Button 
                    type="submit" 
                    className="neural-button w-full h-16 text-xl font-black tracking-widest"
                    size="lg"
                    data-testid="button-submit-daily-data"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <Zap className="h-6 w-6 animate-pulse" />
                      ↑ TRANSMIT NEURAL DATA ↑
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Scale className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Weight Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Daily weight measurements for metabolic rate calculation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Utensils className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Calorie Intake</h3>
                <p className="text-sm text-muted-foreground">
                  Total daily calories for energy balance analysis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Activity Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Daily activity patterns for TDEE optimization
                </p>
              </CardContent>
            </Card>

            {/* Reset Button for Testing */}
            <div className="mt-8 pt-6 border-t border-primary/20">
              <Button
                onClick={() => {
                  if (confirm('Reset all data and start fresh? This cannot be undone.')) {
                    clearUserData();
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset & Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}