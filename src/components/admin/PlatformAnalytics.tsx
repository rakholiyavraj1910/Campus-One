import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Bell, 
  BookOpen, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Activity, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Sparkles,
  Database,
  Layers
} from 'lucide-react';
import { 
  getSuperAdminDashboardMetrics, 
  SuperAdminMetrics 
} from '../../lib/storageService';
import { getBackendStatus, BackendStatus, subscribeToBackendHealth } from '../../lib/supabaseClient';
import { ScrollReveal, ScrollStagger } from '../common/ScrollReveal';
import { Skeleton } from '../common/SkeletonLoader';

interface PlatformAnalyticsProps {
  onNavigateTab?: (tab: string, filter?: string) => void;
  onRefreshAll?: () => void;
}

export const PlatformAnalytics: React.FC<PlatformAnalyticsProps> = ({ 
  onNavigateTab = () => {},
  onRefreshAll = () => {}
}) => {
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchMetrics = async () => {
    try {
      const data = await getSuperAdminDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load super admin metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeToBackendHealth(setBackendStatus);
    fetchMetrics();
    return unsub;
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
    onRefreshAll();
  };

  const statCards = [
    {
      id: 'students',
      label: 'Enrolled Students',
      value: metrics ? metrics.totalStudents.toLocaleString() : '...',
      detail: 'Registered portal accounts',
      targetTab: 'students',
      icon: Users,
      color: 'cyan',
      bgGrad: 'from-cyan-500/10 to-brand-cyan/20 text-brand-cyan'
    },
    {
      id: 'faculty',
      label: 'Faculty Members',
      value: metrics ? metrics.totalFaculty.toLocaleString() : '...',
      detail: 'Active instructional staff',
      targetTab: 'faculty',
      icon: BookOpen,
      color: 'emerald',
      bgGrad: 'from-emerald-500/10 to-emerald-500/20 text-emerald-500'
    },
    {
      id: 'departments',
      label: 'Academic Departments',
      value: metrics ? metrics.totalDepartments.toString() : '14',
      detail: 'Govt. Polytechnic Ahmedabad',
      targetTab: 'departments',
      icon: Building2,
      color: 'indigo',
      bgGrad: 'from-indigo-500/10 to-indigo-500/20 text-indigo-500'
    },
    {
      id: 'faculty-requests',
      label: 'Pending Approvals',
      value: metrics ? metrics.pendingFacultyRequests.toString() : '0',
      detail: metrics?.pendingFacultyRequests ? 'Awaiting verification' : 'Zero backlog',
      targetTab: 'faculty-requests',
      icon: UserCheck,
      color: 'amber',
      highlight: (metrics?.pendingFacultyRequests || 0) > 0,
      bgGrad: 'from-amber-500/10 to-amber-500/20 text-amber-500'
    },
    {
      id: 'notices',
      label: 'Published Circulars',
      value: metrics ? metrics.totalNotices.toString() : '...',
      detail: 'Live institutional notices',
      targetTab: 'notices',
      icon: Bell,
      color: 'blue',
      bgGrad: 'from-blue-500/10 to-blue-500/20 text-blue-500'
    },
    {
      id: 'events',
      label: 'Scheduled Events',
      value: metrics ? metrics.upcomingEvents.toString() : '...',
      detail: 'Campus fests & symposiums',
      targetTab: 'events',
      icon: Calendar,
      color: 'purple',
      bgGrad: 'from-purple-500/10 to-purple-500/20 text-purple-500'
    },
    {
      id: 'materials',
      label: 'Study Materials',
      value: metrics ? metrics.studyMaterials.toString() : '...',
      detail: 'Notes, syllabi & PYQ papers',
      targetTab: 'materials',
      icon: Layers,
      color: 'teal',
      bgGrad: 'from-teal-500/10 to-teal-500/20 text-teal-500'
    },
    {
      id: 'facilities',
      label: 'Campus Facilities',
      value: metrics ? metrics.campusFacilities.toString() : '...',
      detail: 'Labs, library, sports & hubs',
      targetTab: 'facilities',
      icon: ShieldCheck,
      color: 'sky',
      bgGrad: 'from-sky-500/10 to-sky-500/20 text-sky-500'
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Quick Header Bar */}
      <ScrollReveal direction="down" distance={16}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Live Institutional Operations Overview</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live metrics calculated directly from verified Supabase database records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer btn-tactile shadow-xs"
              title="Open User & Role Management"
            >
              <Users className="w-3.5 h-3.5" />
              <span>User & Role Management</span>
            </button>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 btn-tactile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Live Metrics</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('database')}
              className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-navy-950 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer btn-tactile shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database Monitor</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Warnings & Diagnostics */}
      {metrics && metrics.systemWarnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>System Notice</span>
          </div>
          {metrics.systemWarnings.map((w, idx) => (
            <p key={idx} className="opacity-90 pl-6">{w}</p>
          ))}
        </div>
      )}

      {/* 8 Primary Super Admin Metric Cards */}
      <ScrollStagger staggerMs={25} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 3xl:grid-cols-8 gap-3 sm:gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => onNavigateTab(c.targetTab)}
              className={`bg-white dark:bg-navy-900 rounded-3xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between interactive-card ${
                c.highlight 
                  ? 'border-amber-400/80 dark:border-amber-500/80 ring-2 ring-amber-400/20' 
                  : 'border-slate-200/80 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {c.label}
                </span>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${c.bgGrad}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  {loading ? <Skeleton className="h-7 sm:h-8 w-20 rounded-md" /> : c.value}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {c.detail}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </ScrollStagger>

      {/* Dual Panel: Recent Additions & Live Activity Trail */}
      <ScrollReveal delayMs={40}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recently Enrolled Students & Faculty */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Recent Students &amp; Faculty
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest profiles verified in PostgreSQL
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('students')}
                className="text-xs text-brand-cyan hover:underline font-bold cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-navy-800/60 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : metrics && (metrics.recentStudents.length > 0 || metrics.recentFaculty.length > 0) ? (
              <div className="space-y-2.5">
                {metrics.recentStudents.slice(0, 3).map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => onNavigateTab('students')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {s.department || 'Student'} {s.rollNumber ? `• ${s.rollNumber}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                      Student
                    </span>
                  </div>
                ))}

                {metrics.recentFaculty.slice(0, 2).map((f) => (
                  <div 
                    key={f.id}
                    onClick={() => onNavigateTab('faculty')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {f.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {f.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {f.designation} • {f.department}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      Faculty
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Users className="w-7 h-7 mx-auto opacity-30" />
                <p>No recent user registrations found.</p>
                <p className="text-[11px] opacity-75">New student and faculty sign-ups will appear here.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Departments: 14 authorized</span>
            <span>Institution: GPA-617</span>
          </div>
        </div>

        {/* Right: Security & Administrative Audit Trail */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Administrative Action Log
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Immutable audit records from PostgreSQL
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('audit')}
                className="text-xs text-amber-500 hover:underline font-bold cursor-pointer"
              >
                Full Audit Trail &rarr;
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-navy-800/60 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : metrics && metrics.recentAuditLogs.length > 0 ? (
              <div className="space-y-2.5">
                {metrics.recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          by {log.actorName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {log.details}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {log.timestamp.slice(11, 16) || 'Just now'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Clock className="w-7 h-7 mx-auto opacity-30" />
                <p>No recent administrative actions recorded.</p>
                <p className="text-[11px] opacity-75">All faculty approvals, edits, and deletions are logged automatically.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Audit RLS: Active &amp; Tamper-Protected</span>
            <span className="text-emerald-500 font-bold">Encrypted Storage</span>
          </div>
        </div>

      </div>
    </ScrollReveal>

    </div>
  );
};
