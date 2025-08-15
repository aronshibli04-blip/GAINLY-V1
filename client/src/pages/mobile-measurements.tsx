import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/userStore";
import { 
  Ruler, 
  TrendingUp, 
  Calendar,
  Camera,
  Plus,
  Target,
  Activity,
  Zap
} from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useMenu } from "@/components/ui/menu-context";

interface MeasurementEntry {
  id: string;
  userId: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  shoulders: number;
  bodyFat?: number;
  date: string;
  createdAt: string;
}

export default function MobileMeasurements() {
  const { toast } = useToast();
  const { user } = useUserStore();
  const { openMenu } = useMenu();
  
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([
    {
      id: "1",
      userId: user?.id || "",
      chest: 95,
      waist: 78,
      arms: 32,
      thighs: 55,
      shoulders: 110,
      bodyFat: 12,
      date: "2025-01-05",
      createdAt: new Date().toISOString()
    }
  ]);

  const [formData, setFormData] = useState({
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
    shoulders: '',
    bodyFat: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chest || !formData.waist || !formData.arms) {
      toast({
        title: "Missing data",
        description: "Please fill in at least chest, waist, and arms measurements.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MeasurementEntry = {
      id: Date.now().toString(),
      userId: user?.id || "",
      chest: parseFloat(formData.chest),
      waist: parseFloat(formData.waist),
      arms: parseFloat(formData.arms),
      thighs: parseFloat(formData.thighs) || 0,
      shoulders: parseFloat(formData.shoulders) || 0,
      bodyFat: parseFloat(formData.bodyFat) || undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setMeasurements(prev => [newEntry, ...prev]);
    setFormData({
      chest: '',
      waist: '',
      arms: '',
      thighs: '',
      shoulders: '',
      bodyFat: ''
    });
    setShowAddForm(false);

    toast({
      title: "Measurements added",
      description: "Your body measurements have been recorded successfully.",
    });
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const getChange = (current: number, previous?: number) => {
    if (!previous) return { value: 0, percentage: 0 };
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { value: change, percentage };
  };

  const progressMetrics = [
    {
      label: "Chest",
      current: latestMeasurement?.chest || 0,
      change: getChange(latestMeasurement?.chest || 0, previousMeasurement?.chest),
      icon: Target,
      color: "text-primary"
    },
    {
      label: "Arms", 
      current: latestMeasurement?.arms || 0,
      change: getChange(latestMeasurement?.arms || 0, previousMeasurement?.arms),
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      label: "Shoulders",
      current: latestMeasurement?.shoulders || 0,
      change: getChange(latestMeasurement?.shoulders || 0, previousMeasurement?.shoulders),
      icon: Activity,
      color: "text-cyan-400"
    },
    {
      label: "Thighs",
      current: latestMeasurement?.thighs || 0,
      change: getChange(latestMeasurement?.thighs || 0, previousMeasurement?.thighs),
      icon: TrendingUp,
      color: "text-purple-400"
    }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Measurements" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" 
                 style={{ animationDuration: '15s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-cyan-400 flex items-center justify-center shadow-xl">
              <Ruler className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              MEASUREMENTS
            </span>
          </h1>
          <p className="text-primary/70">Track your body composition progress</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {progressMetrics.map((metric) => (
            <Card key={metric.label} className="bg-slate-800/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className={`flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg mx-auto mb-2`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.current > 0 ? `${metric.current}cm` : '-'}
                </div>
                <div className="text-sm text-slate-400">{metric.label}</div>
                {metric.change.value !== 0 && (
                  <div className={`text-xs mt-1 ${metric.change.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change.value > 0 ? '+' : ''}{metric.change.value.toFixed(1)}cm
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Body Fat Progress */}
        {latestMeasurement?.bodyFat && (
          <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" />
                Body Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Body Fat Percentage</span>
                  <span className="text-2xl font-bold text-primary">{latestMeasurement.bodyFat}%</span>
                </div>
                <Progress 
                  value={100 - latestMeasurement.bodyFat} 
                  className="h-3 bg-slate-700"
                />
                <div className="text-center text-sm text-slate-400">
                  Lean Body Mass: {(100 - latestMeasurement.bodyFat).toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Measurement */}
        <Card className="mb-8 bg-slate-800/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plus className="h-5 w-5" />
              Add Measurements
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/20"
              data-testid="button-toggle-measurement-form"
            >
              {showAddForm ? 'Cancel' : 'Add New'}
            </Button>
          </CardHeader>
          
          {showAddForm && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chest" className="text-primary">Chest (cm)*</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      onChange={(e) => setFormData({...formData, chest: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="95.0"
                      data-testid="input-chest"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waist" className="text-primary">Waist (cm)*</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({...formData, waist: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="78.0"
                      data-testid="input-waist"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arms" className="text-primary">Arms (cm)*</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.1"
                      value={formData.arms}
                      onChange={(e) => setFormData({...formData, arms: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="32.0"
                      data-testid="input-arms"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thighs" className="text-primary">Thighs (cm)</Label>
                    <Input
                      id="thighs"
                      type="number"
                      step="0.1"
                      value={formData.thighs}
                      onChange={(e) => setFormData({...formData, thighs: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="55.0"
                      data-testid="input-thighs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shoulders" className="text-primary">Shoulders (cm)</Label>
                    <Input
                      id="shoulders"
                      type="number"
                      step="0.1"
                      value={formData.shoulders}
                      onChange={(e) => setFormData({...formData, shoulders: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="110.0"
                      data-testid="input-shoulders"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyFat" className="text-primary">Body Fat (%)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      value={formData.bodyFat}
                      onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="12.0"
                      data-testid="input-body-fat"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-black hover:bg-primary/90"
                  data-testid="button-submit-measurements"
                >
                  Add Measurements
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Progress Photos Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Camera className="h-5 w-5" />
              Progress Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Camera className="h-16 w-16 text-purple-400/50 mx-auto mb-4" />
              <p className="text-purple-300/80 mb-4">
                Take progress photos to visualize your transformation
              </p>
              <Button 
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                data-testid="button-add-progress-photo"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Progress Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Measurement History */}
        <Card className="bg-slate-800/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              Measurement History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {measurements.map((measurement, index) => (
                <div key={measurement.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-primary font-semibold">
                      {new Date(measurement.date).toLocaleDateString()}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Chest</div>
                      <div className="text-white font-semibold">{measurement.chest}cm</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Waist</div>
                      <div className="text-white font-semibold">{measurement.waist}cm</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Arms</div>
                      <div className="text-white font-semibold">{measurement.arms}cm</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Shoulders</div>
                      <div className="text-white font-semibold">{measurement.shoulders || '-'}cm</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Thighs</div>
                      <div className="text-white font-semibold">{measurement.thighs || '-'}cm</div>
                    </div>
                    {measurement.bodyFat && (
                      <div>
                        <div className="text-slate-400">Body Fat</div>
                        <div className="text-white font-semibold">{measurement.bodyFat}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}