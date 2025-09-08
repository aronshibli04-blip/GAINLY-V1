import { Home, Utensils, Dumbbell, Brain, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Utensils, label: "Meals", path: "/meals" },
  { icon: Dumbbell, label: "Training", path: "/training" },
  { icon: Brain, label: "AI Coach", path: "/ai-coach" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200",
                  "min-w-[80px] h-16 touch-manipulation",
                  isActive
                    ? "text-primary grok-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 mb-1",
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