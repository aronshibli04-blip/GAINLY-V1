import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useUserData() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress", userId],
    enabled: !!userId,
  });

  const { data: weightLogs, isLoading: weightLoading } = useQuery({
    queryKey: ["/api/weight-logs", userId],
    enabled: !!userId,
  });

  const { data: dailyCalories, isLoading: caloriesLoading } = useQuery({
    queryKey: ["/api/daily-calories", userId],
    enabled: !!userId,
  });

  const { data: aiAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/ai-analysis", userId],
    enabled: !!userId,
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
