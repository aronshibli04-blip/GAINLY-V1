import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Heart, Gift, Trophy, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

interface RewardCustomizerProps {
  goalWeight: number;
  currentReward: string;
  onRewardChange: (newReward: string) => void;
}

export function RewardCustomizer({ goalWeight, currentReward, onRewardChange }: RewardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const generatePersonalizedRewards = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalWeight,
          userPreferences: userInput,
          currentReward
        })
      });
      
      const data = await response.json();
      setAiSuggestions(data.rewards || []);
    } catch (error) {
      console.error('Failed to generate rewards:', error);
      // Fallback suggestions
      setAiSuggestions([
        "Noe du har ønsket deg lenge",
        "En spesiell opplevelse med venner",
        "Behandling eller wellness-dag",
        "Ny klær eller tilbehør som passer din nye kropp"
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectReward = (reward: string) => {
    onRewardChange(reward);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/30 text-blue-400"
        >
          <Wand2 className="h-3 w-3 mr-1" />
          Tilpass
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-900 border-blue-400/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-400">
            <Sparkles className="h-5 w-5" />
            Tilpass din belønning - {goalWeight}kg
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Beskriv dine interesser så AI-en kan lage personlige belønninger som motiverer deg.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Hva motiverer deg mest? Fortell om dine interesser og ønsker:
            </label>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="F.eks: Jeg elsker å reise, liker teknologi, ønsker å kjøpe en smartklokke, liker spa-behandlinger, vil oppleve noe nytt med venner..."
              className="bg-slate-800 border-slate-600 text-white resize-none"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={generatePersonalizedRewards}
            disabled={!userInput.trim() || isGenerating}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Lager forslag...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Lag personlige belønninger
              </>
            )}
          </Button>
          
          {aiSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">AI foreslår:</h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="bg-slate-800/50 border-slate-600/50 hover:border-blue-400/50 transition-colors cursor-pointer"
                    onClick={() => selectReward(suggestion)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{suggestion}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 px-2 text-blue-400 hover:text-blue-300"
                        >
                          Velg
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-slate-600">
            <p className="text-xs text-slate-400">
              💡 Tips: Velg belønninger som virkelig motiverer deg personlig. 
              Det kan være alt fra opplevelser til ting du har ønsket deg.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}