import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Frontend types for compatibility with existing UI
import { 
  User, 
  WeightEntry, 
  CalorieEntry, 
  ActivityEntry, 
  TdeeAnalysis, 
  MealPlan,
  UserPhase
} from '../types';
import { SubscriptionStatus, mockSubscriptionService, SubscriptionType } from '@/utils/tiers';

interface UserState {
  // User data
  user: User | null;
  isOnboarded: boolean;
  
  // Helper method to safely access user properties
  getUserProperty: (property: string) => any;
  
  // Tracking data
  weightEntries: WeightEntry[];
  calorieEntries: CalorieEntry[];
  activityEntries: ActivityEntry[];
  
  // Analysis data
  currentTdeeAnalysis: TdeeAnalysis | null;
  mealPlans: MealPlan[];
  
  // Subscription & Tier data
  subscription: SubscriptionStatus;
  
  // Gamification data
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  
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
  
  // Subscription actions
  upgradeSubscription: (type: SubscriptionType) => void;
  startTrial: () => void;
  cancelSubscription: () => void;
  
  // Gamification actions  
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addBadge: (badgeId: string) => void;
  
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
      
      // Subscription & tier initial state
      subscription: { tier: 'free' },
      
      // Gamification initial state
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
      
      isLoading: false,
      currentPhase: 'onboarding',

      // Helper method to safely access user properties
      getUserProperty: (property: string) => {
        const state = get();
        return state.user?.[property as keyof User] || null;
      },

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

      // Subscription actions
      upgradeSubscription: (type) => {
        const state = get();
        const userId = state.user?.id || 'user1';
        const subscription = mockSubscriptionService.upgradeToPremium(userId, type);
        set({ subscription });
      },

      startTrial: () => {
        const state = get();
        const userId = state.user?.id || 'user1';
        const subscription = mockSubscriptionService.startTrial(userId);
        set({ subscription });
      },

      cancelSubscription: () => {
        const state = get();
        const userId = state.user?.id || 'user1';
        const subscription = mockSubscriptionService.cancelSubscription(userId);
        set({ subscription });
      },

      // Gamification actions
      addXp: (amount) => {
        set(state => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / 1000) + 1;
          return { 
            xp: newXp, 
            level: Math.max(newLevel, state.level) 
          };
        });
      },

      incrementStreak: () => {
        set(state => ({
          currentStreak: state.currentStreak + 1,
          longestStreak: Math.max(state.longestStreak, state.currentStreak + 1)
        }));
      },

      resetStreak: () => {
        set({ currentStreak: 0 });
      },

      addBadge: (badgeId) => {
        set(state => ({
          badges: state.badges.includes(badgeId) 
            ? state.badges 
            : [...state.badges, badgeId]
        }));
      },

      clearUserData: async () => {
        try {
          // COMPREHENSIVE USER DATA RESET - Added for "Reset App" functionality
          console.log('🗑️ Starting complete user data reset...');
          
          // 1. CLEAR ALL LOCALSTORAGE DATA (including main persistence key)
          // This is critical - must clear the main Zustand persistence key first
          localStorage.removeItem('gainly-user-storage'); // Main persistence key
          
          // Clear any other GAINLY-related keys that might exist
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.includes('gainly') || key?.includes('hardgainer') || key?.includes('test-') || key?.includes('demo-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          console.log(`✅ Cleared ${keysToRemove.length + 1} localStorage keys`);
          
          // 2. CLEAR DATABASE RECORDS (level, XP, all tracking data)
          // Call backend API to clear ALL user data from database
          const currentUser = get().user;
          if (currentUser?.id) {
            try {
              const response = await fetch('/api/clear-all-user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
              });
              
              if (response.ok) {
                const result = await response.json();
                console.log('✅ Database cleared:', result.message);
              } else {
                console.warn('⚠️ Database clear failed, but continuing with frontend reset');
              }
            } catch (dbError) {
              console.warn('⚠️ Database API call failed, but continuing with frontend reset:', dbError);
            }
          }
          
          // 3. RESET ZUSTAND STATE TO INITIAL VALUES
          // Reset ALL state to initial values, ensuring level = 1
          set({
            user: null,
            isOnboarded: false,
            weightEntries: [],
            calorieEntries: [],
            activityEntries: [],
            currentTdeeAnalysis: null,
            mealPlans: [],
            subscription: { tier: 'free' },
            xp: 0,
            level: 1, // CRITICAL: Always start at level 1
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            currentPhase: 'onboarding',
            isLoading: false
          });
          
          console.log('🎉 Complete user data reset finished! User will start at level 1.');
          
        } catch (error) {
          console.error('❌ Error during user data reset:', error);
          // Even if there's an error, still reset the frontend state
          set({
            user: null,
            isOnboarded: false,
            weightEntries: [],
            calorieEntries: [],
            activityEntries: [],
            currentTdeeAnalysis: null,
            mealPlans: [],
            subscription: { tier: 'free' },
            xp: 0,
            level: 1, // CRITICAL: Always start at level 1
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            currentPhase: 'onboarding',
            isLoading: false
          });
        }
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
        subscription: state.subscription,
        xp: state.xp,
        level: state.level,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        badges: state.badges,
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