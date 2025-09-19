import { Button } from "@/components/ui/button";
import { Menu, Bell, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MobileHeaderProps {
  title: string;
  onOpenMenu: () => void;
  showNotifications?: boolean;
  isVisible?: boolean;
}

export function MobileHeader({ title, onOpenMenu, showNotifications = true, isVisible = true }: MobileHeaderProps) {
  const { toast } = useToast();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const handleNotificationClick = () => {
    setHasUnreadNotifications(false);
    toast({
      title: "Notifications",
      description: "You have 2 new milestones available! Great progress on your weight gain journey.",
      duration: 3000,
    });
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-primary/20 px-4 py-3
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
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
            onClick={handleNotificationClick}
            className="text-gray-400 hover:text-white hover:bg-primary/20 p-2 relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}