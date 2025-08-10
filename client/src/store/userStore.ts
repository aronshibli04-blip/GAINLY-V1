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
  skipToNextDay: () => void;
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

      skipToNextDay: () => {
        const state = get();
        if (!state.user) return;

        // Get the latest date that has data, or today if no data
        const allDates = [
          ...state.weightEntries.map(e => e.date),
          ...state.calorieEntries.map(e => e.date),
          ...state.activityEntries.map(e => e.date)
        ];
        
        const latestDate = allDates.length > 0 
          ? new Date(Math.max(...allDates.map(d => new Date(d).getTime())))
          : new Date();
        
        // Calculate next day
        const nextDay = new Date(latestDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDateString = nextDay.toISOString().split('T')[0];

        // Generate realistic test data for the next day
        const baseWeight = state.user.weight;
        const weightVariation = (Math.random() - 0.5) * 0.6; // ±0.3kg variation
        const simulatedWeight = baseWeight + weightVariation;

        const baseCalories = 2800; // Typical bulking calories
        const calorieVariation = Math.floor((Math.random() - 0.5) * 600); // ±300 calorie variation
        const simulatedCalories = baseCalories + calorieVariation;

        // Add simulated weight entry
        const weightEntry: WeightEntry = {
          id: `sim-weight-${Date.now()}`,
          userId: state.user.id,
          weight: Math.round(simulatedWeight * 10) / 10, // Round to 1 decimal
          date: nextDateString,
          createdAt: nextDay.toISOString(),
        };

        // Add simulated calorie entries (breakfast, lunch, dinner)
        const mealCalories = [
          Math.floor(simulatedCalories * 0.25), // Breakfast ~25%
          Math.floor(simulatedCalories * 0.35), // Lunch ~35%  
          Math.floor(simulatedCalories * 0.4),  // Dinner ~40%
        ];

        const mealDescriptions = [
          'Oatmeal with banana and peanut butter',
          'Chicken rice bowl with vegetables',
          'Beef pasta with olive oil and cheese'
        ];

        const calorieEntries: CalorieEntry[] = mealCalories.map((calories, index) => ({
          id: `sim-calories-${Date.now()}-${index}`,
          userId: state.user!.id,
          calories,
          description: mealDescriptions[index],
          date: nextDateString,
          createdAt: nextDay.toISOString(),
        }));

        // Add simulated activity entry
        const activityTypes: ('light' | 'moderate' | 'heavy')[] = ['light', 'moderate', 'heavy'];
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const activityValue = randomActivity === 'light' ? 1 : randomActivity === 'moderate' ? 1.5 : 2;

        const activityEntry: ActivityEntry = {
          id: `sim-activity-${Date.now()}`,
          userId: state.user.id,
          type: randomActivity,
          value: activityValue,
          date: nextDateString,
          createdAt: nextDay.toISOString(),
        };

        // Update state with simulated data
        set(state => ({
          weightEntries: [...state.weightEntries, weightEntry].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          calorieEntries: [...state.calorieEntries, ...calorieEntries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          activityEntries: [...state.activityEntries, activityEntry].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }));

        // Check if we should transition to next phase
        const updatedState = get();
        if (updatedState.currentPhase === 'calibration') {
          const uniqueWeightDays = new Set(updatedState.weightEntries.map(e => e.date)).size;
          const uniqueCalorieDays = new Set(updatedState.calorieEntries.map(e => e.date)).size;
          
          if (uniqueWeightDays >= 7 && uniqueCalorieDays >= 7) {
            set({ currentPhase: 'meal_planning' });
          }
        }
      },
    }),
    {
      name: 'hardgainer-storage',
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