import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Scale, Utensils, Activity, Clock, Zap } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function CalibrationMode() {
  const { toast } = useToast();
  const { user, setUser } = useUserStore();
  
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
      
      const remaining = Math.max(0, 7 - daysDiff);
      setDaysRemaining(remaining);
      setCalibrationProgress((daysDiff / 7) * 100);

      // Check if calibration is complete
      if (daysDiff >= 7 && !user.hasCompletedCalibration) {
        setUser({ ...user, hasCompletedCalibration: true });
        toast({
          title: "🎉 AI Calibration Complete!",
          description: "Full neural network capabilities are now unlocked.",
        });
        window.location.href = '/';
      }
    }
  }, [user, setUser, toast]);

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

    // Store today's data (in real app, this would go to database)
    const today = new Date().toISOString().split('T')[0];
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-background" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <Brain className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold grok-text-gradient mb-4 tracking-tight">
            AI NEURAL CALIBRATION
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Training neural networks on your unique metabolism patterns
          </p>

          {/* Progress Section */}
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calibration Progress</span>
              <span className="text-primary font-semibold">{Math.floor(calibrationProgress)}%</span>
            </div>
            <Progress value={calibrationProgress} className="h-3" />
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {daysRemaining} days remaining for full neural activation
              </span>
            </div>
          </div>
        </div>

        {/* Daily Data Entry Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="relative overflow-hidden bg-card/95 backdrop-blur-sm border border-primary/20">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl grok-text-gradient flex items-center justify-center gap-2">
                <Calendar className="h-6 w-6" />
                Today's Neural Input
              </CardTitle>
              <p className="text-muted-foreground">
                Provide daily data for AI metabolic analysis
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
                    className="grok-input h-12 bg-muted/20 border-primary/20 focus:border-primary text-white text-lg"
                    placeholder="Enter today's weight"
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
                    className="grok-input h-12 bg-muted/20 border-primary/20 focus:border-primary text-white text-lg"
                    placeholder="Total calories for today"
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
                    className="grok-input min-h-[100px] bg-muted/20 border-primary/20 focus:border-primary text-white resize-none"
                    placeholder="Describe today's activities: work, exercise, general movement..."
                    data-testid="textarea-daily-activity"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full grok-button h-14 text-lg font-semibold tracking-wide uppercase"
                    size="lg"
                    data-testid="button-submit-daily-data"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      TRANSMIT NEURAL DATA
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-6 text-center">
                <Scale className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Weight Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Daily weight measurements for metabolic rate calculation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <Utensils className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Calorie Intake</h3>
                <p className="text-sm text-muted-foreground">
                  Total daily calories for energy balance analysis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Activity Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Daily activity patterns for TDEE optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}