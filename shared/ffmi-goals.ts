/**
 * FFMI Tiered Goal System Configuration
 * Implements progressive goal disclosure for optimal user psychology
 */

export interface FFMIGoal {
  ffmi: number;
  label: string;
  category: string;
  description: string;
  recommended?: boolean;
  color?: string;
}

export interface FFMIGoalTier {
  name: string;
  description: string;
  goals: FFMIGoal[];
}

/**
 * STANDARD TIER: The psychological safe path (FFMI 18-21)
 * Shown to all users initially to prevent overwhelm and ensure early wins
 */
export const STANDARD_GOALS: FFMIGoal[] = [
  { 
    ffmi: 18, 
    label: "Lean & Fit", 
    category: "Beginner", 
    description: "A healthy, lean physique with visible muscle definition",
    color: "emerald"
  },
  { 
    ffmi: 19, 
    label: "Lean & Strong", 
    category: "Beginner", 
    description: "Noticeably fit and athletic appearance",
    color: "emerald"
  },
  { 
    ffmi: 20, 
    label: "Athletic", 
    category: "Intermediate", 
    description: "Impressive natural physique with good muscle mass",
    color: "blue"
  },
  { 
    ffmi: 21, 
    label: "Athletic Peak", 
    category: "Intermediate", 
    description: "The recommended long-term goal for most dedicated trainees",
    recommended: true,
    color: "blue"
  }
];

/**
 * ACCELERATED TIER: Elite genetic potential (FFMI 22-24)
 * Unlocked after proving consistency or approaching current goal
 */
export const ACCELERATED_GOALS: FFMIGoal[] = [
  { 
    ffmi: 22, 
    label: "Advanced", 
    category: "Muscular", 
    description: "Exceptional muscle development requiring years of dedication",
    color: "purple"
  },
  { 
    ffmi: 23, 
    label: "Elite", 
    category: "Genetic Potential", 
    description: "Near genetic limits - achieved by few natural trainees",
    color: "purple"
  },
  { 
    ffmi: 24, 
    label: "Natural Ceiling", 
    category: "Genetic Potential", 
    description: "Maximum natural potential - extremely rare achievement",
    color: "red"
  }
];

/**
 * Complete goal configuration with tiers
 */
export const FFMI_GOAL_TIERS = {
  standard: {
    name: "Foundation Goals",
    description: "Build your base with achievable, confidence-building targets",
    goals: STANDARD_GOALS
  },
  accelerated: {
    name: "Elite Genetic Potential", 
    description: "Push your genetic limits with advanced physique goals",
    goals: ACCELERATED_GOALS
  }
} as const;

/**
 * Combined goals for expert mode users
 */
export const ALL_GOALS: FFMIGoal[] = [...STANDARD_GOALS, ...ACCELERATED_GOALS];

/**
 * Unlock criteria configuration
 */
export const UNLOCK_CRITERIA = {
  PROGRESS_THRESHOLD: 1.0,    // Within 1 FFMI point of current goal
  CONSISTENCY_DAYS: 90,       // 90 days of consistent logging  
  MIN_LOGS_PER_WEEK: 5,       // 5+ logs per week to count as consistent
  WEEKLY_CHECK_PERIOD: 7      // Check consistency over 7-day periods
} as const;

/**
 * Goal path types for user profile
 */
export type GoalPath = 'standard' | 'accelerated';

/**
 * Unlock status for elite goals
 */
export interface UnlockStatus {
  eligible: boolean;
  criteriaMetProgress: boolean;
  criteriaMetConsistency: boolean;
  progressToGoal: number;      // Percentage (0-100)
  consistencyDays: number;
  daysUntilUnlock?: number;
}

/**
 * Helper functions for goal management
 */
export const GoalUtils = {
  /**
   * Get goals for a specific path
   */
  getGoalsForPath(path: GoalPath): FFMIGoal[] {
    return FFMI_GOAL_TIERS[path].goals;
  },

  /**
   * Get all available goals based on unlock status
   */
  getAvailableGoals(eliteUnlocked: boolean, expertMode: boolean): FFMIGoal[] {
    if (expertMode || eliteUnlocked) {
      return ALL_GOALS;
    }
    return STANDARD_GOALS;
  },

  /**
   * Find goal by FFMI value
   */
  findGoalByFFMI(ffmi: number): FFMIGoal | undefined {
    return ALL_GOALS.find(goal => goal.ffmi === ffmi);
  },

  /**
   * Get recommended goal for new users
   */
  getRecommendedGoal(): FFMIGoal {
    return STANDARD_GOALS.find(goal => goal.recommended) || STANDARD_GOALS[STANDARD_GOALS.length - 1];
  },

  /**
   * Get next logical goal after unlock
   */
  getNextGoalAfterUnlock(currentGoalFFMI: number): FFMIGoal | undefined {
    // If user completed FFMI 21, suggest FFMI 22
    if (currentGoalFFMI === 21) {
      return ACCELERATED_GOALS.find(goal => goal.ffmi === 22);
    }
    // Otherwise, find next higher goal
    return ALL_GOALS.find(goal => goal.ffmi > currentGoalFFMI);
  },

  /**
   * Calculate progress to goal as percentage
   */
  calculateProgressToGoal(currentFFMI: number, targetFFMI: number): number {
    if (currentFFMI >= targetFFMI) return 100;
    if (currentFFMI <= 16) return 0; // Minimum baseline FFMI
    
    const totalRange = targetFFMI - 16;
    const currentProgress = currentFFMI - 16;
    return Math.round((currentProgress / totalRange) * 100);
  },

  /**
   * Check if user is within unlock threshold
   */
  isWithinUnlockThreshold(currentFFMI: number, targetFFMI: number): boolean {
    return (targetFFMI - currentFFMI) <= UNLOCK_CRITERIA.PROGRESS_THRESHOLD;
  }
};

/**
 * Goal tier styling for UI components
 */
export const GOAL_TIER_STYLES = {
  standard: {
    background: "from-emerald-500/20 to-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-300",
    accent: "text-blue-400"
  },
  accelerated: {
    background: "from-purple-500/20 to-red-500/20", 
    border: "border-purple-500/30",
    text: "text-purple-300",
    accent: "text-purple-400"
  }
} as const;