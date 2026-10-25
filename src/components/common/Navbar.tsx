import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  Bookmark, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User, 
  Calendar,
  Sparkles,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { getBackendStatus, BackendStatus, subscribeToBackendHealth } from '../../lib/supabaseClient';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigate: (page: string, subTab?: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate, currentPage }) => {
  const { user, role, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    unreadCount, 
    bookmarks, 
    setIsSearchOpen, 
    setIsAuthModalOpen,
    setIsBookmarksOpen,
    setIsNotificationsOpen
  } = useNotifications();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());

  useEffect(() => {
    return subscribeToBackendHealth(setBackendStatus);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-navy-700 dark:from-brand-cyan dark:to-blue-600 flex items-center justify-center text-white dark:text-navy-950 shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-navy-900 dark:text-white">
                    Campus<span className="text-brand-cyan">One</span>
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                </div>
                <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  Apex Institute of Tech
                </p>
              </div>
            </button>
          </div>

          {/* Middle: Global Search Trigger Button */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-navy-800/80 hover:bg-slate-200/70 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-700/60 rounded-xl transition-all shadow-sm group"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                <span>Search notices, faculty, courses, campus map...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded shadow-xs">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bookmarks */}
            <button
              onClick={() => setIsBookmarksOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Saved Bookmarks"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarks.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-cyan text-navy-950 font-bold text-[10px] flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-navy-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Backend Connection Diagnostic Pill */}
            <div 
              onClick={() => onNavigate('admin', 'system')}
              className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all ${
                backendStatus.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                  : backendStatus.status === 'schema_missing'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/20'
                  : backendStatus.status === 'error'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20'
                  : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25 hover:bg-brand-cyan/20'
              }`}
              title={backendStatus.healthMessage}
            >
              <span className={`w-2 h-2 rounded-full ${
                backendStatus.status === 'connected' ? 'bg-emerald-500' :
                backendStatus.status === 'schema_missing' ? 'bg-amber-500 animate-pulse' :
                backendStatus.status === 'error' ? 'bg-rose-500' : 'bg-brand-cyan'
              }`} />
              <span>
                {backendStatus.status === 'connected' && `Supabase Live (${backendStatus.latencyMs}ms)`}
                {backendStatus.status === 'schema_missing' && `Supabase [${backendStatus.projectRef}] Schema Missing`}
                {backendStatus.status === 'error' && 'Supabase Error'}
                {backendStatus.status === 'unconfigured' && 'Local Demo Engine'}
                {backendStatus.status === 'verifying' && 'Checking Supabase...'}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-navy-800 hidden sm:block" />

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 border border-transparent hover:border-slate-200 dark:hover:border-navy-700 transition-all focus:outline-none"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-cyan/40"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-semibold text-brand-cyan capitalize flex items-center space-x-1">
                    <span>{role}</span>
                    {role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl py-2 z-50 animate-slide-up"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-navy-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    {user.rollNumber && (
                      <p className="text-[11px] font-mono text-brand-cyan mt-1">Roll: {user.rollNumber} | {user.division}</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => onNavigate('student', 'profile')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-brand-cyan" />
                      <span>Student Academic Profile</span>
                    </button>

                    {(role === 'faculty' || role === 'admin') && (
                      <button
                        onClick={() => onNavigate('faculty-portal')}
                        className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-navy-800 flex items-center space-x-2 font-semibold"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Faculty Teaching Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('student', 'timetable')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Class Timetable</span>
                    </button>

                    {(role === 'admin' || role === 'faculty') && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-navy-800 flex items-center space-x-2 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Staff Admin Panel</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-navy-800 py-1.5 px-4 text-xs">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                      Verified Identity
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white truncate mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] uppercase font-extrabold text-brand-cyan">{role}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-navy-800 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-navy-800 flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
