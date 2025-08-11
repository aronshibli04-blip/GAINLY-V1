import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { 
  Zap, 
  Shield, 
  Rocket, 
  Bolt, 
  Crown,
  Star,
  Flame,
  Battery
} from "lucide-react";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  requirement: string;
  active: boolean;
  duration?: string;
}

export function PowerUpSystem() {
  const { weightEntries, calorieEntries } = useUserStore();
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);

  // Calculate metrics
  const totalDays = new Set([...weightEntries.map(w => w.date), ...calorieEntries.map(c => c.date)]).size;
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0;
  const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0;
  const totalGain = currentWeight - startWeight;
  const weeklyGain = totalDays >= 7 ? (totalGain / totalDays) * 7 : 0;

  // Define power-ups
  const powerUps: PowerUp[] = [
    {
      id: 'consistency_shield',
      name: 'Konsistens Skjold',
      description: 'Doble poeng for neste ukes logging',
      icon: Shield,
      color: 'text-blue-400',
      requirement: '7 dager på rad',
      active: totalDays >= 7,
      duration: '7 dager'
    },
    {
      id: 'rocket_boost',
      name: 'Rakett Boost',
      description: 'Økt motivasjon og tilpassede tips',
      icon: Rocket,
      color: 'text-purple-400',
      requirement: '1kg økning',
      active: totalGain >= 1.0,
      duration: '3 dager'
    },
    {
      id: 'lightning_strike',
      name: 'Lyn-strike',
      description: 'Spesielle achievements tilgjengelig',
      icon: Bolt,
      color: 'text-yellow-400',
      requirement: '1kg+ per uke',
      active: weeklyGain >= 1.0,
      duration: 'Permanent'
    },
    {
      id: 'crown_power',
      name: 'Krone Kraft',
      description: 'VIP status og eksklusive features',
      icon: Crown,
      color: 'text-gold-400',
      requirement: '30 dager streak',
      active: totalDays >= 30,
      duration: 'Permanent'
    }
  ];

  const activatePowerUp = (powerUpId: string) => {
    if (!activePowerUps.includes(powerUpId)) {
      setActivePowerUps(prev => [...prev, powerUpId]);
      
      // Store activation in localStorage
      localStorage.setItem(`powerup_${powerUpId}`, Date.now().toString());
      
      // Show activation effect
      const element = document.getElementById(`powerup-${powerUpId}`);
      if (element) {
        element.classList.add('animate-pulse');
        setTimeout(() => {
          element.classList.remove('animate-pulse');
        }, 2000);
      }
    }
  };

  const availablePowerUps = powerUps.filter(p => p.active && !activePowerUps.includes(p.id));
  const currentActivePowerUps = powerUps.filter(p => activePowerUps.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Active Power-ups */}
      {currentActivePowerUps.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Battery className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-white">Aktive Power-ups</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {currentActivePowerUps.map(powerUp => {
                const IconComponent = powerUp.icon;
                return (
                  <div key={powerUp.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-primary/30">
                    <div className={`w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ${powerUp.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{powerUp.name}</p>
                      <p className="text-xs text-primary/80">{powerUp.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                      {powerUp.duration}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Power-ups */}
      {availablePowerUps.length > 0 && (
        <Card className="bg-slate-800/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-orange-400" />
              <h3 className="font-bold text-white">Tilgjengelige Power-ups</h3>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                {availablePowerUps.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {availablePowerUps.map(powerUp => {
                const IconComponent = powerUp.icon;
                return (
                  <div 
                    key={powerUp.id}
                    id={`powerup-${powerUp.id}`}
                    className="p-3 rounded-lg bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-primary/20"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-primary/30 to-orange-500/30 flex items-center justify-center ${powerUp.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{powerUp.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{powerUp.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            ✓ {powerUp.requirement}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {powerUp.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => activatePowerUp(powerUp.id)}
                      className="w-full bg-gradient-to-r from-primary to-orange-500 text-black font-bold hover:from-primary/90 hover:to-orange-500/90"
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Aktiver Power-up
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Power-up Progress */}
      <Card className="bg-slate-800/50 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-yellow-400" />
            <h3 className="font-bold text-white">Power-up Fremgang</h3>
          </div>
          
          <div className="space-y-3">
            {powerUps.map(powerUp => {
              const IconComponent = powerUp.icon;
              const progress = powerUp.active ? 100 : 0;
              
              return (
                <div key={powerUp.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    powerUp.active ? 'bg-primary/30' : 'bg-slate-600/50'
                  } ${powerUp.color}`}>
                    <IconComponent className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${powerUp.active ? 'text-white' : 'text-muted-foreground'}`}>
                        {powerUp.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{powerUp.requirement}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          powerUp.active ? 'bg-gradient-to-r from-primary to-orange-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}