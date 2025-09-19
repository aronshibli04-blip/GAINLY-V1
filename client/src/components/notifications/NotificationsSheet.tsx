import { Bell, BellRing, Clock, Check, X, UserPlus } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notifications";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Notification } from "@shared/schema";

// Notification type icons mapping
const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'system':
      return BellRing;
    case 'goal':
      return Clock;
    case 'reminder':
      return Clock;
    case 'ai':
      return BellRing;
    case 'social':
      return UserPlus;
    default:
      return Bell;
  }
};

// Group notifications by day
const groupNotificationsByDay = (notifications: Notification[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();
  
  const groups = {
    today: [] as Notification[],
    yesterday: [] as Notification[],
    earlier: [] as Notification[],
  };
  
  notifications.forEach(notification => {
    const notificationDate = new Date(notification.createdAt).toDateString();
    
    if (notificationDate === todayStr) {
      groups.today.push(notification);
    } else if (notificationDate === yesterdayStr) {
      groups.yesterday.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });
  
  return groups;
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate?: (link: string) => void;
}

const NotificationItem = ({ notification, onRead, onNavigate }: NotificationItemProps) => {
  const [, navigate] = useLocation();
  const Icon = getTypeIcon(notification.type);
  
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
      navigate(notification.link);
    }
  };
  
  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: nb,
  });
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg transition-all duration-200 cursor-pointer",
        "hover:bg-slate-800/40 active:scale-[0.98]",
        !notification.read && "bg-slate-800/20 border-l-2 border-l-cyan-400"
      )}
      onClick={handleClick}
      data-testid={`notification-item-${notification.id}`}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        "bg-slate-700/50"
      )}>
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-sm font-medium text-white truncate",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {relativeTime}
            </p>
          </div>
          
          {/* Unread indicator */}
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-1" />
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyNotificationsProps {
  onAddFriends: () => void;
}

const EmptyNotifications = ({ onAddFriends }: EmptyNotificationsProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Large Bell Icon */}
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
        <Bell className="w-8 h-8 text-slate-400" />
      </div>
      
      {/* Empty State Text */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Ingen varsler
      </h3>
      <p className="text-sm text-slate-400 mb-8 max-w-sm leading-relaxed">
        Kontakt venner for å få oppdateringer om deres reise og få støtte til din.
      </p>
      
      {/* CTA Button */}
      <Button
        onClick={onAddFriends}
        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        data-testid="button-add-friends"
      >
        Legg til venner
      </Button>
    </div>
  );
};

export const NotificationsSheet = () => {
  const [, navigate] = useLocation();
  const { 
    isOpen, 
    close, 
    notifications, 
    unreadCount, 
    markRead, 
    markAllRead 
  } = useNotificationStore();
  
  const [isLoading] = useState(false); // TODO: Implement loading state for API calls
  
  const handleClose = () => {
    close();
  };
  
  const handleAddFriends = () => {
    close();
    navigate('/profile'); // Navigate to profile page for now
  };
  
  const handleMarkAllRead = () => {
    markAllRead();
  };
  
  const handleNotificationRead = (id: string) => {
    markRead(id);
  };
  
  const handleNavigate = (link: string) => {
    close();
  };
  
  const groupedNotifications = groupNotificationsByDay(notifications);
  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className={cn(
          "w-full sm:w-96 bg-slate-900/95 border-slate-700 backdrop-blur-xl",
          "flex flex-col h-full p-0"
        )}
        data-testid="notifications-sheet"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <SheetTitle className="text-white text-lg font-semibold">
                Varsler
              </SheetTitle>
              {hasUnread && (
                <Badge 
                  variant="secondary" 
                  className="bg-cyan-500/20 text-cyan-400 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 text-xs"
                data-testid="button-mark-all-read"
              >
                Marker alle som lest
              </Button>
            )}
          </div>
        </SheetHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            // Loading State
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
          ) : !hasNotifications ? (
            // Empty State
            <EmptyNotifications onAddFriends={handleAddFriends} />
          ) : (
            // Notifications List
            <div className="overflow-y-auto h-full">
              <div className="space-y-4 p-4">
                {/* Today */}
                {groupedNotifications.today.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3 px-2">
                      I dag
                    </h4>
                    <div className="space-y-1">
                      {groupedNotifications.today.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={handleNotificationRead}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Yesterday */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div>
                    {groupedNotifications.today.length > 0 && (
                      <Separator className="bg-slate-700/50 my-4" />
                    )}
                    <h4 className="text-sm font-medium text-slate-300 mb-3 px-2">
                      I går
                    </h4>
                    <div className="space-y-1">
                      {groupedNotifications.yesterday.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={handleNotificationRead}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Earlier */}
                {groupedNotifications.earlier.length > 0 && (
                  <div>
                    {(groupedNotifications.today.length > 0 || groupedNotifications.yesterday.length > 0) && (
                      <Separator className="bg-slate-700/50 my-4" />
                    )}
                    <h4 className="text-sm font-medium text-slate-300 mb-3 px-2">
                      Tidligere
                    </h4>
                    <div className="space-y-1">
                      {groupedNotifications.earlier.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={handleNotificationRead}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};