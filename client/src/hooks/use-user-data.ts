import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useUserData() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  // Optimized queries with smart caching for better performance
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - user data rarely changes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress", userId],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - progress updates moderately
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const { data: weightLogs, isLoading: weightLoading } = useQuery({
    queryKey: ["/api/weight-logs", userId],
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - weight data more dynamic
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const { data: dailyCalories, isLoading: caloriesLoading } = useQuery({
    queryKey: ["/api/daily-calories", userId],
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - calorie data very dynamic
    gcTime: 2 * 60 * 1000, // 2 minutes cache
  });

  const { data: aiAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/ai-analysis", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - AI analysis expensive to generate
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  return {
    userId,
    user,
    progress,
    weightLogs,
    dailyCalories,
    aiAnalysis,
    isLoading: userLoading || progressLoading || weightLoading || caloriesLoading || analysisLoading,
  };
}
