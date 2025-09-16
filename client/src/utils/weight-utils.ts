import type { User } from '@/types';

/**
 * Safely get the target weight prioritizing FFMI-calculated target over manual goal
 */
export function getTargetWeight(user: User | null | undefined): number {
  if (!user) return 0;
  
  // Prioritize scientifically calculated FFMI target
  const calculatedTarget = user.calculatedTargetWeight ? Number(user.calculatedTargetWeight) : 0;
  if (calculatedTarget > 0) {
    return calculatedTarget;
  }
  
  // Fallback to manual goal weight
  const manualGoal = user.goalWeight ? Number(user.goalWeight) : 0;
  if (manualGoal > 0) {
    return manualGoal;
  }
  
  // Final fallback - height-based estimate (BMI ~23)
  const heightInM = user.height ? Number(user.height) / 100 : 1.75;
  const estimatedWeight = 23 * heightInM * heightInM;
  return Math.round(estimatedWeight);
}

/**
 * Safely calculate progress percentage with division by zero protection
 */
export function safeProgressCalculation(
  startWeight: number | null | undefined,
  currentWeight: number | null | undefined, 
  targetWeight: number | null | undefined
): number {
  // Validate inputs
  if (!startWeight || !currentWeight || !targetWeight) return 0;
  if (startWeight <= 0 || currentWeight <= 0 || targetWeight <= 0) return 0;
  
  const totalGain = targetWeight - startWeight;
  const currentGain = currentWeight - startWeight;
  
  // Handle edge cases
  if (totalGain <= 0) {
    // If target is same or less than start, consider achieved if current >= target
    return currentWeight >= targetWeight ? 100 : 0;
  }
  
  // Calculate progress with bounds
  const progress = (currentGain / totalGain) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Get estimated weeks to reach target weight at 1kg/week rate
 */
export function getWeeksToTarget(
  currentWeight: number | null | undefined,
  targetWeight: number | null | undefined
): number | null {
  if (!currentWeight || !targetWeight || targetWeight <= currentWeight) {
    return null;
  }
  
  const remainingWeight = targetWeight - currentWeight;
  const weeksToGoal = remainingWeight / 1.0; // 1kg per week target
  return Math.max(0, Math.ceil(weeksToGoal));
}

/**
 * Check if user has FFMI-based scientific goals set up
 */
export function hasFFMIGoals(user: User | null | undefined): boolean {
  if (!user) return false;
  
  const hasTarget = user.calculatedTargetWeight && Number(user.calculatedTargetWeight) > 0;
  const hasFFMI = user.targetFFMI && Number(user.targetFFMI) > 0;
  const hasBodyFat = user.bodyFatPercentage && Number(user.bodyFatPercentage) > 0;
  
  return !!(hasTarget && hasFFMI && hasBodyFat);
}

/**
 * Get current FFMI status text for display
 */
export function getFFMIStatusText(user: User | null | undefined): string {
  if (!user) return 'No user data';
  
  if (hasFFMIGoals(user)) {
    const targetFFMI = user.targetFFMI ? Number(user.targetFFMI) : 0;
    return `FFMI ${targetFFMI.toFixed(1)} target • Scientific plan`;
  }
  
  if (user.goalWeight) {
    return 'Manual goal set • Consider scientific FFMI setup';
  }
  
  return 'No goals set • Setup FFMI for optimal results';
}