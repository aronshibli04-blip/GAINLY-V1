import { Dumbbell, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notifications";
import type { User } from "@shared/schema";

interface NavigationProps {
  user: User;
}

export default function Navigation({ user }: NavigationProps) {
  const initials = user.firstName.charAt(0).toUpperCase() + (user.username.charAt(0).toUpperCase());
  const { open, unreadCount, add } = useNotificationStore();
  
  // Temporary test function - for development only
  const addTestNotification = () => {
    add({
      userId: user.id,
      type: 'goal',
      title: 'Ukens måloppnåelse!',
      message: 'Du har nådd ditt kalorie-mål 5 dager på rad. Fortsett det gode arbeidet!',
      read: false,
      link: '/progress',
    });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">GAINLY</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Weight Gain</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Temporary test button - remove in production */}
            <button 
              className="touch-target-comfortable text-green-500 hover:text-green-700 p-1 rounded text-xs"
              onClick={addTestNotification}
              title="Add test notification"
            >
              +
            </button>
            
            <button 
              className="touch-target-comfortable text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors touch-feedback relative"
              aria-label="View notifications"
              data-testid="notifications-button"
              onClick={open}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
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
            </button>
            <button 
              className="touch-target-comfortable bg-primary rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/90 transition-colors touch-feedback"
              aria-label={`User profile: ${user.firstName} ${user.username}`}
              data-testid="user-avatar"
              onClick={() => {/* TODO: Open user menu */}}
            >
              <span className="text-white text-sm font-medium" aria-hidden="true">{initials}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
