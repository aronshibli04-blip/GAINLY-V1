import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Star, 
  Sparkles, 
  Target, 
  Zap,
  Award,
  CheckCircle2,
  Flame
} from "lucide-react";

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
  type?: "achievement" | "milestone" | "streak" | "goal";
  title: string;
  description?: string;
  points?: number;
}

const celebrationConfig = {
  achievement: {
    icon: Trophy,
    color: "text-yellow-400",
    bgColor: "from-yellow-400/20 to-amber-400/20",
    particles: "✨",
  },
  milestone: {
    icon: Target,
    color: "text-primary-cyan",
    bgColor: "from-primary-cyan/20 to-accent-mint/20",
    particles: "🎯",
  },
  streak: {
    icon: Flame,
    color: "text-orange-400",
    bgColor: "from-orange-400/20 to-red-400/20",
    particles: "🔥",
  },
  goal: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "from-emerald-400/20 to-green-400/20",
    particles: "🎉",
  },
};

export function CelebrationModal({
  show,
  onComplete,
  type = "achievement",
  title,
  description,
  points,
}: CelebrationProps) {
  const [showParticles, setShowParticles] = useState(false);
  const config = celebrationConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (show) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Particle effects */}
          {showParticles && <ParticleEffect particles={config.particles} />}
          
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300 
            }}
            className="relative m-4 max-w-sm w-full"
          >
            <div className={cn(
              "glass-card-strong p-grid-4 text-center space-y-4",
              "bg-gradient-to-br", 
              config.bgColor
            )}>
              {/* Icon */}
              <motion.div
                className={cn(
                  "w-20 h-20 mx-auto rounded-full glass-card",
                  "flex items-center justify-center",
                  config.color
                )}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [-180, 0, 360, 0],
                }}
                transition={{ 
                  duration: 1,
                  times: [0, 0.6, 1],
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <IconComponent className="w-10 h-10" />
              </motion.div>

              {/* Content */}
              <div className="space-y-2">
                <motion.h2
                  className="heading-2 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {title}
                </motion.h2>
                
                {description && (
                  <motion.p
                    className="body-text-secondary text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {description}
                  </motion.p>
                )}
                
                {points && (
                  <motion.div
                    className="flex items-center justify-center gap-2 text-primary-cyan font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    <Star className="w-5 h-5" />
                    <span>+{points} points</span>
                  </motion.div>
                )}
              </div>

              {/* Close hint */}
              <motion.p
                className="caption-text opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                Tap to continue
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ParticleEffect({ particles }: { particles: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{
            opacity: 1,
            x: "50vw",
            y: "50vh",
            scale: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: `${50 + (Math.random() - 0.5) * 60}vw`,
            y: `${50 + (Math.random() - 0.5) * 60}vh`,
            scale: [0, 1.5, 0],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            delay: Math.random() * 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {particles}
        </motion.div>
      ))}
    </div>
  );
}

interface MicroCelebrationProps {
  trigger: boolean;
  children: React.ReactNode;
  type?: "bounce" | "glow" | "pulse" | "shake";
  intensity?: "subtle" | "medium" | "strong";
}

export function MicroCelebration({
  trigger,
  children,
  type = "bounce",
  intensity = "medium",
}: MicroCelebrationProps) {
  const animations = {
    bounce: {
      subtle: { y: [0, -5, 0], scale: [1, 1.02, 1] },
      medium: { y: [0, -10, 0], scale: [1, 1.05, 1] },
      strong: { y: [0, -15, 0], scale: [1, 1.1, 1] },
    },
    glow: {
      subtle: { boxShadow: ["0 0 0 rgba(0,245,255,0)", "0 0 10px rgba(0,245,255,0.3)", "0 0 0 rgba(0,245,255,0)"] },
      medium: { boxShadow: ["0 0 0 rgba(0,245,255,0)", "0 0 20px rgba(0,245,255,0.5)", "0 0 0 rgba(0,245,255,0)"] },
      strong: { boxShadow: ["0 0 0 rgba(0,245,255,0)", "0 0 30px rgba(0,245,255,0.8)", "0 0 0 rgba(0,245,255,0)"] },
    },
    pulse: {
      subtle: { scale: [1, 1.02, 1] },
      medium: { scale: [1, 1.05, 1] },
      strong: { scale: [1, 1.1, 1] },
    },
    shake: {
      subtle: { x: [0, -2, 2, -2, 0] },
      medium: { x: [0, -5, 5, -5, 0] },
      strong: { x: [0, -10, 10, -10, 0] },
    },
  };

  return (
    <motion.div
      animate={trigger ? animations[type][intensity] : {}}
      transition={{
        duration: type === "shake" ? 0.5 : 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}