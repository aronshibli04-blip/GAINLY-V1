import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Scale, ArrowLeft, Brain, Target, BarChart3, Zap } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { User as UserType, DietaryPreference } from "@/types";
import { FuturisticCalibrationFlow } from "@/components/futuristic-calibration/FuturisticCalibrationFlow";

export default function HardgainerProfileSetup() {
  const { toast } = useToast();
  const { user, setUser, completeOnboarding } = useUserStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    sex: user?.sex || '',
    activityDescription: user?.activityLevel || '',
    goalWeight: user?.goalWeight?.toString() || ''
  });

  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    user?.dietaryPreferences?.map(p => p.name) || []
  );

  const restrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Shellfish-Free', 'Low-Sodium', 'Kosher', 'Halal'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.age || !formData.height || 
        !formData.weight || !formData.sex || !formData.activityDescription || 
        !formData.goalWeight) {
      toast({ 
        title: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    // Validate numeric fields
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const goalWeight = parseFloat(formData.goalWeight);

    if (age < 16 || age > 100) {
      toast({ 
        title: "Age must be between 16 and 100", 
        variant: "destructive" 
      });
      return;
    }

    if (height < 120 || height > 250) {
      toast({ 
        title: "Height must be between 120 and 250 cm", 
        variant: "destructive" 
      });
      return;
    }

    if (weight < 40 || weight > 200) {
      toast({ 
        title: "Weight must be between 40 and 200 kg", 
        variant: "destructive" 
      });
      return;
    }

    if (goalWeight <= weight) {
      toast({ 
        title: "Goal weight must be higher than current weight", 
        variant: "destructive" 
      });
      return;
    }

    // Create dietary preferences
    const preferences: DietaryPreference[] = dietaryPreferences.map(name => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      type: 'restriction'
    }));

    // Create or update user
    const userData: UserType = {
      id: user?.id || Date.now().toString(),
      username: formData.firstName.toLowerCase(),
      firstName: formData.firstName,
      age,
      sex: formData.sex as 'male' | 'female',
      height,
      weight,
      goalWeight,
      activityLevel: formData.activityDescription,
      dietaryPreferences: preferences,
      createdAt: user?.createdAt || new Date().toISOString(),
      calibrationStartDate: new Date().toISOString(),
      hasCompletedCalibration: false,
    };

    setUser(userData);
    completeOnboarding();

    toast({ 
      title: "Profile Created Successfully!",
      description: "Start your 7-day data collection to unlock personalized recommendations."
    });

    // Redirect to calibration mode
    window.location.href = '/';
  };

  const handleRestrictionToggle = (restriction: string) => {
    setDietaryPreferences(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
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
        <div className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse" style={{top: '20%', left: '10%', animationDelay: '0s'}} />
        <div className="absolute w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{top: '40%', left: '80%', animationDelay: '1s'}} />
        <div className="absolute w-3 h-3 bg-primary/20 rounded-full animate-pulse" style={{top: '70%', left: '20%', animationDelay: '2s'}} />
        <div className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse" style={{top: '80%', left: '70%', animationDelay: '3s'}} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          {/* Futuristic Icon */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-spin" style={{animationDuration: '3s'}} />
            <div className="absolute inset-1 rounded-full bg-background" />
            <div className="relative z-10 w-16 h-16 rounded-full grok-gradient flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-black animate-pulse" />
            </div>
          </div>
          
          {/* Title with Glow Effect */}
          <h1 className="text-5xl font-bold grok-text-gradient mb-6 tracking-tight">
            PROFILE SETUP
          </h1>
          <div className="relative">
            <p className="text-xl text-primary/80 font-medium tracking-wide uppercase text-center">
              Initialize biometric parameters
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              AI analyzing your metabolism for personalized recommendations
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Futuristic Card */}
          <div className="relative">
            {/* Glowing Border Animation */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-30 blur animate-pulse" />
            <Card className="relative bg-card/95 backdrop-blur-xl border-primary/20 rounded-2xl overflow-hidden">
              {/* Header Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
                <CardHeader className="relative z-10 pb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white tracking-wide">BODY DATA SETUP</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-xs text-primary font-medium uppercase tracking-wider">AI System Ready</span>
                        </div>
                      </div>
                    </div>
                    {user && (
                      <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary" asChild>
                        <a href="/">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Exit
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="mt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Advanced AI algorithms require precise biometric data to construct your unique metabolic profile
                    </p>
                  </div>
                </CardHeader>
              </div>
              <CardContent className="relative">
                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>CALIBRATION PROGRESS</span>
                    <span>45% COMPLETE</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000" style={{width: '45%'}} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Details Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">01</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">PERSONAL IDENTIFIERS</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-primary uppercase tracking-wider">First Name</Label>
                        <div className="relative">
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            required
                            className="grok-input pl-4 pr-10 h-12 bg-muted/20 border-primary/20 focus:border-primary text-white"
                            placeholder="Hva heter du?"
                            data-testid="input-first-name"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium text-primary uppercase tracking-wider">Age</Label>
                        <div className="relative">
                          <Input
                            id="age"
                            type="number"
                            min="16"
                            max="100"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            required
                            className="grok-input pl-4 pr-10 h-12 bg-muted/20 border-primary/20 focus:border-primary text-white"
                            placeholder="Alder"
                            data-testid="input-age"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">02</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white tracking-wide">Grunnleggende informasjon</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sex" className="text-sm font-medium text-primary uppercase tracking-wider">Biological Sex</Label>
                        <Select onValueChange={(value) => setFormData({...formData, sex: value})} value={formData.sex}>
                          <SelectTrigger data-testid="select-sex" className="grok-input h-12 bg-muted/20 border-primary/20 focus:border-primary text-white">
                            <SelectValue placeholder="Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Physical Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-sm font-medium text-primary uppercase tracking-wider">Height (cm)</Label>
                        <div className="relative">
                          <Input
                            id="height"
                            type="number"
                            step="0.1"
                            min="120"
                            max="250"
                            value={formData.height}
                            onChange={(e) => setFormData({...formData, height: e.target.value})}
                            required
                            className="grok-input pl-4 pr-10 h-12 bg-muted/20 border-primary/20 focus:border-primary text-white"
                            placeholder="Høyde (cm)"
                            data-testid="input-height"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm font-medium text-primary uppercase tracking-wider">Nåværende vekt (kg)</Label>
                        <div className="relative">
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            min="40"
                            max="200"
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                            required
                            className="grok-input pl-4 pr-10 h-12 bg-muted/20 border-primary/20 focus:border-primary text-white"
                            placeholder="Nåværende vekt (kg)"
                            data-testid="input-weight"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goalWeight" className="text-sm font-medium text-primary uppercase tracking-wider">Målvekt (kg)</Label>
                        <div className="relative">
                          <Input
                            id="goalWeight"
                            type="number"
                            step="0.1"
                            min="40"
                            max="200"
                            value={formData.goalWeight}
                            onChange={(e) => setFormData({...formData, goalWeight: e.target.value})}
                            required
                            className="grok-input pl-4 pr-10 h-12 bg-muted/20 border-primary/20 focus:border-primary text-white"
                            placeholder="Målvekt (kg)"
                            data-testid="input-goal-weight"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">03</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white tracking-wide">ACTIVITY PROFILE</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activityDescription" className="text-sm font-medium text-primary uppercase tracking-wider">Activity Profile Description</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Describe your daily routine for precise AI metabolic analysis
                        </p>
                        <Textarea
                          id="activityDescription"
                          value={formData.activityDescription}
                          onChange={(e) => setFormData({...formData, activityDescription: e.target.value})}
                          required
                          className="grok-input min-h-[120px] bg-muted/20 border-primary/20 focus:border-primary text-white resize-none"
                          placeholder="Describe your typical daily activities, work, and exercise routine...

Example: I work 8 hours at a grocery store taking 15k-20k steps daily, then do 1 hour hypertrophy training 4x per week. On weekends I'm mostly sedentary but do light household activities."
                          data-testid="textarea-activity-description"
                        />
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">04</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white tracking-wide">NUTRITIONAL CONSTRAINTS</h3>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-primary uppercase tracking-wider">Dietary Parameters (Optional)</Label>
                        <p className="text-sm text-muted-foreground">
                          Configure nutritional processing constraints for AI meal optimization
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {restrictions.map((restriction) => (
                            <div key={restriction} className="flex items-center space-x-2">
                              <Checkbox
                                id={restriction}
                                checked={dietaryPreferences.includes(restriction)}
                                onCheckedChange={() => handleRestrictionToggle(restriction)}
                                className="border-primary/30 data-[state=checked]:bg-primary"
                                data-testid={`checkbox-${restriction.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              />
                              <Label htmlFor={restriction} className="text-sm text-white">
                                {restriction}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {dietaryPreferences.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {dietaryPreferences.map((restriction) => (
                              <Badge key={restriction} variant="secondary" className="bg-primary/20 text-primary border-primary/30" data-testid={`badge-${restriction.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-8">
                      <Button 
                        type="submit" 
                        className="w-full grok-button h-14 text-lg font-semibold tracking-wide uppercase" 
                        size="lg"
                        data-testid="button-create-profile"
                      >
                        <span className="relative z-10">
                          {user ? "UPDATE YOUR PROFILE" : "START YOUR PLAN"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="mt-20 text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-pulse" />
            <div className="absolute inset-1 rounded-full bg-background" />
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-black" />
            </div>
          </div>
          <h2 className="text-3xl font-bold grok-text-gradient mb-4 tracking-tight">
            AI-POWERED CAPABILITIES
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Advanced neural networks and machine learning algorithms working together to optimize your weight gain journey
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    AI Accurate TDEE Calculation
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI analyzes your metabolism patterns to calculate your daily calorie needs 
                    based on real data, not generic formulas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    AI Analysis & Insights
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Advanced analytics provide real-time insights into your progress, 
                    metabolic changes, and optimization recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    AI Personal Coach
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your personal AI coach adapts strategies based on your progress, 
                    providing motivation and guidance every step of the way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    Smart Meal Planning
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI generates personalized meal plans optimized for your TDEE, 
                    dietary preferences, and weight gain goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    Progress Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Advanced tracking with visual analytics, weight trends, 
                    and achievement systems to keep you motivated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 tracking-wide">
                    Adaptive Learning
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The AI continuously learns from your data to improve 
                    recommendations and adapt to your unique metabolism.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}