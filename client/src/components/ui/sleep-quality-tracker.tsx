import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Moon, Star, Clock, Bed, Brain, Zap } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SleepQualityTrackerProps {
  userId: string;
}

const QUALITY_LEVELS = [
  { value: 1, label: "Poor", emoji: "😴", color: "text-red-400 border-red-400/30" },
  { value: 2, label: "Fair", emoji: "😪", color: "text-orange-400 border-orange-400/30" },
  { value: 3, label: "Good", emoji: "😊", color: "text-yellow-400 border-yellow-400/30" },
  { value: 4, label: "Great", emoji: "😌", color: "text-green-400 border-green-400/30" },
  { value: 5, label: "Excellent", emoji: "😇", color: "text-emerald-400 border-emerald-400/30" }
];

export function SleepQualityTracker({ userId }: SleepQualityTrackerProps) {
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [hours, setHours] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  // Check if already logged today
  const { data: todayLog } = useQuery({
    queryKey: ['/api/sleep-logs', userId, today],
    queryFn: () => fetch(`/api/sleep-logs/${userId}/${today}`).then(res => res.json())
  });

  // Save sleep log
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuality) throw new Error("Please select sleep quality");
      
      const response = await fetch('/api/sleep-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quality: selectedQuality,
          hours: hours ? parseFloat(hours) : null,
          notes: notes || null,
          logDate: today
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save sleep log');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "💤 Sleep logged successfully!",
        description: "Your recovery data helps optimize your calorie needs",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-logs'] });
      setSelectedQuality(null);
      setHours("");
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save sleep log",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Don't show if already logged today
  if (todayLog && todayLog.id) {
    const quality = QUALITY_LEVELS.find(q => q.value === todayLog.quality);
    return (
      <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-400/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-400" />
              <span className="text-sm text-indigo-300">Sleep Quality Today</span>
            </div>
            <Badge variant="outline" className={quality?.color || "text-indigo-400 border-indigo-400/30"}>
              {quality?.emoji} {quality?.label}
            </Badge>
          </div>
          {todayLog.hours && (
            <div className="mt-2 text-xs text-indigo-300/70">
              {todayLog.hours}h sleep
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-400/30 hover:border-indigo-400/50 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-indigo-400">
          <Moon className="h-5 w-5" />
          Sleep Quality Check-In
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quality Selection */}
        <div>
          <label className="text-sm text-indigo-300 mb-2 block">How was your sleep?</label>
          <div className="grid grid-cols-5 gap-2">
            {QUALITY_LEVELS.map((level) => (
              <Button
                key={level.value}
                onClick={() => setSelectedQuality(level.value)}
                variant={selectedQuality === level.value ? "default" : "outline"}
                className={`h-12 flex-col p-2 ${
                  selectedQuality === level.value 
                    ? "bg-indigo-400/20 border-indigo-400" 
                    : level.color
                } hover:scale-105 transition-all`}
                data-testid={`button-sleep-quality-${level.value}`}
              >
                <span className="text-lg">{level.emoji}</span>
                <span className="text-xs">{level.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Hours (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-indigo-300 mb-1 block flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Hours (optional)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="7.5"
              className="border-indigo-400/30 focus:border-indigo-400 bg-indigo-900/20"
              data-testid="input-sleep-hours"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!selectedQuality || saveMutation.isPending}
              className="w-full bg-indigo-400 hover:bg-indigo-500 text-black font-medium"
              data-testid="button-save-sleep"
            >
              {saveMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Bed className="h-4 w-4 mr-2" />
                  Log Sleep
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Notes (Optional) */}
        {selectedQuality && (
          <div>
            <label className="text-sm text-indigo-300 mb-1 block">Notes (optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Woke up feeling refreshed..."
              className="border-indigo-400/30 focus:border-indigo-400 bg-indigo-900/20"
              data-testid="input-sleep-notes"
            />
          </div>
        )}

        {/* Impact Info */}
        <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">Recovery Impact</span>
          </div>
          <div className="text-xs text-indigo-300/80 space-y-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Poor sleep may increase calorie needs
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Quality sleep optimizes muscle recovery and gains
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}