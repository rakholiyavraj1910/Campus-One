import React from 'react';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  UserCheck, 
  Building2, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Settings, 
  LogOut,
  X,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';
import { CampusOneLogo } from '../common/CampusOneLogo';
import { UserAvatar } from '../common/UserAvatar';
import { UserProfile } from '../../types';
import { BackendStatus } from '../../lib/supabaseClient';

export type AdminSectionId = 
  | 'overview' 
  | 'users' 
  | 'students' 
  | 'faculty' 
  | 'roles' 
  | 'approvals' 
  | 'departments' 
  | 'notices-events' 
  | 'academic' 
  | 'audit' 
  | 'settings'
  | 'profile';

export interface AdminNavItem {
  id: AdminSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badgeColor?: string;
  description: string;
}

interface AdminSidebarProps {
  currentSection: AdminSectionId;
  onSelectSection: (section: AdminSectionId) => void;
  isOpen: boolean;
  onClose: () => void;
  adminUser?: UserProfile | null;
  pendingRequestsCount: number;
  backendStatus: BackendStatus;
  onSignOut: () => void;
  onNavigatePublic?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onClose,
  adminUser,
  pendingRequestsCount,
  backendStatus,
  onSignOut,
  onNavigatePublic
}) => {
  const navItems: AdminNavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Platform metrics & telemetry'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Directory, profiles & search'
    },
    {
      id: 'students',
      label: 'Student Management',
      icon: GraduationCap,
      description: 'Undergraduate student roster'
    },
    {
      id: 'faculty',
      label: 'Faculty Management',
      icon: Briefcase,
      description: 'Professors, cabins & hours'
    },
    {
      id: 'roles',
      label: 'Role & Permissions',
      icon: ShieldAlert,
      description: 'Security & access control'
    },
    {
      id: 'approvals',
      label: 'Faculty Approvals',
      icon: UserCheck,
      count: pendingRequestsCount,
      badgeColor: pendingRequestsCount > 0 ? 'bg-amber-500 text-navy-950 animate-pulse' : undefined,
      description: 'Verification requests'
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      count: 14,
      description: '14 academic branches'
    },
    {
      id: 'notices-events',
      label: 'Notices & Events',
      icon: Calendar,
      description: 'Campus circulars & schedule'
    },
    {
      id: 'academic',
      label: 'Academic Records',
      icon: Layers,
      description: 'Attendance & materials'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: ShieldCheck,
      description: 'System security audit trail'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Supabase telemetry & config'
    },
    {
      id: 'profile',
      label: 'Admin Profile',
      icon: ShieldCheck,
      description: 'Identity, credentials & security'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090d16] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  CampusOne
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Control Center
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Database Pill */}
        <div className="px-5 py-3 border-b border-slate-800/50 bg-[#0c1220]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">PostgreSQL Engine</span>
            {backendStatus.status === 'connected' ? (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live ({backendStatus.projectRef})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Fallback Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Institutional Suite
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                    item.badgeColor || (isActive ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Admin Account Card */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0c1220]/70 space-y-3">
          <button
            onClick={() => {
              onSelectSection('profile');
              onClose();
            }}
            className="w-full text-left flex items-center space-x-3 p-2 -mx-2 rounded-xl hover:bg-slate-800/60 transition-colors group cursor-pointer"
            title="View & Edit Administrator Identity Profile"
          >
            <UserAvatar
              name={adminUser?.name || 'Super Administrator'}
              src={adminUser?.avatar}
              role="admin"
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white group-hover:text-teal-300 transition-colors truncate">
                {adminUser?.name || 'Super Administrator'}
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {adminUser?.email || 'campusonegpa@gmail.com'}
              </p>
              <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider text-teal-400 group-hover:underline">
                Super Admin Clearance • Edit Profile
              </span>
            </div>
          </button>

          <div className="flex items-center space-x-2 pt-1">
            {onNavigatePublic && (
              <button
                onClick={onNavigatePublic}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-[11px] font-bold text-slate-300 transition-colors flex items-center justify-center space-x-1.5"
                title="View campus public directory"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public View</span>
              </button>
            )}

            <button
              onClick={onSignOut}
              className="flex-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-bold text-rose-300 transition-colors flex items-center justify-center space-x-1.5"
              title="Sign out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
