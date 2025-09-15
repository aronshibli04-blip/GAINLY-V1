import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  showValue?: boolean;
  color?: "primary" | "secondary" | "accent" | "destructive";
  animationDuration?: number;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  showValue = true,
  color = "primary",
  animationDuration = 1.5,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary-cyan drop-shadow-lg",
    secondary: "stroke-secondary-magenta drop-shadow-lg",
    accent: "stroke-accent-mint drop-shadow-lg",
    destructive: "stroke-destructive drop-shadow-lg",
  };

  const glowClasses = {
    primary: "drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]",
    secondary: "drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]",
    accent: "drop-shadow-[0_0_8px_rgba(0,255,198,0.5)]",
    destructive: "drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]",
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="backdrop-blur-sm"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className={cn(
            "transition-all duration-300 ease-in-out",
            colorClasses[color],
            glowClasses[color]
          )}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: animationDuration,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-1">
          {showValue && (
            <motion.div
              className="text-2xl font-bold text-primary"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {Math.round(normalizedValue)}%
            </motion.div>
          )}
          {children && (
            <motion.div
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnimatedProgressRingProps {
  progress: number;
  total: number;
  label: string;
  unit?: string;
  size?: number;
  color?: "primary" | "secondary" | "accent";
}

export function AnimatedProgressRing({
  progress,
  total,
  label,
  unit = "",
  size = 100,
  color = "primary",
}: AnimatedProgressRingProps) {
  const percentage = total > 0 ? Math.min(100, (progress / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center space-y-2">
      <CircularProgress
        value={percentage}
        size={size}
        color={color}
        showValue={false}
      >
        <div className="text-xs font-medium text-center">
          <div className="text-primary font-bold">
            {progress.toLocaleString()}
          </div>
          <div className="text-muted-foreground">
            / {total.toLocaleString()} {unit}
          </div>
        </div>
      </CircularProgress>
      <div className="text-xs text-center font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  );
}