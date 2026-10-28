import React, { useState, useEffect } from 'react';
import { PlatformAnalytics } from './PlatformAnalytics';
import { ManageUsers } from './ManageUsers';
import { ManageDepartments } from './ManageDepartments';
import { ManageFaculty } from './ManageFaculty';
import { ManageStudents } from './ManageStudents';
import { ManageFacultyRequests } from './ManageFacultyRequests';
import { ManageNotices } from './ManageNotices';
import { ManageEvents } from './ManageEvents';
import { ManageMaterials } from './ManageMaterials';
import { ManageFacilities } from './ManageFacilities';
import { DatabaseOverview } from './DatabaseOverview';
import { AuditLogsViewer } from './AuditLogsViewer';
import { ManageFeedback } from './ManageFeedback';
import { SystemSettings } from './SystemSettings';
import { AdminAccessDenied } from '../common/AdminAccessDenied';
import { LoadingScreen } from '../common/LoadingScreen';
import { Notice, EventItem } from '../../types';
import { 
  BarChart3, 
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  Bell, 
  Calendar, 
  FileText, 
  Layers,
  Database,
  MessageSquare,
  ShieldAlert, 
  Settings, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBackendStatus, BackendStatus, subscribeToBackendHealth } from '../../lib/supabaseClient';
import { getPendingFacultyRequests } from '../../lib/storageService';

interface AdminDashboardProps {
  notices: Notice[];
  events: EventItem[];
  onRefreshNotices: () => void;
  onRefreshEvents: () => void;
  onNavigate?: (page: string, subTab?: string) => void;
  initialSubTab?: string;
}

