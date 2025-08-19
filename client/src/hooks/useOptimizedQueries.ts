import { useQuery } from "@tanstack/react-query";
import type { DailyRoutine, DailyRoutineCompletion } from "@shared/schema";

// Optimized query hook for daily routines with better caching
export function useOptimizedRoutines(userId: string) {
  return useQuery<DailyRoutine[]>({
    queryKey: ['/api/daily-routines', userId],
    queryFn: () => fetch(`/api/daily-routines/${userId}`).then(res => res.json()),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces cacheTime in v5)
    refetchOnWindowFocus: false,
  });
}

// Optimized query hook for daily routine completions
export function useOptimizedCompletions(userId: string, date: string) {
  return useQuery<DailyRoutineCompletion[]>({
    queryKey: ['/api/daily-routine-completions', userId, date],
    queryFn: () => fetch(`/api/daily-routine-completions/${userId}/${date}`).then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

// Optimized query hook for user stats
export function useOptimizedUserStats(userId: string) {
  return useQuery({
    queryKey: ['/api/user-stats', userId],
    queryFn: () => fetch(`/api/user-stats/${userId}`).then(res => res.json()),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

// Optimized query hook for meal logs
export function useOptimizedMealLogs(userId: string, date: string) {
  return useQuery({
    queryKey: ['/api/meal-logs', userId, date],
    queryFn: () => fetch(`/api/meal-logs/${userId}/${date}`).then(res => res.json()),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}