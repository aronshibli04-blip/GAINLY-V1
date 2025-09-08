import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar, 
  Flame,
  Crown,
  Sparkles
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

const BADGES = {
  first_week: { name: "First Week Warrior", icon: Calendar, color: "text-blue-400" },
  streak_7: { name: "Week Streak", icon: Flame, color: "text-orange-400" },
  streak_30: { name: "Month Champion", icon: Crown, color: "text-yellow-400" },
  level_5: { name: "Level 5 Hero", icon: Star, color: "text-purple-400" },
  level_10: { name: "Elite Gainer", icon: Trophy, color: "text-emerald-400" },
  perfect_week: { name: "Perfect Week", icon: Target, color: "text-pink-400" },
};

const ACHIEVEMENTS = [
  { id: "streak_7", title: "7 Day Streak", description: "Complete routines for 7 days straight", xp: 500 },
  { id: "level_5", title: "Reach Level 5", description: "Accumulate enough XP to reach level 5", xp: 1000 },
  { id: "perfect_week", title: "Perfect Week", description: "Complete all routines every day for a week", xp: 750 },
  { id: "first_month", title: "First Month", description: "Stay consistent for 30 days", xp: 2000 },
];

export function GamificationDashboard() {
  const { xp, level, currentStreak, longestStreak, badges, addXp, addBadge, incrementStreak } = useUserStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadgeEarned, setShowBadgeEarned] = useState<string | null>(null);

  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const progressToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // Check for new achievements
  useEffect(() => {
    // Check for streak badges
    if (currentStreak === 7 && !badges.includes('streak_7')) {
      addBadge('streak_7');
      addXp(ACHIEVEMENTS.find(a => a.id === 'streak_7')?.xp || 500);
      setShowBadgeEarned('streak_7');
    }
    
    if (currentStreak === 30 && !badges.includes('streak_30')) {
      addBadge('streak_30');
      addXp(2000);
      setShowBadgeEarned('streak_30');
    }

    // Check for level badges
    if (level >= 5 && !badges.includes('level_5')) {
      addBadge('level_5');
      setShowBadgeEarned('level_5');
    }
    
    if (level >= 10 && !badges.includes('level_10')) {
      addBadge('level_10');
      setShowBadgeEarned('level_10');
    }
  }, [currentStreak, level, badges, addBadge, addXp]);

  // Show level up animation
  useEffect(() => {
    if (xp >= xpForNextLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [xp, xpForNextLevel]);

  const earnedBadges = badges.map(badgeId => BADGES[badgeId as keyof typeof BADGES]).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Level & XP Overview */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-400">
            <Crown className="h-6 w-6 mr-2" />
            Level {level} - Hardgainer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progress to Level {level + 1}</span>
                <span className="text-emerald-400 font-bold">{xp - xpForCurrentLevel} / {xpForNextLevel - xpForCurrentLevel} XP</span>
              </div>
              <Progress value={progressToNextLevel} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{xp.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Total XP</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{currentStreak}</p>
                <p className="text-sm text-slate-400">Current Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{longestStreak}</p>
                <p className="text-sm text-slate-400">Best Streak</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Collection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-400">
            <Award className="h-6 w-6 mr-2" />
            Badge Collection ({earnedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(BADGES).map(([id, badge]) => {
              const isEarned = badges.includes(id);
              const BadgeIcon = badge.icon;
              
              return (
                <div
                  key={id}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    isEarned 
                      ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-yellow-500/40' 
                      : 'bg-slate-700/30 border-slate-600 opacity-50'
                  }`}
                >
                  <BadgeIcon className={`h-8 w-8 mx-auto mb-2 ${isEarned ? badge.color : 'text-slate-500'}`} />
                  <p className={`font-medium text-sm ${isEarned ? 'text-white' : 'text-slate-500'}`}>
                    {badge.name}
                  </p>
                  {isEarned && (
                    <Badge variant="outline" className="mt-2 text-xs border-yellow-500/40 text-yellow-400">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Target className="h-6 w-6 mr-2" />
            Upcoming Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ACHIEVEMENTS.filter(achievement => !badges.includes(achievement.id)).map((achievement) => {
              let progress = 0;
              let progressText = "";
              
              if (achievement.id === 'streak_7') {
                progress = Math.min((currentStreak / 7) * 100, 100);
                progressText = `${currentStreak}/7 days`;
              } else if (achievement.id === 'level_5') {
                progress = Math.min((level / 5) * 100, 100);
                progressText = `Level ${level}/5`;
              } else if (achievement.id === 'perfect_week') {
                progress = Math.min((currentStreak / 7) * 100, 100);
                progressText = `${Math.min(currentStreak, 7)}/7 perfect days`;
              } else if (achievement.id === 'first_month') {
                progress = Math.min((currentStreak / 30) * 100, 100);
                progressText = `${currentStreak}/30 days`;
              }
              
              return (
                <div key={achievement.id} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white">{achievement.title}</h4>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                      +{achievement.xp} XP
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{progressText}</span>
                      <span className="text-purple-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/40 max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Crown className="w-full h-full text-yellow-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">Level Up!</h2>
                <p className="text-xl text-white mb-4">You've reached Level {level}!</p>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <span className="text-emerald-400">New abilities unlocked!</span>
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Earned Animation */}
      <AnimatePresence>
        {showBadgeEarned && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-4 right-4 z-50"
            onAnimationComplete={() => {
              setTimeout(() => setShowBadgeEarned(null), 2000);
            }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="font-bold text-white">Badge Earned!</p>
                    <p className="text-sm text-yellow-400">
                      {BADGES[showBadgeEarned as keyof typeof BADGES]?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}