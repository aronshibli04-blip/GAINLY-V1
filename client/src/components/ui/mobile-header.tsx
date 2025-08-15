import { Button } from "@/components/ui/button";
import { Menu, Bell, Zap } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  onOpenMenu: () => void;
  showNotifications?: boolean;
}

export function MobileHeader({ title, onOpenMenu, showNotifications = true }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-primary/20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Menu Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onOpenMenu}
          className="text-gray-400 hover:text-white hover:bg-primary/20 p-2"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title with Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-green-400 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>

        {/* Notifications */}
        {showNotifications && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-primary/20 p-2 relative"
          >
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </Button>
        )}
      </div>
    </header>
  );
}