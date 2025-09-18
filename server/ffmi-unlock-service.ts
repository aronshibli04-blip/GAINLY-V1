/**
 * FFMI Unlock Service
 * Implements unlock detection and management for progressive FFMI goal system
 */

import { 
  GoalProgression, 
  InsertGoalProgression, 
  User, 
  WeightLog, 
  MealLog 
} from "@shared/schema";
import { 
  UNLOCK_CRITERIA, 
  GoalUtils, 
  UnlockStatus 
} from "@shared/ffmi-goals";
import { FFMICalculatorService } from "./ffmi-calculator";
import { IStorage, storage } from "./storage";

export interface ConsistencyData {
  totalLoggingDays: number;
  weeklyLogCounts: number[];
  currentStreak: number;
  averageLogsPerWeek: number;
}

export interface UnlockAnalysis {
  eligible: boolean;
  progressCriterion: boolean;
  consistencyCriterion: boolean;
  currentFFMI: number;
  targetFFMI: number;
  consistencyDays: number;
  progressPercentage: number;
  daysUntilUnlock?: number;
  alreadyUnlocked?: boolean;
}

export class FFMIUnlockService {
  constructor(private storage: IStorage) {}

  /**
   * Check if user is eligible for elite goal unlock
   */
  async checkUnlockEligibility(userId: string): Promise<UnlockAnalysis> {
    const user = await this.storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Resolve target FFMI first (needed for both paths)
    const targetFFMI = user.initialGoalFFMI || user.targetFFMI;

    // Skip check if already unlocked or in expert mode
    if (user.eliteUnlocked || user.expertMode) {
      // Still compute actual criteria for UI/analytics accuracy
      let progressResult = { eligible: false, currentFFMI: 0, progressPercentage: 0 };
      let consistencyResult = { eligible: false, consistentDays: 0 };

      // Only compute progress if target FFMI exists
      if (targetFFMI) {
        progressResult = await this.checkProgressUnlock(userId, parseFloat(targetFFMI.toString()));
      }
      
      consistencyResult = await this.checkConsistencyUnlock(userId);
      
      return {
        eligible: true,
        progressCriterion: progressResult.eligible,
        consistencyCriterion: consistencyResult.eligible,
        currentFFMI: progressResult.currentFFMI,
        targetFFMI: targetFFMI ? parseFloat(targetFFMI.toString()) : 0,
        consistencyDays: consistencyResult.consistentDays,
        progressPercentage: progressResult.progressPercentage,
        alreadyUnlocked: true
      };
    }

    // Validate target FFMI for regular users
    if (!targetFFMI) {
      throw new Error('User has no goal FFMI set');
    }

    // Check progress criterion (within 1 FFMI point of goal)
    const progressResult = await this.checkProgressUnlock(userId, parseFloat(targetFFMI.toString()));
    
    // Check consistency criterion (90 days of consistent logging)
    const consistencyResult = await this.checkConsistencyUnlock(userId);

    // Apply unlock criteria based on configured mode
    const unlockMode = UNLOCK_CRITERIA.UNLOCK_MODE;
    const eligible = unlockMode === 'AND' 
      ? progressResult.eligible && consistencyResult.eligible
      : progressResult.eligible || consistencyResult.eligible;

    return {
      eligible,
      progressCriterion: progressResult.eligible,
      consistencyCriterion: consistencyResult.eligible,
      currentFFMI: progressResult.currentFFMI,
      targetFFMI: parseFloat(targetFFMI.toString()),
      consistencyDays: consistencyResult.consistentDays,
      progressPercentage: progressResult.progressPercentage,
      daysUntilUnlock: eligible ? 0 : this.calculateDaysUntilUnlock(consistencyResult.consistentDays)
    };
  }

