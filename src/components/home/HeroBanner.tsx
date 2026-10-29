import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award,
  ArrowRight,
  Sliders
} from 'lucide-react';

interface HeroBannerProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { setIsSearchOpen } = useNotifications();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-[#132d50] text-white shadow-xl border border-navy-700/60 p-6 sm:p-8">
      {/* Decorative Cyan Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Greeting and Context */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Government Polytechnic Ahmedabad
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-navy-800/80 text-slate-300 border border-navy-700">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {todayDate}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {getGreeting()}, <span className="text-brand-cyan">{user.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {role === 'student' && (
                <>
                  Welcome to your student portal. Access your lecture schedules, verify real-time attendance logs, track coursework assignments, and review published examination results.
                </>
              )}
              {role === 'faculty' && (
                <>
                  Welcome to the faculty portal. Take attendance for assigned classes, evaluate internal assessment marks, and view enrolled student profiles.
                </>
              )}
              {role === 'admin' && (
                <>
                  Administrator Control Active: Review pending faculty access requests, manage student academic records, publish circulars, and monitor campus services.
                </>
              )}
              {role === 'guest' && (
                <>
                  Discover academic programs, campus facilities, faculty research, student societies, and institutional circulars.
                </>
              )}
            </p>
          </div>

          {/* Quick action buttons & inline search */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 backdrop-blur-xs text-xs sm:text-sm font-medium transition-all group shadow-xs"
            >
              <Search className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
              <span>Search campus directory...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-black/30 rounded border border-white/20 font-mono">
                ⌘K
              </kbd>
            </button>

            {role === 'student' && (
              <button
                onClick={() => onNavigate('student', 'attendance')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-cyan/20 transition-all hover:scale-102"
              >
                <span>View Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {role === 'faculty' && (
              <button
                onClick={() => onNavigate('faculty-portal', 'academic')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-cyan/20 transition-all hover:scale-102"
              >
                <span>Take Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('admin', 'faculty-requests')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-cyan/20 transition-all hover:scale-102"
              >
                <span>Faculty Requests</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('notices')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <span>Recent Circulars</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 backdrop-blur-xs text-xs sm:text-sm font-semibold transition-all shadow-xs"
              title="Open Personalization & Settings"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Institutional Persona Snapshot */}
        <div className="lg:col-span-4 bg-navy-950/60 border border-navy-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Award className="w-3.5 h-3.5 mr-1.5 text-brand-cyan" />
              {role === 'student' && 'Student Standing'}
              {role === 'faculty' && 'Faculty Member'}
              {role === 'admin' && 'System Authority'}
              {role === 'guest' && 'Campus Portal'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
              role === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {role === 'student' && 'Enrolled'}
              {role === 'faculty' && 'Active Faculty'}
              {role === 'admin' && 'Administrator'}
              {role === 'guest' && 'Public Access'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-800">
              <p className="text-[11px] text-slate-400 font-medium">Department</p>
              <p className="text-xs font-bold text-white mt-1 line-clamp-2">
                {user.department || 'Government Polytechnic Ahmedabad'}
              </p>
            </div>

            <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-800">
              <p className="text-[11px] text-slate-400 font-medium">
                {role === 'student' ? 'Roll / PRN' : role === 'faculty' ? 'Designation' : 'Portal Mode'}
              </p>
              <p className="text-xs font-mono font-bold text-brand-cyan mt-1 truncate">
                {role === 'student'
                  ? (user.rollNumber || user.prn || 'Registered')
                  : role === 'faculty'
                  ? (user.designation || 'Lecturer')
                  : role === 'admin'
                  ? 'Institutional Control'
                  : 'GPA Ahmedabad'}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              {role === 'student' && `Sem ${user.semester || 1} • Div ${user.division || 'A'}`}
              {role === 'faculty' && 'Government Polytechnic Ahmedabad'}
              {role === 'admin' && 'Row Level Security Active'}
              {role === 'guest' && 'Directorate of Technical Education'}
            </span>
            <span className="font-mono text-slate-300">
              {role === 'student' && user.email}
              {role === 'faculty' && user.email}
              {role === 'admin' && 'Super Admin'}
              {role === 'guest' && 'Visitor'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
