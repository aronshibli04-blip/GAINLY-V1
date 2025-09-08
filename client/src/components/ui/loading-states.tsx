import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Loading skeleton for routine cards
export function RoutineCardSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-600/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for meal cards
export function MealCardSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-600/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for stats cards
export function StatsCardSkeleton() {
  return (
    <Card className="bg-slate-800/50 border-slate-600/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Inline loading spinner
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-400`} />
  );
}

// Full page loading screen
export function FullPageLoader({ message = "Laster..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-400/30 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-white/70 text-lg">{message}</p>
      </div>
    </div>
  );
}

// Data loading placeholder
export function DataPlaceholder({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="bg-slate-800/30 border-slate-600/30">
      <CardContent className="p-8 text-center">
        <div className="mb-4 flex justify-center text-slate-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}