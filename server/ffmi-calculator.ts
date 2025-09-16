/**
 * FFMI Calculator Service
 * 
 * Fat-Free Mass Index (FFMI) calculator for scientific goal setting.
 * FFMI = Lean Body Mass (kg) / Height (m)²
 * 
 * References:
 * - Kouri et al. (1995): Fat-free mass index in users and nonusers of anabolic-androgenic steroids
 * - Typical natural ranges: 16-25 FFMI, with 22+ being exceptional
 */

export interface FFMIGoal {
  ffmi: number;
  targetWeight: number;
  description: string;
  timelineMonths: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
}

export interface FFMIRecommendation {
  currentFFMI: number;
  recommendedGoals: FFMIGoal[];
  classification: string;
}

export class FFMICalculatorService {
  /**
   * Calculate current FFMI based on weight, height and body fat percentage
   */
  static calculateCurrentFFMI(
    weight: number, // kg
    height: number, // cm
    bodyFatPercentage: number // percentage (e.g., 15 for 15%)
  ): number {
    // Input validation
    if (weight <= 0 || height <= 0 || bodyFatPercentage < 0 || bodyFatPercentage >= 100) {
      throw new Error('Invalid input parameters for FFMI calculation');
    }

    // Convert height from cm to meters
    const heightM = height / 100;
    
    // Calculate lean body mass
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    
    // Calculate FFMI
    const ffmi = leanBodyMass / (heightM * heightM);
    
    return Math.round(ffmi * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate target weight needed to achieve a specific FFMI
   */
  static calculateTargetWeight(
    targetFFMI: number,
    height: number, // cm
    bodyFatPercentage: number // percentage
  ): number {
    // Input validation
    if (targetFFMI <= 0 || height <= 0 || bodyFatPercentage < 0 || bodyFatPercentage >= 100) {
      throw new Error('Invalid input parameters for target weight calculation');
    }

    // Convert height from cm to meters
    const heightM = height / 100;
    
    // Calculate required lean body mass
    const requiredLeanBodyMass = targetFFMI * (heightM * heightM);
    
    // Calculate total weight needed (accounting for body fat)
    const targetWeight = requiredLeanBodyMass / (1 - bodyFatPercentage / 100);
    
    return Math.round(targetWeight * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get recommended FFMI goals based on user profile
   */
  static getRecommendedFFMI(
    age: number,
    gender: 'male' | 'female',
    currentFFMI: number,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): FFMIRecommendation {
    // Gender adjustments - women typically have 2-3 lower FFMI for same visual appearance
    const genderAdjustment = gender === 'female' ? -2.5 : 0;
    const baseFFMI = currentFFMI + genderAdjustment;

    // Age factor - muscle building slows after 25, significantly after 35
    let ageFactor = 1;
    if (age > 35) ageFactor = 0.7;
    else if (age > 25) ageFactor = 0.85;

    // Classification
    let classification = 'Untrained';
    if (baseFFMI >= 24) classification = 'Genetic Elite';
    else if (baseFFMI >= 22) classification = 'Outstanding';
    else if (baseFFMI >= 20) classification = 'Excellent';
    else if (baseFFMI >= 18) classification = 'Good Development';
    else if (baseFFMI >= 16) classification = 'Beginner Progress';

    // Generate goals based on current level
    const goals: FFMIGoal[] = [];
    
    // Conservative goal (+1-2 FFMI points)
    if (baseFFMI < 23) {
      const conservativeTarget = Math.min(baseFFMI + 2, 22);
      goals.push({
        ffmi: conservativeTarget - genderAdjustment,
        targetWeight: 0, // Will be calculated when height/bf% are known
        description: gender === 'female' ? 'Lean Athletic Build' : 'Solid Muscular Physique',
        timelineMonths: Math.ceil((conservativeTarget - baseFFMI) * 6 / ageFactor),
        difficultyLevel: baseFFMI < 18 ? 'beginner' : 'intermediate'
      });
    }

    // Ambitious goal (+3-4 FFMI points)
    if (baseFFMI < 22) {
      const ambitiousTarget = Math.min(baseFFMI + 4, 23);
      goals.push({
        ffmi: ambitiousTarget - genderAdjustment,
        targetWeight: 0,
        description: gender === 'female' ? 'Athletic Competitor Level' : 'Impressive Muscular Development',
        timelineMonths: Math.ceil((ambitiousTarget - baseFFMI) * 8 / ageFactor),
        difficultyLevel: 'intermediate'
      });
    }

    // Elite goal (+5+ FFMI points)
    if (baseFFMI < 21 && experienceLevel !== 'beginner') {
      const eliteTarget = Math.min(baseFFMI + 6, 24);
      goals.push({
        ffmi: eliteTarget - genderAdjustment,
        targetWeight: 0,
        description: gender === 'female' ? 'Elite Natural Physique' : 'Near Genetic Potential',
        timelineMonths: Math.ceil((eliteTarget - baseFFMI) * 10 / ageFactor),
        difficultyLevel: 'elite'
      });
    }

    return {
      currentFFMI: currentFFMI,
      recommendedGoals: goals,
      classification
    };
  }

  /**
   * Estimate timeline to reach target FFMI based on age and current level
   */
  static estimateTimeline(
    currentFFMI: number,
    targetFFMI: number,
    age: number,
    gender: 'male' | 'female' = 'male'
  ): number {
    const ffmiGap = targetFFMI - currentFFMI;
    
    if (ffmiGap <= 0) return 0;

    // Base rate: ~0.5 FFMI points per 6 months for beginners
    // Decreases as FFMI increases (harder to build muscle at higher levels)
    let baseRate = 0.5; // FFMI points per 6 months
    
    if (currentFFMI >= 22) baseRate = 0.15; // Very slow at high levels
    else if (currentFFMI >= 20) baseRate = 0.25; // Intermediate rate
    else if (currentFFMI >= 18) baseRate = 0.35; // Slower than beginner

    // Age adjustments
    let ageMultiplier = 1;
    if (age > 35) ageMultiplier = 1.5; // Takes 50% longer
    else if (age > 25) ageMultiplier = 1.2; // Takes 20% longer

    // Gender adjustment - women build muscle slightly slower
    const genderMultiplier = gender === 'female' ? 1.15 : 1;

    // Calculate months needed
    const monthsNeeded = (ffmiGap / baseRate) * 6 * ageMultiplier * genderMultiplier;
    
    return Math.ceil(monthsNeeded);
  }

  /**
   * Validate FFMI inputs and handle edge cases
   */
  static validateInputs(weight: number, height: number, bodyFat: number, age: number): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Critical errors
    if (weight <= 30 || weight > 300) errors.push('Weight must be between 30-300kg');
    if (height <= 120 || height > 250) errors.push('Height must be between 120-250cm');
    if (bodyFat < 3 || bodyFat > 60) errors.push('Body fat must be between 3-60%');
    if (age < 16 || age > 80) errors.push('Age must be between 16-80 years');

    // Warnings for extreme but possible values
    if (bodyFat < 8) warnings.push('Very low body fat - ensure accurate measurement');
    if (bodyFat > 35) warnings.push('High body fat may affect FFMI accuracy');
    if (height < 150 || height > 210) warnings.push('Extreme height - FFMI may need adjustment');
    if (age > 50) warnings.push('Muscle building timeline may be longer at this age');

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}