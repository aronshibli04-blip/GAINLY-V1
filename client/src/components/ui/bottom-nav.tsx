import { Home, Utensils, Dumbbell, Brain, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Utensils, label: "Meals", path: "/meals" },
  { icon: Dumbbell, label: "Training", path: "/training" },
  { icon: Brain, label: "Coach", path: "/ai-coach" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-card backdrop-blur-xl border-t border-border z-50 glass-card"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-grid-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center p-grid-2 rounded-xl transition-all duration-300",
                  "min-w-[80px] min-h-[44px] touch-target touch-feedback focus-ring",
                  isActive
                    ? "text-primary scale-105 bg-primary/10 shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50 hover:scale-105"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                role="button"
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 mb-1",
                    isActive && "drop-shadow-lg"
                  )} 
                />
                <span className="text-xs font-medium caption-text">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}