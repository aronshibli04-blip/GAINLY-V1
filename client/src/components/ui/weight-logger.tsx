import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/use-toast";
import { Scale, Plus } from "lucide-react";

export function WeightLogger() {
  const { toast } = useToast();
  const { addWeightEntry, weightEntries } = useUserStore();
  const [weight, setWeight] = useState("");

  const today = new Date().toISOString().split('T')[0];
  const todayWeight = weightEntries.find(w => w.date === today);
  const lastWeight = weightEntries.length > 0 
    ? weightEntries[weightEntries.length - 1].weight 
    : null;

  const handleLogWeight = () => {
    if (!weight) {
      toast({ title: "Enter your weight", variant: "destructive" });
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      toast({ title: "Enter a valid weight (30-300kg)", variant: "destructive" });
      return;
    }

    addWeightEntry({
      date: today,
      weight: weightNum,
      userId: "user1"
    });

    setWeight("");
    toast({ 
      title: "Weight logged!", 
      description: `${weightNum}kg recorded for today`,
    });
  };

  // Pre-fill with last weight + small increment for convenience
  const handleQuickLog = (adjustment: number) => {
    if (lastWeight) {
      setWeight((lastWeight + adjustment).toFixed(1));
    }
  };

  return (
    <Card className="grok-glow-hover">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Scale className="h-5 w-5 text-primary" />
          <div className="flex-1">
            {todayWeight ? (
              <div>
                <p className="text-sm font-medium text-white">
                  Today: {todayWeight.weight}kg
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastWeight && todayWeight.weight !== lastWeight 
                    ? `${todayWeight.weight > lastWeight ? '+' : ''}${(todayWeight.weight - lastWeight).toFixed(1)}kg from yesterday`
                    : "Weight logged for today"
                  }
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-white">Log today's weight</p>
                {lastWeight && (
                  <p className="text-xs text-muted-foreground">
                    Yesterday: {lastWeight}kg
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {!todayWeight && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={lastWeight ? lastWeight.toString() : "67.5"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="grok-input flex-1"
                step="0.1"
                data-testid="input-weight-home"
              />
              <Button 
                onClick={handleLogWeight}
                className="grok-gradient"
                data-testid="button-log-weight-home"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {lastWeight && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLog(-0.1)}
                  className="flex-1 text-xs"
                >
                  {(lastWeight - 0.1).toFixed(1)}kg
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickLog(0)}
                  className="flex-1 text-xs"
                >
                  {lastWeight}kg
                </Button>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => handleQuickLog(0.1)}
                  className="flex-1 text-xs"
                >
                  {(lastWeight + 0.1).toFixed(1)}kg
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}