import { useState } from "react";
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
  const [hoveredRange, setHoveredRange] = useState<BodyFatRange | null>(null);

  const getSelectedRange = () => {
    if (!selectedPercentage) return null;
    return BODY_FAT_RANGES.find(range => 
      selectedPercentage >= range.min && selectedPercentage < range.max
    ) || null;
  };

  const selectedRange = getSelectedRange();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">
          Select Your Body Fat Percentage
        </h3>
        <p className="text-sm text-white/70">
          Choose the range that best describes your current body composition
        </p>
      </div>

      {/* Current Selection Display */}
      {selectedRange && (
        <Card className="bg-emerald-500/20 border-emerald-500/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                {selectedRange.label}
              </Badge>
              <span className="text-emerald-300 font-medium">
                {selectedRange.description}
              </span>
            </div>
            <p className="text-sm text-white/80">
              {gender === 'male' ? selectedRange.maleDescription : selectedRange.femaleDescription}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Range Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BODY_FAT_RANGES.map((range) => {
          const isSelected = selectedRange?.min === range.min;
          const isHovered = hoveredRange?.min === range.min;
          const midPoint = (range.min + range.max) / 2;

          return (
            <Card
              key={`${range.min}-${range.max}`}
              className={cn(
                "cursor-pointer transition-all duration-200 backdrop-blur-sm",
                "hover:scale-105 active:scale-95",
                isSelected 
                  ? "bg-emerald-500/30 border-emerald-500/50 ring-2 ring-emerald-400/50" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
              onMouseEnter={() => setHoveredRange(range)}
              onMouseLeave={() => setHoveredRange(null)}
              onClick={() => onSelect(midPoint)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Range Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-mono text-xs",
                        isSelected 
                          ? "border-emerald-400/50 text-emerald-300" 
                          : "border-white/30 text-white/80"
                      )}
                    >
                      {range.label}
                    </Badge>
                    <span className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-emerald-300" : "text-white"
                    )}>
                      {range.description}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={cn(
                  "text-xs leading-relaxed",
                  isSelected || isHovered ? "text-white/90" : "text-white/70"
                )}>
                  {gender === 'male' ? range.maleDescription : range.femaleDescription}
                </p>

                {/* Visual Indicator */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-full rounded-full transition-colors",
                        i < (range.max / 4) // Visual fill based on percentage
                          ? isSelected 
                            ? "bg-emerald-400" 
                            : "bg-white/40"
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-xs text-white/60 max-w-md mx-auto">
          💡 <strong>Tip:</strong> If you're unsure, choose the middle ranges (10-20% for males, 15-25% for females). 
          You can always adjust this later as you get more accurate measurements.
        </p>
      </div>

      {/* Custom Input Option */}
      {selectedPercentage && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/80">
                Selected: <span className="text-white font-medium">{selectedPercentage.toFixed(1)}%</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const custom = prompt("Enter your exact body fat percentage:", selectedPercentage.toString());
                  if (custom && !isNaN(Number(custom))) {
                    const percentage = Math.max(3, Math.min(40, Number(custom)));
                    onSelect(percentage);
                  }
                }}
                className="text-xs h-8 border-white/20 text-white/80 hover:text-white hover:border-white/40"
              >
                Custom %
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}