  /**
   * Check progress-based unlock (within 1 FFMI point of goal)
   */
  private async checkProgressUnlock(
    userId: string, 
    targetFFMI: number
  ): Promise<{ eligible: boolean; currentFFMI: number; progressPercentage: number }> {
    const user = await this.storage.getUser(userId);
    if (!user || !user.height || !user.bodyFatPercentage) {
      return { eligible: false, currentFFMI: 0, progressPercentage: 0 };
    }

    // Get latest weight to calculate current FFMI
    const weightLogs = await this.storage.getWeightLogsByUser(userId, 1);
    if (weightLogs.length === 0) {
      return { eligible: false, currentFFMI: 0, progressPercentage: 0 };
    }

    const currentWeight = parseFloat(weightLogs[0].weight);
    const height = parseFloat(user.height.toString());
    const bodyFat = parseFloat(user.bodyFatPercentage.toString());

    const currentFFMI = FFMICalculatorService.calculateCurrentFFMI(
      currentWeight, 
      height, 
      bodyFat
    );

    const progressPercentage = GoalUtils.calculateProgressToGoal(currentFFMI, targetFFMI);
    const eligible = GoalUtils.isWithinUnlockThreshold(currentFFMI, targetFFMI);

    return {
      eligible,
      currentFFMI,
      progressPercentage
    };
  }

  /**
   * Check consistency-based unlock (90 consecutive days of logging + 5+ logs per week average)
   */
  private async checkConsistencyUnlock(
    userId: string
  ): Promise<{ eligible: boolean; consistentDays: number }> {
    const consistencyData = await this.calculateConsistencyStreak(userId);
    
    // Use actual consecutive days for eligibility (not inflated weekly multiplier)
    const eligible = consistencyData.currentStreak >= UNLOCK_CRITERIA.CONSISTENCY_DAYS &&
                    consistencyData.averageLogsPerWeek >= UNLOCK_CRITERIA.MIN_LOGS_PER_WEEK;

    return {
      eligible,
      consistentDays: consistencyData.currentStreak // Return actual consecutive days
    };
  }

