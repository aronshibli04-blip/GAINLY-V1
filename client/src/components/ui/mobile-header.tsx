import { Button } from "@/components/ui/button";
import { Menu, Bell, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationStore } from "@/store/notifications";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  onOpenMenu: () => void;
  showNotifications?: boolean;
  isVisible?: boolean;
}

export function MobileHeader({ title, onOpenMenu, showNotifications = true, isVisible = true }: MobileHeaderProps) {
  const { open, unreadCount, add } = useNotificationStore();

  const handleNotificationClick = () => {
    open();
  };

  // Temporary test function - for development only
  const addTestNotification = () => {
    add({
      userId: 'test-user',
      type: 'goal',
      title: 'Ny milepæl oppnådd! 🎉',
      message: 'Du har holdt kalorimålet ditt i 7 dager på rad. Fortsett det gode arbeidet!',
      read: false,
      link: '/progress',
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
          <div className="flex items-center gap-1">
            {/* Temporary test button - remove in production */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={addTestNotification}
              className="text-green-400 hover:text-green-300 hover:bg-primary/20 p-1 text-xs"
              title="Add test notification"
            >
              +
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleNotificationClick}
              className="text-gray-400 hover:text-white hover:bg-primary/20 p-2 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span 
                  className={cn(
                    "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
                    "bg-cyan-500 text-white text-xs font-medium rounded-full",
                    "flex items-center justify-center leading-none"
                  )}
                  data-testid="badge-unread-count"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}