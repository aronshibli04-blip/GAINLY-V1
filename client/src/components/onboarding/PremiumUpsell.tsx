import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Check, 
  Zap, 
  Utensils, 
  ShoppingCart, 
  Dumbbell, 
  BarChart3, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";
import { PRICING, formatPrice, SubscriptionType } from "@/utils/tiers";

interface PremiumUpsellProps {
  onUpgrade: (type: SubscriptionType) => void;
  onContinueFree: () => void;
}

export function PremiumUpsell({ onUpgrade, onContinueFree }: PremiumUpsellProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType>('yearly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const features = [
    {
      icon: Utensils,
      title: "Personalized Meal Plans",
      description: "Personalized daily meal plans based on your exact TDEE and preferences",
      premium: true
    },
    {
      icon: ShoppingCart,
      title: "Grocery Lists",
      description: "Automated shopping lists with meal prep guides and cost optimization",
      premium: true
    },
    {
      icon: Dumbbell,
      title: "Adaptive Training Programs",
      description: "Science-based training programs with automatic progressive overload",
      premium: true
    },
    {
      icon: BarChart3,
      title: "Realistic 3D Body Visualization",
      description: "Visualize your progress with body transformation estimates",
      premium: true
    },
    {
      icon: Sparkles,
      title: "Monthly Plan Updates",
      description: "Your plan gets updated based on your progress and data",
      premium: true
    },
    {
      icon: Trophy,
      title: "Premium Badges & Challenges",
      description: "Exclusive achievements and personalized challenges to keep you motivated",
      premium: true
    }
  ];

  const plans = [
    {
      type: 'monthly' as SubscriptionType,
      name: 'Monthly',
      price: PRICING.monthly,
      period: '/month',
      description: 'Perfect for getting started',
      highlight: false
    },
    {
      type: 'yearly' as SubscriptionType,
      name: 'Yearly',
      price: PRICING.yearly,
      period: '/year',
      description: 'Most popular - Save 30%',
      highlight: true,
      monthlyEquivalent: PRICING.yearly / 12
    },
    {
      type: 'lifetime' as SubscriptionType,
      name: 'Lifetime',
      price: PRICING.lifetime,
      period: 'once',
      description: "Founder's offer - Limited time",
      highlight: false,
      badge: 'Limited'
    }
  ];

  const handleUpgrade = async (type: SubscriptionType) => {
    setIsUpgrading(true);
    // Simulate upgrade process
    setTimeout(() => {
      onUpgrade(type);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-md mx-auto md:max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6"
          >
            <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-xl">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-black" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 px-2"
          >
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Upgrade to Premium
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-yellow-300/80 mb-2 px-2"
          >
            Unlock Your Full Potential
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-slate-400 px-2"
          >
            Transform faster with features designed for serious hardgainers
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-yellow-400/20 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-base md:text-lg">{feature.title}</h3>
                    <p className="text-sm md:text-base text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 text-yellow-400 px-2">Choose Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-sm mx-auto md:max-w-4xl">
            {plans.map((plan) => (
              <Card 
                key={plan.type}
                className={`relative cursor-pointer transition-all duration-300 min-h-[280px] md:min-h-[320px] ${
                  plan.highlight 
                    ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-yellow-400/60 md:scale-105' 
                    : selectedPlan === plan.type
                      ? 'bg-slate-800/50 border-yellow-400/40'
                      : 'bg-slate-800/30 border-slate-700 hover:border-yellow-400/30'
                }`}
                onClick={() => setSelectedPlan(plan.type)}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.badge && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="border-orange-400 text-orange-400">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3 md:pb-4">
                  <CardTitle className="text-center">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl md:text-3xl font-black text-yellow-400">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-slate-400 ml-1 text-sm md:text-base">{plan.period}</span>
                    </div>
                    {plan.monthlyEquivalent && (
                      <p className="text-xs md:text-sm text-emerald-400 mt-1">
                        {formatPrice(plan.monthlyEquivalent)}/month
                      </p>
                    )}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-center text-slate-400 mb-4 text-sm md:text-base">{plan.description}</p>
                  
                  <div className="space-y-3">
                    {features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm md:text-base">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 mr-3 flex-shrink-0" />
                        <span className="text-slate-300">{feature.title}</span>
                      </div>
                    ))}
                    <div className="flex items-center text-sm md:text-base">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-slate-300">And 3 more premium features</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4 px-4"
        >
          <Button
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={isUpgrading}
            size="lg"
            className="w-full max-w-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-4 md:py-5 text-base md:text-lg rounded-xl shadow-2xl min-h-[56px] md:min-h-[60px]"
            data-testid="upgrade-premium-cta"
          >
            {isUpgrading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Upgrade Now and Transform Faster
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            )}
          </Button>
          
          <Button
            onClick={onContinueFree}
            variant="ghost"
            size="lg"
            className="w-full max-w-sm text-slate-400 hover:text-white py-3 md:py-4 text-base md:text-lg min-h-[48px] md:min-h-[52px]"
            data-testid="continue-free-button"
          >
            Maybe Later - Continue with Free
          </Button>
          
          <div className="flex items-center justify-center text-sm md:text-base text-slate-500 mt-4 px-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
            <span className="text-center leading-relaxed">7-day free trial after completing your first streak</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}