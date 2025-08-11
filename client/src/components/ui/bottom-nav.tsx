import { Home, Utensils, Dumbbell, Brain, TrendingUp, User, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Utensils, label: "Meals", path: "/meals" },
  { icon: TrendingUp, label: "Stats", path: "/statistics" },
  { icon: Brain, label: "AI Coach", path: "/ai-coach" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { currentPhase, weightEntries, calorieEntries } = useUserStore();
  
  // Calculate total unique days of data
  const totalDays = Math.max(
    new Set(weightEntries.map(w => w.date)).size,
    new Set(calorieEntries.map(c => c.date)).size
  );
  
  // Determine which features should be accessible based on phase
  const isFeatureUnlocked = (path: string) => {
    switch (path) {
      case '/':
        return true; // Home always accessible
      case '/meals':
        return currentPhase !== 'onboarding'; // Meals accessible after onboarding
      case '/statistics':
        return totalDays >= 3; // Stats need some data
      case '/ai-coach':
        return totalDays >= 7; // AI Coach needs full calibration
      case '/profile':
        return true; // Profile always accessible
      default:
        return true;
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const isUnlocked = isFeatureUnlocked(item.path);
          
          if (!isUnlocked) {
            return (
              <button
                key={item.path}
                disabled
                className="flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] h-14 text-muted-foreground/50 cursor-not-allowed"
                data-testid={`nav-${item.label.toLowerCase()}-locked`}
              >
                <Lock className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                  "min-w-[60px] h-14",
                  isActive
                    ? "text-primary grok-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    isActive && "grok-glow"
                  )} 
                />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}