  /**
   * Calculate consistency streak and logging patterns
   * Fixed algorithm: Uses continuous calendar days and proper weekly counting
   */
  async calculateConsistencyStreak(userId: string): Promise<ConsistencyData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 100); // Look back 100 days for analysis

    // Get all logs in date range
    const weightLogs = await this.storage.getWeightLogsByUser(userId, 200);
    const dailyCalories = await this.storage.getDailyCaloriesByUser(userId, 200);

    // Create a set of dates with any logging activity (weight OR meal)
    const activeDates = new Set<string>();

    // Filter and add weight log dates within range (normalize dates to YYYY-MM-DD)
    weightLogs.forEach(log => {
      const logDate = new Date(log.logDate);
      if (logDate >= startDate && logDate <= endDate) {
        const normalizedDate = logDate.toISOString().split('T')[0];
        activeDates.add(normalizedDate);
      }
    });

    // Filter and add meal log dates within range (normalize dates to YYYY-MM-DD)
    dailyCalories.forEach(day => {
      const logDate = new Date(day.logDate);
      if (logDate >= startDate && logDate <= endDate) {
        const normalizedDate = logDate.toISOString().split('T')[0];
        activeDates.add(normalizedDate);
      }
    });

    // Build continuous calendar array for last 100 days
    const dailyActivity: boolean[] = [];
    const dates: string[] = [];
    
    for (let i = 0; i < 100; i++) {
      const currentDate = new Date(endDate);
      currentDate.setDate(endDate.getDate() - i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      dates.unshift(dateString); // Add to beginning to maintain chronological order
      dailyActivity.unshift(activeDates.has(dateString));
    }

    // Calculate current streak (consecutive days from most recent backward)
    let currentStreak = 0;
    for (let i = dailyActivity.length - 1; i >= 0; i--) {
      if (dailyActivity[i]) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    // Calculate weekly patterns from MOST RECENT weeks backward (last 14 weeks)
    const weeklyLogCounts: number[] = [];
    const weeksToAnalyze = Math.min(14, Math.floor(dailyActivity.length / 7));
    
    // Start from the most recent complete week and work backward
    for (let week = 0; week < weeksToAnalyze; week++) {
      const weekStart = dailyActivity.length - ((week + 1) * 7); // Start from end
      const weekEnd = weekStart + 7;
      
      if (weekStart < 0) break; // Not enough data for full week
      
      // Count days with logs in this recent calendar week
      let daysLoggedThisWeek = 0;
      for (let day = weekStart; day < weekEnd; day++) {
        if (dailyActivity[day]) {
          daysLoggedThisWeek++;
        }
      }
      
      weeklyLogCounts.unshift(daysLoggedThisWeek); // Add to beginning for chronological order
    }

    // Calculate average logs per week over the analyzed period
    const averageLogsPerWeek = weeklyLogCounts.length > 0 
      ? weeklyLogCounts.reduce((sum, count) => sum + count, 0) / weeklyLogCounts.length 
      : 0;

    return {
      totalLoggingDays: currentStreak, // Return actual consecutive days, not inflated weeks
      weeklyLogCounts,
      currentStreak,
      averageLogsPerWeek: Math.round(averageLogsPerWeek * 10) / 10
    };
  }

  /**
   * Trigger elite unlock for user
   */
  async triggerUnlock(userId: string): Promise<void> {
    const analysis = await this.checkUnlockEligibility(userId);
    
    if (!analysis.eligible) {
      throw new Error('User is not eligible for unlock');
    }

    // Update user profile
    await this.storage.updateUser(userId, {
      eliteUnlocked: true,
      unlockDate: new Date()
    });

    // Update or create goal progression record
    await this.upsertGoalProgression(userId, {
      currentFFMI: analysis.currentFFMI.toString(),
      consistencyDays: analysis.consistencyDays,
      unlockEligible: true,
      progressToGoal: analysis.progressPercentage.toString()
    });
  }

  /**
   * Upsert goal progression record
   */
  async upsertGoalProgression(
    userId: string, 
    data: Partial<InsertGoalProgression>
  ): Promise<GoalProgression> {
    try {
      // Try to get existing record
      const existing = await this.storage.getGoalProgression(userId);
      
      if (existing) {
        // Update existing record - updatedAt handled by storage implementation
        return await this.storage.updateGoalProgression(userId, {
          currentFFMI: data.currentFFMI?.toString(),
          consistencyDays: data.consistencyDays,
          unlockEligible: data.unlockEligible,
          progressToGoal: data.progressToGoal?.toString(),
          weeklyLogCount: data.weeklyLogCount,
          lastConsistencyCheck: data.lastConsistencyCheck
        });
      } else {
        // Create new record
        return await this.storage.createGoalProgression({
          userId,
          currentFFMI: data.currentFFMI?.toString() || '0',
          consistencyDays: data.consistencyDays || 0,
          unlockEligible: data.unlockEligible || false,
          progressToGoal: data.progressToGoal?.toString() || '0',
          weeklyLogCount: data.weeklyLogCount || 0,
          lastConsistencyCheck: data.lastConsistencyCheck
        });
      }
    } catch (error) {
      throw new Error(`Failed to upsert goal progression: ${error}`);
    }
  }

  /**
   * Calculate days until unlock based on current consistency
   */
  private calculateDaysUntilUnlock(currentConsistentDays: number): number {
    const daysNeeded = UNLOCK_CRITERIA.CONSISTENCY_DAYS - currentConsistentDays;
    return Math.max(0, daysNeeded);
  }

  /**
   * Get unlock progress for UI display
   */
  async getUnlockProgress(userId: string): Promise<UnlockStatus> {
    const analysis = await this.checkUnlockEligibility(userId);
    
    return {
      eligible: analysis.eligible,
      criteriaMetProgress: analysis.progressCriterion,
      criteriaMetConsistency: analysis.consistencyCriterion,
      progressToGoal: analysis.progressPercentage,
      consistencyDays: analysis.consistencyDays,
      daysUntilUnlock: analysis.daysUntilUnlock
    };
  }

  /**
   * Check if user should see unlock celebration modal
   */
  async shouldShowUnlockModal(userId: string): Promise<boolean> {
    const user = await this.storage.getUser(userId);
    if (!user) return false;

    // Show modal if recently unlocked (within last 24 hours) and not expert mode
    if (user.eliteUnlocked && !user.expertMode && user.unlockDate) {
      const hoursSinceUnlock = (Date.now() - new Date(user.unlockDate).getTime()) / (1000 * 60 * 60);
      return hoursSinceUnlock < 24;
    }

    return false;
  }

  /**
   * Get suggested next goal after unlock
   */
  async getSuggestedNextGoal(userId: string): Promise<number | null> {
    const user = await this.storage.getUser(userId);
    if (!user || !user.eliteUnlocked) return null;

    const currentGoalFFMI = user.initialGoalFFMI || user.targetFFMI;
    if (!currentGoalFFMI) return null;

    const nextGoal = GoalUtils.getNextGoalAfterUnlock(parseFloat(currentGoalFFMI.toString()));
    return nextGoal ? nextGoal.ffmi : null;
  }
}

export const ffmiUnlockService = new FFMIUnlockService(storage);