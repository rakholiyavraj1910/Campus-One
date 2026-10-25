import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getBookmarks,
  toggleBookmark as toggleBookmarkStorage,
  isBookmarked as isBookmarkedStorage
} from '../lib/storageService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type'], link?: string) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBookmarksOpen: boolean;
  setIsBookmarksOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications());
  const [bookmarks, setBookmarks] = useState<string[]>(() => getBookmarks());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Keyboard shortcut: Cmd+K or Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = markNotificationRead(id);
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = markAllNotificationsRead();
    setNotifications(updated);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'notice', link?: string) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      link
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('campusone_notifications_v1', JSON.stringify(updated));
  };

  const toggleBookmark = (id: string): boolean => {
    const newState = toggleBookmarkStorage(id);
    setBookmarks(getBookmarks());
    return newState;
  };

  const isBookmarked = (id: string): boolean => {
    return bookmarks.includes(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        isSearchOpen,
        setIsSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isBookmarksOpen,
        setIsBookmarksOpen,
        isNotificationsOpen,
        setIsNotificationsOpen
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
