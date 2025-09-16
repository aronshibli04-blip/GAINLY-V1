import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FFMICalculation, User } from "@shared/schema";

// Types for FFMI API responses
export interface FFMIData {
  gender: string | null;
  bodyFatPercentage: string | null;
  targetFFMI: string | null;
  calculatedTargetWeight: string | null;
  currentWeight: string | null;
  height: string | null;
}

export interface FFMIRecommendation {
  ffmi: number;
  description: string;
  timelineMonths: number;
  difficulty: string;
}

export interface FFMIRecommendations {
  currentFFMI: number;
  classification: string;
  recommendedGoals: FFMIRecommendation[];
}

// Hook to fetch user's current FFMI data
export function useFFMIData(userId: string | null) {
  return useQuery<FFMIData>({
    queryKey: ['/api/users', userId, 'ffmi'],
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - FFMI data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to fetch FFMI calculation history
export function useFFMIHistory(userId: string | null, limit?: number) {
  return useQuery<FFMICalculation[]>({
    queryKey: ['/api/users', userId, 'ffmi-history', limit],
    queryFn: () => {
      const url = `/api/users/${userId}/ffmi-history${limit ? `?limit=${limit}` : ''}`;
      return fetch(url).then(res => res.json());
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook to get FFMI recommendations
export function useFFMIRecommendations(age: number | null, gender: string | null, currentFFMI: number | null) {
  return useQuery<FFMIRecommendations>({
    queryKey: ['/api/ffmi/recommendations', age, gender, currentFFMI],
    queryFn: () => {
      const params = new URLSearchParams({
        age: age?.toString() || '',
        gender: gender || '',
        currentFFMI: currentFFMI?.toString() || ''
      });
      return fetch(`/api/ffmi/recommendations?${params}`).then(res => res.json());
    },
    enabled: !!(age && gender && currentFFMI),
    staleTime: 15 * 60 * 1000, // 15 minutes - recommendations are stable
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to update user's FFMI profile
export function useUpdateFFMIProfile(userId: string | null) {
  return useMutation({
    mutationFn: async (updates: {
      gender?: string;
      bodyFatPercentage?: string | number | null;
      targetFFMI?: string | number | null;
      calculatedTargetWeight?: string | number | null;
    }) => {
      const response = await apiRequest('PUT', `/api/users/${userId}/ffmi-profile`, updates);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'ffmi'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    },
    onError: (error) => {
      console.error('Failed to update FFMI profile:', error);
    },
  });
}

// Mutation hook to calculate and save FFMI
export function useFFMICalculation() {
  return useMutation({
    mutationFn: async (calculationData: {
      userId: string;
      weight: string | number;
      height: string | number;
      bodyFatPercentage: string | number;
      calculatedFFMI: string | number;
      targetFFMI?: string | number | null;
      targetWeight?: string | number | null;
      timelineMonths?: number;
      calculationDate: string;
    }) => {
      const response = await apiRequest('POST', '/api/ffmi/calculate', calculationData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to show new calculation
      queryClient.invalidateQueries({ queryKey: ['/api/users', variables.userId, 'ffmi-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', variables.userId, 'ffmi'] });
    },
    onError: (error) => {
      console.error('Failed to save FFMI calculation:', error);
    },
  });
}

// Combined hook that fetches all FFMI-related data for a user
export function useFFMIComplete(userId: string | null) {
  const ffmiData = useFFMIData(userId);
  const ffmiHistory = useFFMIHistory(userId, 10); // Last 10 calculations
  
  // Extract values for recommendations
  const age = ffmiData.data?.height ? 25 : null; // TODO: Get actual age from user data
  const gender = ffmiData.data?.gender as 'male' | 'female' | null;
  const currentFFMI = ffmiHistory.data?.[0]?.calculatedFFMI ? 
    parseFloat(ffmiHistory.data[0].calculatedFFMI) : null;
  
  const recommendations = useFFMIRecommendations(age, gender, currentFFMI);
  
  return {
    ffmiData: ffmiData.data,
    ffmiHistory: ffmiHistory.data,
    recommendations: recommendations.data,
    isLoading: ffmiData.isLoading || ffmiHistory.isLoading || recommendations.isLoading,
    hasError: ffmiData.error || ffmiHistory.error || recommendations.error,
  };
}