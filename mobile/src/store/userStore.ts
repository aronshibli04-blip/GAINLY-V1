import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WeightEntry, CalorieEntry, ActivityEntry, TdeeAnalysis, MealPlan } from '../types';

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
  currentPhase: 'onboarding' | 'calibration' | 'meal_planning' | 'tracking';
  
  // Actions
  setUser: (user: User) => void;
  completeOnboarding: () => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'createdAt'>) => void;
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id' | 'createdAt'>) => void;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id' | 'createdAt'>) => void;
  setTdeeAnalysis: (analysis: TdeeAnalysis) => void;
  addMealPlan: (mealPlan: MealPlan) => void;
  updatePhase: (phase: UserState['currentPhase']) => void;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
  clearUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
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
    get().saveUserData();
  },

  completeOnboarding: () => {
    set({ isOnboarded: true, currentPhase: 'calibration' });
    get().saveUserData();
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
    
    get().saveUserData();
    get().checkPhaseTransition();
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
    
    get().saveUserData();
    get().checkPhaseTransition();
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
    
    get().saveUserData();
  },

  setTdeeAnalysis: (analysis) => {
    set({ currentTdeeAnalysis: analysis });
    get().saveUserData();
  },

  addMealPlan: (mealPlan) => {
    set(state => ({
      mealPlans: [...state.mealPlans, mealPlan].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }));
    get().saveUserData();
  },

  updatePhase: (phase) => {
    set({ currentPhase: phase });
    get().saveUserData();
  },

  // Check if we should transition to next phase
  checkPhaseTransition: () => {
    const state = get();
    if (state.currentPhase === 'calibration') {
      const uniqueWeightDays = new Set(state.weightEntries.map(e => e.date)).size;
      const uniqueCalorieDays = new Set(state.calorieEntries.map(e => e.date)).size;
      
      if (uniqueWeightDays >= 7 && uniqueCalorieDays >= 7) {
        set({ currentPhase: 'meal_planning' });
        get().saveUserData();
      }
    }
  },

  // Persistence
  loadUserData: async () => {
    try {
      set({ isLoading: true });
      
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        set({
          user: parsedData.user,
          isOnboarded: parsedData.isOnboarded || false,
          weightEntries: parsedData.weightEntries || [],
          calorieEntries: parsedData.calorieEntries || [],
          activityEntries: parsedData.activityEntries || [],
          currentTdeeAnalysis: parsedData.currentTdeeAnalysis,
          mealPlans: parsedData.mealPlans || [],
          currentPhase: parsedData.currentPhase || 'onboarding',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveUserData: async () => {
    try {
      const state = get();
      const dataToSave = {
        user: state.user,
        isOnboarded: state.isOnboarded,
        weightEntries: state.weightEntries,
        calorieEntries: state.calorieEntries,
        activityEntries: state.activityEntries,
        currentTdeeAnalysis: state.currentTdeeAnalysis,
        mealPlans: state.mealPlans,
        currentPhase: state.currentPhase,
      };
      
      await AsyncStorage.setItem('@user_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  clearUserData: async () => {
    try {
      await AsyncStorage.removeItem('@user_data');
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
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },
}));

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