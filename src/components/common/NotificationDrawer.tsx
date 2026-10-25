import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

interface NotificationDrawerProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isNotificationsOpen, 
    setIsNotificationsOpen 
  } = useNotifications();

  if (!isNotificationsOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-brand-cyan" />;
    }
  };

  const handleItemClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) {
      setIsNotificationsOpen(false);
      const parts = notif.link.split('/');
      onNavigate(parts[0], parts[1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-navy-950/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-navy-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-navy-800 animate-slide-up sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Campus Alerts & Updates</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notices` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-medium flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800 p-2">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 text-brand-cyan" />
              <p className="text-sm font-semibold">No notifications right now</p>
              <p className="text-xs text-slate-500 mt-1">Check back later for college updates</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-colors ${
                  !n.read 
                    ? 'bg-brand-cyan/5 dark:bg-navy-800/80 border-l-4 border-brand-cyan' 
                    : 'hover:bg-slate-50 dark:hover:bg-navy-800/40 opacity-75'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <div className="mt-2 flex items-center text-[11px] font-semibold text-brand-cyan hover:underline">
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 text-center">
          <p className="text-[11px] text-slate-400">
            Push notifications powered by CampusOne Notification Gateway
          </p>
        </div>
      </div>
    </div>
  );
};
