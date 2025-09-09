import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Target, Award, TrendingUp } from "lucide-react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useSideMenu } from "@/hooks/use-side-menu";
import { GamificationSystem } from "@/components/ui/gamification-system";
import { AchievementSystem } from "@/components/ui/achievement-system";
import { DailyChallenges } from "@/components/ui/daily-challenges";
import { ProgressStreaks } from "@/components/ui/progress-streaks";
import { PowerUpSystem } from "@/components/ui/power-up-system";

export function MobileAchievements() {
  const { openMenu } = useSideMenu();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 text-white pb-24">
      {/* Mobile Header with Menu Toggle */}
      <MobileHeader 
        title="Achievements" 
        onOpenMenu={openMenu}
      />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-20 py-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-spin" 
                 style={{ animationDuration: '8s' }} />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-center shadow-xl">
              <Trophy className="h-8 w-8 text-black" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              ACHIEVEMENTS
            </span>
          </h1>
          <p className="text-yellow-400/70">Gamification & progress rewards</p>
        </div>

        {/* Level & Points System */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Level & Points</h3>
          <GamificationSystem />
        </div>

        {/* Daily Challenges */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Daily Challenges</h3>
          <DailyChallenges />
        </div>

        {/* Achievements */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Unlocked Achievements</h3>
          <AchievementSystem />
        </div>

        {/* Progress Streaks */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Streaks</h3>
          <ProgressStreaks />
        </div>

        {/* Power-ups */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Power-ups</h3>
          <PowerUpSystem />
        </div>

        {/* Achievement Stats Summary */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Award className="h-5 w-5" />
              Achievement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">12</div>
                <div className="text-sm text-slate-400">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">1,250</div>
                <div className="text-sm text-slate-400">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">7</div>
                <div className="text-sm text-slate-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">Level 3</div>
                <div className="text-sm text-slate-400">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}