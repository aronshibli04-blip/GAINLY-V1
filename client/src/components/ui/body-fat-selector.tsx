import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BodyFatRange {
  min: number;
  max: number;
  label: string;
  description: string;
  maleDescription: string;
  femaleDescription: string;
}

const BODY_FAT_RANGES: BodyFatRange[] = [
  {
    min: 3,
    max: 6,
    label: "3-6%",
    description: "Essential Fat",
    maleDescription: "Essential fat only - competition bodybuilder level",
    femaleDescription: "Essential fat only - extremely lean athlete level"
  },
  {
    min: 6,
    max: 10,
    label: "6-10%",
    description: "Athletic",
    maleDescription: "Very defined abs, veins visible - fitness model level",
    femaleDescription: "Very lean and defined - competitive athlete level"
  },
  {
    min: 10,
    max: 15,
    label: "10-15%",
    description: "Lean",
    maleDescription: "Visible abs, muscle definition clear - fit and lean",
    femaleDescription: "Lean and toned - athletic and healthy appearance"
  },
  {
    min: 15,
    max: 20,
    label: "15-20%",
    description: "Healthy",
    maleDescription: "Some muscle definition, slight ab outline - healthy range",
    femaleDescription: "Healthy and fit - optimal range for most women"
  },
  {
    min: 20,
    max: 25,
    label: "20-25%",
    description: "Average",
    maleDescription: "Average body fat - little muscle definition visible",
    femaleDescription: "Average healthy range - some softness normal"
  },
  {
    min: 25,
    max: 30,
    label: "25-30%",
    description: "Above Average",
    maleDescription: "Higher body fat - soft appearance, no muscle definition",
    femaleDescription: "Above average but still healthy for women"
  },
  {
    min: 30,
    max: 40,
    label: "30-40%",
    description: "Excess",
    maleDescription: "Significantly overweight - health concerns likely",
    femaleDescription: "Higher body fat level - may benefit from reduction"
  }
];

interface BodyFatSelectorProps {
  gender: 'male' | 'female';
  selectedPercentage: number | null;
  onSelect: (percentage: number) => void;
  className?: string;
}

export function BodyFatSelector({ 
  gender, 
  selectedPercentage, 
  onSelect,
  className 
}: BodyFatSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Initialize with middle range if no selection
  const currentPercentage = selectedPercentage || 15;
  
  const getCurrentRange = (percentage: number) => {
    return BODY_FAT_RANGES.find(range => 
      percentage >= range.min && percentage < range.max
    ) || BODY_FAT_RANGES[3]; // Default to "Healthy"
  };

  const currentRange = getCurrentRange(currentPercentage);

  const handleSliderChange = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    // Map to 3-40% range
    const bodyFatPercentage = 3 + (percentage * 37);
    const rounded = Math.round(bodyFatPercentage * 2) / 2; // Round to nearest 0.5%
    const clamped = Math.max(3, Math.min(40, rounded));
    
    onSelect(clamped);
  }, [onSelect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderChange(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleSliderChange(e.clientX);
    }
  }, [isDragging, handleSliderChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate thumb position (3-40% maps to 0-100% of track)
  const thumbPosition = ((currentPercentage - 3) / 37) * 100;

  const handleCustomPercentage = () => {
    const custom = prompt("Enter your exact body fat percentage:", currentPercentage.toString());
    if (custom && !isNaN(Number(custom))) {
      const percentage = Math.max(3, Math.min(40, Number(custom)));
      onSelect(percentage);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Compact Header */}
      <div className="text-center space-y-2">
        <h3 className="text-white text-sm font-bold uppercase tracking-wide">
          Body Fat Percentage
        </h3>
        <p className="text-slate-400 text-sm">
          Drag the slider to match your body composition
        </p>
      </div>

      {/* Current Selection Display */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className="bg-[#00F5FF]/20 text-[#00F5FF] border-[#00F5FF]/30">
              {currentRange.label}
            </Badge>
            <span className="text-[#00F5FF] font-medium">
              {currentRange.description}
            </span>
          </div>
          <p className="text-sm text-white/80">
            {gender === 'male' ? currentRange.maleDescription : currentRange.femaleDescription}
          </p>
        </CardContent>
      </Card>

      {/* Professional Draggable Slider */}
      <div className="space-y-4">
        <div className="relative">
          {/* Track */}
          <div
            ref={trackRef}
            className="relative h-3 bg-slate-800/80 rounded-full cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            data-testid="body-fat-slider-track"
          >
            {/* Track Gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 via-yellow-500/30 to-red-500/30" />
            
            {/* Range Markers */}
            {BODY_FAT_RANGES.map((range, index) => {
              const position = ((range.min - 3) / 37) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 w-0.5 h-full bg-slate-600"
                  style={{ left: `${position}%` }}
                />
              );
            })}
            
            {/* Draggable Thumb */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-150 cursor-grab",
                "bg-[#00F5FF] shadow-lg shadow-[#00F5FF]/50 border-2 border-white/20",
                isDragging ? "scale-125 cursor-grabbing shadow-[#00F5FF]/80" : "hover:scale-110"
              )}
              style={{ left: `${thumbPosition}%`, transform: `translate(-50%, -50%)` }}
              data-testid="body-fat-slider-thumb"
            >
              {/* Thumb Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-[#00F5FF] opacity-40 blur-sm" />
            </div>
          </div>
          
          {/* Percentage Labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>3%</span>
            <span className="text-[#00F5FF] font-bold">{currentPercentage.toFixed(1)}%</span>
            <span>40%</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80">
          Selected: <span className="text-[#00F5FF] font-bold">{currentPercentage.toFixed(1)}%</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCustomPercentage}
          className="h-8 px-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-[#00F5FF]/50 text-xs"
          data-testid="custom-percentage-button"
        >
          Custom %
        </Button>
      </div>

      {/* Helper Tip - Compact */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          💡 Unsure? Try {gender === 'male' ? '10-20%' : '15-25%'} range first
        </p>
      </div>
    </div>
  );
}