type TabId = 
  | 'overview' 
  | 'users'
  | 'departments' 
  | 'faculty' 
  | 'students' 
  | 'faculty-requests' 
  | 'notices' 
  | 'events' 
  | 'materials' 
  | 'facilities' 
  | 'database' 
  | 'feedback' 
  | 'audit' 
  | 'system';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  notices,
  events,
  onRefreshNotices,
  onRefreshEvents,
  onNavigate = () => {},
  initialSubTab
}) => {
  const { role, user, loading } = useAuth();
  
  // Resolve initial tab, falling back to 'overview'
  const resolveInitialTab = (tab?: string): TabId => {
    if (!tab) return 'overview';
    if (tab === 'analytics') return 'overview';
    if (tab === 'users' || tab === 'user-management') return 'users';
    const validTabs: TabId[] = [
      'overview', 'users', 'departments', 'faculty', 'students', 'faculty-requests',
      'notices', 'events', 'materials', 'facilities', 'database', 'feedback', 'audit', 'system'
    ];
    return validTabs.includes(tab as TabId) ? (tab as TabId) : 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabId>(resolveInitialTab(initialSubTab));
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  
  // Cross-module filtering states
  const [studentDeptFilter, setStudentDeptFilter] = useState<string>('All');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState<string>('All');

  useEffect(() => {
    return subscribeToBackendHealth(setBackendStatus);
  }, []);

  // Sync initialSubTab if parent prop updates
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(resolveInitialTab(initialSubTab));
    }
  }, [initialSubTab]);

  // Load pending faculty approvals count
  const refreshPendingCount = async () => {
    try {
      const pending = await getPendingFacultyRequests();
      setPendingRequestsCount(pending.length);
    } catch {
      setPendingRequestsCount(0);
    }
  };

  useEffect(() => {
    refreshPendingCount();
  }, [activeTab]);

  if (loading) {
    return <LoadingScreen message="Restoring administrative session..." />;
  }

  // Strict Security Gate: Only authenticated administrators can access the dashboard
  if (role !== 'admin') {
    return <AdminAccessDenied onNavigate={onNavigate} />;
  }

  // Cross-module navigation handler
  const handleNavigateTab = (tab: string, filter?: string) => {
    if (tab === 'users' || tab === 'user-management') {
      setActiveTab('users');
    } else if (tab === 'students') {
      if (filter) setStudentDeptFilter(filter);
      setActiveTab('students');
    } else if (tab === 'faculty') {
      if (filter) setFacultyDeptFilter(filter);
      setActiveTab('faculty');
    } else if (tab === 'departments') {
      setActiveTab('departments');
    } else if (tab === 'facilities') {
      setActiveTab('facilities');
    } else if (tab === 'database') {
      setActiveTab('database');
    } else if (tab === 'faculty-requests') {
      setActiveTab('faculty-requests');
    } else if (tab === 'notices') {
      setActiveTab('notices');
    } else if (tab === 'events') {
      setActiveTab('events');
    } else if (tab === 'materials') {
      setActiveTab('materials');
    } else if (tab === 'audit') {
      setActiveTab('audit');
    } else if (tab === 'system') {
      setActiveTab('system');
    } else {
      setActiveTab('overview');
    }
  };

  const handleRefreshAll = () => {
    onRefreshNotices();
    onRefreshEvents();
    refreshPendingCount();
  };

  const tabs: {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'users', label: 'User & Role Management', icon: ShieldCheck },
    { id: 'departments', label: '14 Departments', icon: Building2, count: 14 },
    { id: 'faculty', label: 'Faculty Roster', icon: Users },
    { id: 'students', label: 'Student Directory', icon: GraduationCap },
    { 
      id: 'faculty-requests', 
      label: 'Faculty Approvals', 
      icon: UserCheck, 
      count: pendingRequestsCount, 
      badgeColor: pendingRequestsCount > 0 ? 'bg-amber-500 text-navy-950 animate-pulse' : undefined 
    },
    { id: 'notices', label: 'Manage Notices', icon: Bell, count: notices.length },
    { id: 'events', label: 'Manage Events', icon: Calendar, count: events.length },
    { id: 'materials', label: 'Upload Materials', icon: FileText },
    { id: 'facilities', label: 'Campus Facilities', icon: Layers },
    { id: 'database', label: 'Database Telemetry', icon: Database },
    { id: 'feedback', label: 'Student Grievances', icon: MessageSquare },
    { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert },
    { id: 'system', label: 'System & Supabase', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner / Super Admin Command Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] rounded-3xl p-6 sm:p-8 text-white border border-navy-700/80 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Portal</span>
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Government Polytechnic Ahmedabad
            </span>
            {backendStatus.status === 'connected' ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PostgreSQL Live ({backendStatus.projectRef})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Local Storage Fallback</span>
              </span>
            )}
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Central Institutional Governance Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Logged in as <strong className="text-white font-semibold">{user.name}</strong> (<code className="text-teal-300 text-xs font-mono">{user.email || 'campusonegpa@gmail.com'}</code>). Real-time telemetry, 14 academic departments, instructional staff, student directory, and infrastructure control.
          </p>
        </div>

        {/* Quick Status Pill Tray */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {pendingRequestsCount > 0 && (
            <button
              onClick={() => setActiveTab('faculty-requests')}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-bold flex items-center space-x-2 shadow-sm"
              title="View pending faculty approvals"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{pendingRequestsCount} Pending Approval{pendingRequestsCount > 1 ? 's' : ''}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="bg-navy-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-navy-700 text-xs text-right shadow-inner min-w-[140px]">
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Active Session</p>
            <p className="font-bold text-teal-400 text-sm mt-0.5 flex items-center justify-end space-x-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>SUPER ADMIN</span>
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner when Supabase is configured but tables are missing */}
      {backendStatus.status === 'schema_missing' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Required: Supabase Database Schema Incomplete</p>
              <p className="opacity-90 mt-0.5">
                Connected to Supabase project <code className="font-mono font-bold bg-amber-100 dark:bg-navy-900 px-1 py-0.5 rounded">[{backendStatus.projectRef}]</code>, but the required tables (<code className="font-mono">notices</code>, <code className="font-mono">events</code>, <code className="font-mono">profiles</code>, <code className="font-mono">facilities</code>) have not yet been created in PostgreSQL (Error <code className="font-mono">PGRST205</code>).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('system')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shrink-0 transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Run SQL Migration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-sm flex items-center space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950 shadow-md ring-1 ring-navy-900/20 dark:ring-teal-400/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  t.badgeColor || (isActive ? 'bg-white/20 dark:bg-navy-950/40 text-white dark:text-navy-950' : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300')
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Views */}
      <div className="transition-all">
        {activeTab === 'overview' && (
          <PlatformAnalytics 
            onNavigateTab={handleNavigateTab} 
            onRefreshAll={handleRefreshAll} 
          />
        )}

        {activeTab === 'users' && (
          <ManageUsers onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'departments' && (
          <ManageDepartments 
            onFilterStudents={(dept) => {
              setStudentDeptFilter(dept);
              setActiveTab('students');
            }}
            onFilterFaculty={(dept) => {
              setFacultyDeptFilter(dept);
              setActiveTab('faculty');
            }}
            onFilterNotices={() => {
              setActiveTab('notices');
            }}
          />
        )}

        {activeTab === 'faculty' && (
          <ManageFaculty 
            initialDepartmentFilter={facultyDeptFilter} 
          />
        )}

        {activeTab === 'students' && (
          <ManageStudents 
            initialDepartmentFilter={studentDeptFilter} 
          />
        )}

        {activeTab === 'faculty-requests' && (
          <ManageFacultyRequests />
        )}

        {activeTab === 'notices' && (
          <ManageNotices 
            notices={notices} 
            onRefreshNotices={onRefreshNotices} 
          />
        )}

        {activeTab === 'events' && (
          <ManageEvents 
            events={events} 
            onRefreshEvents={onRefreshEvents} 
          />
        )}

        {activeTab === 'materials' && (
          <ManageMaterials />
        )}

        {activeTab === 'facilities' && (
          <ManageFacilities />
        )}

        {activeTab === 'database' && (
          <DatabaseOverview />
        )}

        {activeTab === 'feedback' && (
          <ManageFeedback />
        )}

        {activeTab === 'audit' && (
          <AuditLogsViewer />
        )}

        {activeTab === 'system' && (
          <SystemSettings />
        )}
      </div>
    </div>
  );
};
