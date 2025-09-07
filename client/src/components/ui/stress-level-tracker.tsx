import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Heart, AlertTriangle, Smile, Frown } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StressLevelTrackerProps {
  userId: string;
}

const STRESS_LEVELS = [
  { value: 1, label: "Very Relaxed", emoji: "😌", icon: Smile, color: "text-green-400 border-green-400/30", impact: "Optimal recovery and metabolism" },
  { value: 2, label: "Relaxed", emoji: "😊", icon: Smile, color: "text-emerald-400 border-emerald-400/30", impact: "Good recovery conditions" },
  { value: 3, label: "Moderate", emoji: "😐", icon: Brain, color: "text-yellow-400 border-yellow-400/30", impact: "Normal calorie needs" },
  { value: 4, label: "Stressed", emoji: "😰", icon: Frown, color: "text-orange-400 border-orange-400/30", impact: "May increase calorie needs 5-10%" },
  { value: 5, label: "Very Stressed", emoji: "😫", icon: AlertTriangle, color: "text-red-400 border-red-400/30", impact: "Can increase calorie needs 10-20%" }
];

export function StressLevelTracker({ userId }: StressLevelTrackerProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [triggers, setTriggers] = useState<string>("");
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  // Check if already logged today
  const { data: todayLog } = useQuery({
    queryKey: ['/api/stress-logs', userId, today],
    queryFn: () => fetch(`/api/stress-logs/${userId}/${today}`).then(res => res.json())
  });

  // Save stress log
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLevel) throw new Error("Please select stress level");
      
      const response = await fetch('/api/stress-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          level: selectedLevel,
          triggers: triggers || null,
          logDate: today
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save stress log');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🧠 Stress level logged!",
        description: "Your mental wellness data helps optimize your nutrition plan",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stress-logs'] });
      setSelectedLevel(null);
      setTriggers("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save stress log",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Don't show if already logged today
  if (todayLog && todayLog.id) {
    const level = STRESS_LEVELS.find(s => s.value === todayLog.level);
    const IconComponent = level?.icon || Brain;
    
    return (
      <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-400/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-cyan-300">Stress Level Today</span>
            </div>
            <Badge variant="outline" className={level?.color || "text-cyan-400 border-cyan-400/30"}>
              {level?.emoji} {level?.label}
            </Badge>
          </div>
          {todayLog.triggers && (
            <div className="mt-2 text-xs text-cyan-300/70">
              Triggers: {todayLog.triggers}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const selectedStressLevel = STRESS_LEVELS.find(s => s.value === selectedLevel);

  return (
    <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-400/30 hover:border-cyan-400/50 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Brain className="h-5 w-5" />
          Stress Level Check-In
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stress Level Selection */}
        <div>
          <label className="text-sm text-cyan-300 mb-2 block">How stressed are you feeling?</label>
          <div className="grid grid-cols-5 gap-1">
            {STRESS_LEVELS.map((level) => {
              const IconComponent = level.icon;
              return (
                <Button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  variant={selectedLevel === level.value ? "default" : "outline"}
                  className={`h-16 flex-col p-2 ${
                    selectedLevel === level.value 
                      ? "bg-cyan-400/20 border-cyan-400" 
                      : level.color
                  } hover:scale-105 transition-all`}
                  data-testid={`button-stress-level-${level.value}`}
                >
                  <span className="text-lg">{level.emoji}</span>
                  <span className="text-xs text-center leading-tight">{level.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Impact Information */}
        {selectedStressLevel && (
          <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Metabolic Impact</span>
            </div>
            <div className="text-xs text-cyan-300/80">
              {selectedStressLevel.impact}
            </div>
          </div>
        )}

        {/* Triggers (Optional) */}
        {selectedLevel && (
          <div>
            <label className="text-sm text-cyan-300 mb-1 block">What's causing stress? (optional)</label>
            <Input
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="Work deadlines, lack of sleep, training intensity..."
              className="border-cyan-400/30 focus:border-cyan-400 bg-cyan-900/20"
              data-testid="input-stress-triggers"
            />
          </div>
        )}

        {/* Save Button */}
        {selectedLevel && (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
            data-testid="button-save-stress"
          >
            {saveMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Log Stress Level
              </>
            )}
          </Button>
        )}

        {/* Educational Info */}
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Why Track Stress?</span>
          </div>
          <div className="text-xs text-cyan-300/80 space-y-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Chronic stress increases cortisol and calorie needs
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Better stress management improves muscle gains
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}