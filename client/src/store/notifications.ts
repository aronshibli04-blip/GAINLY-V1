import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@shared/schema';

interface NotificationStore {
  // State
  isOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  open: () => void;
  close: () => void;
  add: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  remove: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  
  // Internal helpers
  _calculateUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false,
      notifications: [],
      unreadCount: 0,
      
      // Actions
      open: () => set({ isOpen: true }),
      
      close: () => set({ isOpen: false }),
      
      add: (notification) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: now,
        };
        
        set((state) => {
          const updated = [newNotification, ...state.notifications];
          const unreadCount = updated.filter(n => !n.read).length;
          return {
            notifications: updated,
            unreadCount,
          };
        });
      },
      
      remove: (id) => {
        set((state) => {
          const updated = state.notifications.filter(n => n.id !== id);
          const unreadCount = updated.filter(n => !n.read).length;
          return {
            notifications: updated,
            unreadCount,
          };
        });
      },
      
      markRead: (id) => {
        set((state) => {
          const updated = state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = updated.filter(n => !n.read).length;
          return {
            notifications: updated,
            unreadCount,
          };
        });
      },
      
      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      clear: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
      
      _calculateUnreadCount: () => {
        const { notifications } = get();
        const unreadCount = notifications.filter(n => !n.read).length;
        set({ unreadCount });
      },
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Helper function to create mock notifications for testing
export const createMockNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  link?: string | null
): Omit<Notification, 'id' | 'createdAt'> => ({
  userId: 'mock-user-id', // Will be replaced with actual user ID later
  type,
  title,
  message,
  read: false,
  link: link || null,
});