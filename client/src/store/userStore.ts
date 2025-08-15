import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  WeightEntry, 
  CalorieEntry, 
  ActivityEntry, 
  TdeeAnalysis, 
  MealPlan,
  UserPhase
} from '../types';

interface UserState {
  // User data
  user: User | null;
  isOnboarded: boolean;
  
  // Tracking data
  weightEntries: WeightEntry[];
  calorieEntries: CalorieEntry[];
  activityEntries: ActivityEntry[];
  
  // Analysis data
  currentTdeeAnalysis: TdeeAnalysis | null;
  mealPlans: MealPlan[];
  
  // UI state
  isLoading: boolean;
  currentPhase: UserPhase;
  
  // Actions
  setUser: (user: User) => void;
  setGoalWeight: (goalWeight: number) => void;
  completeOnboarding: () => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'createdAt'>) => void;
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id' | 'createdAt'>) => void;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => void;
  setTdeeAnalysis: (analysis: TdeeAnalysis) => void;
  addMealPlan: (mealPlan: MealPlan) => void;
  updatePhase: (phase: UserPhase) => void;
  clearUserData: () => void;
  setLoading: (loading: boolean) => void;
  // skipToNextDay removed - was generating fake test data
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isOnboarded: false,
      weightEntries: [],
      calorieEntries: [],
      activityEntries: [],
      currentTdeeAnalysis: null,
      mealPlans: [],
      isLoading: false,
      currentPhase: 'onboarding',

      // Actions
      setUser: (user) => {
        set({ user });
      },

      setGoalWeight: (goalWeight) => {
        set(state => ({
          user: state.user ? { ...state.user, goalWeight } : null
        }));
      },

      completeOnboarding: () => {
        set({ isOnboarded: true, currentPhase: 'calibration' });
      },

      addWeightEntry: (entry) => {
        const newEntry: WeightEntry = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          weightEntries: [...state.weightEntries, newEntry].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }));
        
        // Check if we should transition to next phase
        const state = get();
        if (state.currentPhase === 'calibration') {
          const uniqueWeightDays = new Set(state.weightEntries.map(e => e.date)).size;
          const uniqueCalorieDays = new Set(state.calorieEntries.map(e => e.date)).size;
          
          if (uniqueWeightDays >= 7 && uniqueCalorieDays >= 7) {
            set({ currentPhase: 'meal_planning' });
          }
        }
      },

      addCalorieEntry: (entry) => {
        const newEntry: CalorieEntry = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          calorieEntries: [...state.calorieEntries, newEntry].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }));
        
        // Check if we should transition to next phase
        const state = get();
        if (state.currentPhase === 'calibration') {
          const uniqueWeightDays = new Set(state.weightEntries.map(e => e.date)).size;
          const uniqueCalorieDays = new Set(state.calorieEntries.map(e => e.date)).size;
          
          if (uniqueWeightDays >= 7 && uniqueCalorieDays >= 7) {
            set({ currentPhase: 'meal_planning' });
          }
        }
      },

      addActivityEntry: (entry) => {
        const newEntry: ActivityEntry = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          activityEntries: [...state.activityEntries, newEntry].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }));
      },

      setTdeeAnalysis: (analysis) => {
        set({ currentTdeeAnalysis: analysis });
      },

      addMealPlan: (mealPlan) => {
        set(state => ({
          mealPlans: [...state.mealPlans, mealPlan].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }));
      },

      updatePhase: (phase) => {
        set({ currentPhase: phase });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearUserData: () => {
        // Clear localStorage completely to remove any lingering test data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes('gainly') || key?.includes('hardgainer')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        set({
          user: null,
          isOnboarded: false,
          weightEntries: [],
          calorieEntries: [],
          activityEntries: [],
          currentTdeeAnalysis: null,
          mealPlans: [],
          currentPhase: 'onboarding',
        });
      },

      // Removed skipToNextDay - was generating fake test data
    }),
    {
      name: 'gainly-user-storage',
      partialize: (state) => ({
        user: state.user,
        isOnboarded: state.isOnboarded,
        weightEntries: state.weightEntries,
        calorieEntries: state.calorieEntries,
        activityEntries: state.activityEntries,
        currentTdeeAnalysis: state.currentTdeeAnalysis,
        mealPlans: state.mealPlans,
        currentPhase: state.currentPhase,
      }),

    }
  )
);

// Helper hook for getting user progress
export const useUserProgress = () => {
  const { weightEntries, calorieEntries, activityEntries, user } = useUserStore();
  
  const uniqueWeightDays = new Set(weightEntries.map(e => e.date)).size;
  const uniqueCalorieDays = new Set(calorieEntries.map(e => e.date)).size;
  const uniqueActivityDays = new Set(activityEntries.map(e => e.date)).size;
  
  const averageWeight = weightEntries.length > 0 
    ? weightEntries.reduce((sum, entry) => sum + entry.weight, 0) / weightEntries.length
    : user?.weight || 0;
    
  const averageCalories = calorieEntries.length > 0
    ? calorieEntries.reduce((sum, entry) => sum + entry.calories, 0) / calorieEntries.length
    : 0;
  
  return {
    weightEntries: uniqueWeightDays,
    calorieEntries: uniqueCalorieDays,
    activityEntries: uniqueActivityDays,
    daysTracking: Math.max(uniqueWeightDays, uniqueCalorieDays),
    averageWeight,
    averageCalories,
    readyForAnalysis: uniqueWeightDays >= 7 && uniqueCalorieDays >= 7,
  };
};