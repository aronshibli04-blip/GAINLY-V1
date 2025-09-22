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
  // Allow values > 100% for overeating scenarios
  const actualValue = Math.max(0, value);
  const radius = (size - strokeWidth) / 2;
  
  // Goal line at 75% from bottom (25% from top) - represents 100% target
  const goalLineY = size * 0.25; // 25% from top = 75% from bottom
  
  // Calculate fill height - map value to height where 100% value = 75% height (goal line)
  // If value > 100%, continue filling past goal line to top (100% height)
  const fillHeightPercent = Math.min(actualValue * 0.75, 100); // 100% value = 75% height, max 100% height
  const fillHeight = (fillHeightPercent / 100) * size;

  const fillColors = {
    primary: "#00f5ff", // cyan
    secondary: "#ff00ff", // magenta  
    accent: "#00ffc6", // mint
    destructive: "#dc2626", // red
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Define circular clipping path */}
        <defs>
          <clipPath id={`circle-clip-${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
            />
          </clipPath>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="rgba(255, 255, 255, 0.05)"
          className="backdrop-blur-sm"
        />
        
        {/* Fill that rises from bottom like water */}
        <motion.rect
          x={0}
          y={size - fillHeight}
          width={size}
          height={fillHeight}
          fill={fillColors[color]}
          clipPath={`url(#circle-clip-${size})`}
          initial={{ height: 0, y: size }}
          animate={{ 
            height: fillHeight,
            y: size - fillHeight
          }}
          transition={{
            duration: animationDuration,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${fillColors[color]}40)`
          }}
        />
        
        {/* Goal Line - White horizontal line at 80% height (100% target) */}
        <line
          x1={size / 2 - radius * 0.7}
          y1={goalLineY}
          x2={size / 2 + radius * 0.7}
          y2={goalLineY}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          className="drop-shadow-sm"
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
              {Math.round(actualValue)}%
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