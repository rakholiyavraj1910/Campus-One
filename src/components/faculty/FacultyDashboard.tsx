import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bell, 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Upload, 
  Plus, 
  CheckCircle2, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Download,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Notice, StudyMaterial, EventItem } from '../../types';
import { getFacultyDashboardMetrics, FacultyDashboardMetrics } from '../../lib/storageService';
import { UserAvatar } from '../common/UserAvatar';

interface FacultyDashboardProps {
  user: UserProfile;
  onNavigateTab: (tab: string) => void;
  onRefreshAll: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  user,
  onNavigateTab,
  onRefreshAll
}) => {
  const [metrics, setMetrics] = useState<FacultyDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const facultyDept = user.department || 'Computer Engineering';

  const loadMetrics = async () => {
    try {
      const data = await getFacultyDashboardMetrics(user.email, facultyDept);
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load faculty metrics:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [user.email, facultyDept]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMetrics();
    onRefreshAll();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Faculty Welcome & Department Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] text-white border border-navy-700/80 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center space-x-4">
          <UserAvatar
            name={user.name}
            src={user.avatar}
            role="faculty"
            size="lg"
            className="ring-4 ring-teal-500/30 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Instructional Faculty
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {user.designation || 'Assistant Professor'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Prof. {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <strong>{facultyDept}</strong>
              </span>
              {user.cabin && (
                <span>• Cabin: <strong className="text-white">{user.cabin}</strong></span>
              )}
              {user.consultationHours && (
                <span>• Hours: <span className="text-teal-300">{user.consultationHours}</span></span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Refresh & Profile Shortcut */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-2xl bg-navy-900/90 hover:bg-navy-800 border border-navy-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md"
          >
            <span>My Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Dept Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy-950 dark:text-white mt-2">
            {loading ? '—' : metrics?.totalStudentsInDept ?? 0}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center space-x-1">
            <span>Enrolled in {facultyDept}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Metric 2: Notices */}
        <div 
          onClick={() => onNavigateTab('notices')}
          className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Circulars &amp; Notices</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy-950 dark:text-white mt-2">
            {loading ? '—' : metrics?.publishedNoticesCount ?? 0}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 flex items-center space-x-1">
            <span>Published across {facultyDept}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Metric 3: Study Materials */}
        <div 
          onClick={() => onNavigateTab('materials')}
          className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Study Materials</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy-950 dark:text-white mt-2">
            {loading ? '—' : metrics?.uploadedMaterialsCount ?? 0}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center space-x-1">
            <span>Notes, Question Papers, Labs</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Metric 4: Events */}
        <div 
          onClick={() => onNavigateTab('events')}
          className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Events</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-navy-950 dark:text-white mt-2">
            {loading ? '—' : metrics?.upcomingEventsCount ?? 0}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center space-x-1">
            <span>Seminars &amp; Workshops</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* 3. Action Hub Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-navy-950 dark:text-white">
            Quick Faculty Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish notices, upload notes, host events, or log classroom attendance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('notices')}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Notice</span>
          </button>

          <button
            onClick={() => onNavigateTab('materials')}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>

          <button
            onClick={() => onNavigateTab('events')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Event</span>
          </button>

          <button
            onClick={() => onNavigateTab('academic')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Record Attendance</span>
          </button>
        </div>
      </div>

      {/* 4. Split Activity Section: Recent Materials & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column A: Recent Study Materials */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-navy-950 dark:text-white">
                  Recently Uploaded Study Materials
                </h3>
                <p className="text-[11px] text-slate-500">Available to students in your department</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('materials')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-xs text-slate-400">Loading study materials...</p>
            ) : !metrics?.recentMaterials?.length ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <BookOpen className="w-6 h-6 mx-auto text-slate-300 dark:text-navy-700 mb-1" />
                <p className="text-xs font-semibold text-slate-500">No materials uploaded yet</p>
                <p className="text-[11px] text-slate-400">Upload lecture notes, question banks, or lab manuals.</p>
              </div>
            ) : (
              metrics.recentMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-navy-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {mat.subjectCode}
                      </span>
                      <span className="text-xs font-bold text-navy-950 dark:text-white truncate">
                        {mat.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {mat.subjectName} • Sem {mat.semester} • {mat.fileSize}
                    </p>
                  </div>

                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-teal-400 transition-colors shrink-0"
                    title="Download material"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column B: Recent Notices */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-navy-950 dark:text-white">
                  Recent Department Notices
                </h3>
                <p className="text-[11px] text-slate-500">Official circulars &amp; academic alerts</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <p className="py-6 text-center text-xs text-slate-400">Loading notices...</p>
            ) : !metrics?.recentNotices?.length ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-300 dark:text-navy-700 mb-1" />
                <p className="text-xs font-semibold text-slate-500">No notices published yet</p>
                <p className="text-[11px] text-slate-400">Publish a circular for your class or department.</p>
              </div>
            ) : (
              metrics.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-navy-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      {notice.isUrgent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500 text-white">
                          URGENT
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                        {notice.category}
                      </span>
                      <span className="text-xs font-bold text-navy-950 dark:text-white truncate">
                        {notice.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {notice.department} • {notice.date}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {notice.views} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
