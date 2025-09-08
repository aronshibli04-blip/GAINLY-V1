// Tier management system for Free vs Premium
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionType = 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  type?: SubscriptionType;
  expiresAt?: Date;
  trialEndsAt?: Date;
  isTrialing?: boolean;
}

export interface PremiumFeatures {
  aiMealPlans: boolean;
  groceryLists: boolean;
  progressiveTraining: boolean;
  realisticBodyPreview: boolean;
  monthlyRecalibration: boolean;
  premiumBadges: boolean;
  aiChallenges: boolean;
  advancedAnalytics: boolean;
}

// Pricing configuration
export const PRICING = {
  monthly: 6.99,
  yearly: 59.99,
  lifetime: 99.99,
  yearlyDiscount: 30 // 30% discount
};

// Feature access logic
export const getFeatureAccess = (subscription: SubscriptionStatus): PremiumFeatures => {
  const isPremium = subscription.tier === 'premium' || 
                   (subscription.isTrialing === true && subscription.trialEndsAt && new Date() < subscription.trialEndsAt);

  return {
    aiMealPlans: !!isPremium,
    groceryLists: !!isPremium,
    progressiveTraining: !!isPremium,
    realisticBodyPreview: !!isPremium,
    monthlyRecalibration: !!isPremium,
    premiumBadges: !!isPremium,
    aiChallenges: !!isPremium,
    advancedAnalytics: !!isPremium,
  };
};

// Mock subscription management (replace with Stripe/RevenueCat later)
export const mockSubscriptionService = {
  // Check subscription status
  getSubscriptionStatus: (userId: string): SubscriptionStatus => {
    const stored = localStorage.getItem(`subscription_${userId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
        trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : undefined,
      };
    }
    
    // Default to free tier
    return { tier: 'free' };
  },

  // Start premium trial (7 days after streak completion)
  startTrial: (userId: string): SubscriptionStatus => {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    
    const subscription: SubscriptionStatus = {
      tier: 'free',
      isTrialing: true,
      trialEndsAt: trialEnd,
    };
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    return subscription;
  },

  // Upgrade to premium
  upgradeToPremium: (userId: string, type: SubscriptionType): SubscriptionStatus => {
    let expiresAt: Date | undefined;
    
    if (type === 'monthly') {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (type === 'yearly') {
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    // Lifetime has no expiration

    const subscription: SubscriptionStatus = {
      tier: 'premium',
      type,
      expiresAt,
      isTrialing: false,
    };
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    return subscription;
  },

  // Cancel subscription
  cancelSubscription: (userId: string): SubscriptionStatus => {
    const subscription: SubscriptionStatus = { tier: 'free' };
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    return subscription;
  },
};

// Helper functions
export const isPremiumUser = (subscription: SubscriptionStatus): boolean => {
  return getFeatureAccess(subscription).aiMealPlans; // Use any premium feature as indicator
};

export const getSubscriptionDisplayText = (subscription: SubscriptionStatus): string => {
  if (subscription.isTrialing) {
    return 'Premium Trial';
  }
  
  if (subscription.tier === 'premium') {
    if (subscription.type === 'lifetime') return 'Premium Lifetime';
    if (subscription.type === 'yearly') return 'Premium Yearly';
    if (subscription.type === 'monthly') return 'Premium Monthly';
  }
  
  return 'Free Plan';
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};