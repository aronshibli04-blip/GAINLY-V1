import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, User, Scale, ArrowLeft } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { User as UserType, DietaryPreference } from "@/types";

export default function HardgainerProfileSetup() {
  const { toast } = useToast();
  const { user, setUser, completeOnboarding } = useUserStore();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    sex: user?.sex || '',
    activityLevel: user?.activityLevel || '',
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
        !formData.weight || !formData.sex || !formData.activityLevel || 
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
      activityLevel: formData.activityLevel as any,
      dietaryPreferences: preferences,
      createdAt: user?.createdAt || new Date().toISOString(),
    };

    setUser(userData);
    completeOnboarding();

    toast({ 
      title: "Profile saved successfully!",
      description: "You can now start tracking your weight and calories."
    });

    // Redirect to home
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 text-white rounded-full mb-6">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Calibration Phase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Initialize biometric parameters for AI-driven metabolic analysis
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              {user && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </a>
                </Button>
              )}
            </div>
            <CardDescription>
              This information helps us calculate your real TDEE and create personalized meal plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Your first name"
                    required
                    data-testid="input-first-name"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Your age"
                    required
                    data-testid="input-age"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sex">Sex *</Label>
                <Select onValueChange={(value) => setFormData({...formData, sex: value})} value={formData.sex}>
                  <SelectTrigger data-testid="select-sex">
                    <SelectValue placeholder="Select your sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Physical Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="120"
                    max="250"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="170"
                    required
                    data-testid="input-height"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Current Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="40"
                    max="200"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="70"
                    required
                    data-testid="input-weight"
                  />
                </div>

                <div>
                  <Label htmlFor="goalWeight">Goal Weight (kg) *</Label>
                  <Input
                    id="goalWeight"
                    type="number"
                    step="0.1"
                    min="40"
                    max="200"
                    value={formData.goalWeight}
                    onChange={(e) => setFormData({...formData, goalWeight: e.target.value})}
                    placeholder="80"
                    required
                    data-testid="input-goal-weight"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level *</Label>
                <Select onValueChange={(value) => setFormData({...formData, activityLevel: value})} value={formData.activityLevel}>
                  <SelectTrigger data-testid="select-activity-level">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <Label>Dietary Restrictions (optional)</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Select any dietary restrictions or preferences you have
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {restrictions.map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={dietaryPreferences.includes(restriction)}
                        onCheckedChange={() => handleRestrictionToggle(restriction)}
                        data-testid={`checkbox-${restriction.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      />
                      <Label htmlFor={restriction} className="text-sm">
                        {restriction}
                      </Label>
                    </div>
                  ))}
                </div>
                {dietaryPreferences.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dietaryPreferences.map((restriction) => (
                      <Badge key={restriction} variant="secondary" data-testid={`badge-${restriction.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                data-testid="button-create-profile"
              >
                {user ? "Update Profile" : "Create Profile & Start Tracking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Scale className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Real TDEE Calculation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your weight and calories for 7+ days to calculate your actual TDEE 
                    based on real data, not generic formulas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <TrendingUp className="h-8 w-8 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    AI Meal Planning
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get personalized meal plans generated by AI based on your calculated TDEE 
                    and dietary preferences.
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