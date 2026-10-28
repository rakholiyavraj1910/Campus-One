import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  RefreshCw, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Database,
  Users
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UserProfile } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { BackendStatus } from '../../lib/supabaseClient';
import { AdminSectionId } from './AdminSidebar';

interface AdminHeaderProps {
  currentSection: AdminSectionId;
  onToggleSidebar: () => void;
  adminUser?: UserProfile | null;
  backendStatus: BackendStatus;
  onRefreshAll: () => void;
  onSignOut: () => void;
  onSelectSection: (section: AdminSectionId) => void;
  onNavigatePublic?: () => void;
}

const SECTION_TITLES: Record<AdminSectionId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Analytics & Telemetry',
    subtitle: 'Institutional statistics, active user metrics, and live telemetry'
  },
  users: {
    title: 'User & Role Management',
    subtitle: 'Search, filter, update profiles, reclassify roles, and manage credentials'
  },
  students: {
    title: 'Student Directory & Roster',
    subtitle: 'Enrolled students, academic records, GPA, semester, and division rosters'
  },
  faculty: {
    title: 'Faculty Member Directory',
    subtitle: 'Instructional staff, designations, cabins, consultation hours, and departments'
  },
  roles: {
    title: 'Role Governance & Permissions',
    subtitle: 'Row Level Security policy enforcement, role elevation, and access safeguards'
  },
  approvals: {
    title: 'Faculty Registration Approvals',
    subtitle: 'Review and approve pending faculty credentials submitted during registration'
  },
  departments: {
    title: '14 Academic Departments',
    subtitle: 'Government Polytechnic Ahmedabad branch records, faculty count, and student quotas'
  },
  'notices-events': {
    title: 'Campus Notices & Event Calendar',
    subtitle: 'Institutional circulars, administrative alerts, and scheduled campus events'
  },
  academic: {
    title: 'Academic Records & Curriculum',
    subtitle: 'Genuine classroom attendance sessions, marks ledger, and study material registries'
  },
  audit: {
    title: 'Security Audit & Activity Logs',
    subtitle: 'Real-time database audit ledger recording role modifications and administrative edits'
  },
  settings: {
    title: 'System & Database Architecture',
    subtitle: 'Supabase PostgreSQL configuration, schema validation, and institutional parameters'
  },
  profile: {
    title: 'Administrator Identity & Clearance',
    subtitle: 'Institutional credentials, executive department, authority clearance, and contact details'
  }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentSection,
  onToggleSidebar,
  adminUser,
  backendStatus,
  onRefreshAll,
  onSignOut,
  onSelectSection,
  onNavigatePublic
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sectionInfo = SECTION_TITLES[currentSection] || {
    title: 'Institutional Control Center',
    subtitle: 'Super Admin Portal'
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshAll();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden transition-colors shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
              Admin Console
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs font-bold text-slate-300 truncate">
              {sectionInfo.title}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">
            {sectionInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* PostgreSQL Status Indicator (Desktop) */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-mono text-slate-300">bbtjbazbeyedxjfgnfcm</span>
          {backendStatus.status === 'connected' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Database Connected" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="Fallback Mode" />
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Refresh Current Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Account Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAccountOpen(prev => !prev)}
            className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition-all"
            aria-expanded={isAccountOpen}
          >
            <UserAvatar
              name={adminUser?.name || 'Super Administrator'}
              src={adminUser?.avatar}
              role="admin"
              size="sm"
            />
            <div className="hidden sm:block min-w-0 max-w-[130px]">
              <p className="text-xs font-bold text-white truncate">
                {adminUser?.name || 'Super Admin'}
              </p>
              <p className="text-[10px] text-teal-400 font-black uppercase tracking-wider">
                SUPER ADMIN
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Account Dropdown */}
          {isAccountOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c1220] border border-slate-800 shadow-2xl p-2 z-50 animate-scale-up space-y-1">
              {/* Profile Card Header */}
              <div className="p-3 border-b border-slate-800/80">
                <p className="text-xs font-black text-white">
                  {adminUser?.name || 'Super Administrator'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {adminUser?.email || 'campusonegpa@gmail.com'}
                </p>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    Institutional Super Admin
                  </span>
                </div>
              </div>

              {/* Navigation Quick Links */}
              <button
                onClick={() => {
                  onSelectSection('profile');
                  setIsAccountOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-500/10 transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>My Admin Profile</span>
              </button>

              <button
                onClick={() => {
                  onSelectSection('users');
                  setIsAccountOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>User & Role Management</span>
              </button>

              <button
                onClick={() => {
                  onSelectSection('settings');
                  setIsAccountOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => {
                  onSelectSection('audit');
                  setIsAccountOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Security Audit Logs</span>
              </button>

              {onNavigatePublic && (
                <button
                  onClick={() => {
                    onNavigatePublic();
                    setIsAccountOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>View Public Portal</span>
                </button>
              )}

              {/* Sign Out Action */}
              <div className="pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setIsAccountOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out of Admin Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
