import React, { useState, useEffect } from 'react';
import { PlatformAnalytics } from './PlatformAnalytics';
import { ManageNotices } from './ManageNotices';
import { ManageEvents } from './ManageEvents';
import { ManageFaculty } from './ManageFaculty';
import { ManageMaterials } from './ManageMaterials';
import { ManageStudents } from './ManageStudents';
import { ManageFacultyRequests } from './ManageFacultyRequests';
import { SystemSettings } from './SystemSettings';
import { AuditLogsViewer } from './AuditLogsViewer';
import { ManageFeedback } from './ManageFeedback';
import { AdminAccessDenied } from '../common/AdminAccessDenied';
import { Notice, EventItem } from '../../types';
import { 
  BarChart3, 
  Bell, 
  Calendar, 
  Users, 
  FileText, 
  ShieldCheck, 
  Settings, 
  ShieldAlert, 
  MessageSquare, 
  AlertTriangle, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBackendStatus, BackendStatus, subscribeToBackendHealth } from '../../lib/supabaseClient';

interface AdminDashboardProps {
  notices: Notice[];
  events: EventItem[];
  onRefreshNotices: () => void;
  onRefreshEvents: () => void;
  onNavigate?: (page: string, subTab?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  notices,
  events,
  onRefreshNotices,
  onRefreshEvents,
  onNavigate = () => {}
}) => {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'faculty-requests' | 'notices' | 'events' | 'faculty' | 'materials' | 'students' | 'audit' | 'feedback' | 'system'>('analytics');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());

  useEffect(() => {
    return subscribeToBackendHealth(setBackendStatus);
  }, []);

  // Strict Security Gate: Only authenticated administrators can access the dashboard
  if (role !== 'admin') {
    return <AdminAccessDenied onNavigate={onNavigate} />;
  }

  const tabs = [
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'faculty-requests', label: 'Faculty Approvals', icon: UserCheck },
    { id: 'notices', label: 'Manage Notices', icon: Bell, count: notices.length },
    { id: 'events', label: 'Manage Events', icon: Calendar, count: events.length },
    { id: 'faculty', label: 'Faculty Roster', icon: Users },
    { id: 'materials', label: 'Upload Materials', icon: FileText },
    { id: 'students', label: 'Student Accounts', icon: ShieldCheck },
    { id: 'feedback', label: 'Student Grievances', icon: MessageSquare },
    { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert },
    { id: 'system', label: 'System & Supabase', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Administrative Control Center
            </span>
            <span className="text-xs text-slate-300">Authorized Personnel Only</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            College Operations &amp; Management Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome, <strong className="text-white">{user.name}</strong> ({role.toUpperCase()}). You have privileges to publish notices, manage schedules, and review analytics.
          </p>
        </div>

        <div className="bg-navy-950/70 p-3 rounded-2xl border border-navy-700 text-xs text-right shrink-0">
          <p className="text-slate-400">Authenticated Role</p>
          <p className="font-bold text-amber-400 text-sm">{role.toUpperCase()}</p>
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
                Connected to Supabase project <code className="font-mono font-bold bg-amber-100 dark:bg-navy-900 px-1 py-0.5 rounded">[{backendStatus.projectRef}]</code>, but the required tables (<code className="font-mono">notices</code>, <code className="font-mono">events</code>, <code className="font-mono">profiles</code>) have not yet been created in PostgreSQL (Error <code className="font-mono">PGRST205</code>).
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

      {/* Sub Tabs */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap btn-tactile transition-all ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-amber-500 dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 dark:bg-navy-950/30' : 'bg-slate-200 dark:bg-navy-800'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'analytics' && <PlatformAnalytics notices={notices} events={events} />}
      {activeTab === 'faculty-requests' && <ManageFacultyRequests />}
      {activeTab === 'notices' && <ManageNotices notices={notices} onRefreshNotices={onRefreshNotices} />}
      {activeTab === 'events' && <ManageEvents events={events} onRefreshEvents={onRefreshEvents} />}
      {activeTab === 'faculty' && <ManageFaculty />}
      {activeTab === 'materials' && <ManageMaterials />}
      {activeTab === 'students' && <ManageStudents />}
      {activeTab === 'feedback' && <ManageFeedback />}
      {activeTab === 'audit' && <AuditLogsViewer />}
      {activeTab === 'system' && <SystemSettings />}
    </div>
  );
};
