import { useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DailyRoutine, DailyRoutineCompletion } from "@shared/schema";

// Memoized Level Progress Card Component
export const LevelProgressCard = memo(function LevelProgressCard() {
  const userId = localStorage.getItem("userId") || "user1";
  
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: () => fetch(`/api/user-stats/${userId}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!userStats) return null;

  const level = userStats.level || 1;
  const currentXP = userStats.totalPoints || 0;
  const xpProgress = currentXP % 100;
  const progressPercent = (xpProgress / 100) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-400/30 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="text-white font-semibold">Level {level}</span>
          </div>
          <div className="text-purple-300 text-sm font-medium">
            {currentXP} XP
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-purple-300/70">
            <span>{xpProgress} / 100 XP</span>
            <span>Next Level</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-purple-900/50"
          />
        </div>
        
        {currentXP > 0 && (
          <p className="text-xs text-purple-300/70 mt-2">
            🎯 Keep completing routines to level up!
          </p>
        )}
      </CardContent>
    </Card>
  );
});

// Memoized Quick Stats Component
export const QuickStatsCard = memo(function QuickStatsCard({ 
  totalRoutines, 
  completedToday 
}: { 
  totalRoutines: number; 
  completedToday: number; 
}) {
  return (
    <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-400/20 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-white font-semibold">Today's Progress</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs">
            {completedToday}/{totalRoutines}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

// Optimized Routine Item Component
export const RoutineItem = memo(function RoutineItem({
  routine,
  isCompleted,
  isCompleting,
  onToggleCompletion,
  onEdit,
  onDelete,
  categoryIcon,
  categoryColor,
  index
}: {
  routine: DailyRoutine;
  isCompleted: boolean;
  isCompleting: boolean;
  onToggleCompletion: (routine: DailyRoutine, e: React.MouseEvent) => void;
  onEdit: (routine: DailyRoutine) => void;
  onDelete: (routine: DailyRoutine) => void;
  categoryIcon: string;
  categoryColor: string;
  index: number;
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    onToggleCompletion(routine, e);
  }, [routine, onToggleCompletion]);

  const handleEdit = useCallback(() => {
    onEdit(routine);
  }, [routine, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(routine);
  }, [routine, onDelete]);

  return (
    <Card
      className={`bg-gradient-to-br ${categoryColor} backdrop-blur-sm transition-all duration-300 animate-routine-slide-in ${
        isCompleted 
          ? 'ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-400/20' 
          : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg cursor-pointer'
      } ${isCompleting ? 'animate-pulse' : ''}`}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between min-h-[3rem]">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-lg flex-shrink-0">{categoryIcon}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-sm leading-5 ${
                isCompleted ? 'text-emerald-400 line-through' : 'text-white'
              }`}>
                {routine.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">+{routine.points} points</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCompleted && (
              <div className="flex items-center gap-1 text-emerald-400 animate-fadeIn">
                <span className="text-xs font-semibold">Done!</span>
              </div>
            )}
            {isCompleting && !isCompleted && (
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="text-xs font-semibold">Completing...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Loading Skeleton Component
export const RoutinesSkeleton = memo(function RoutinesSkeleton() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        Daily Routines
      </h3>
      <div className="animate-pulse space-y-2">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
});