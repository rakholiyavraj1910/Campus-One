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
  ArrowRight
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
                  You have <span className="text-white font-semibold">4 classes today</span> and 1 upcoming assignment due in 5 days. Your current aggregate attendance is healthy at <span className="text-brand-cyan font-bold">84.6%</span>.
                </>
              )}
              {role === 'faculty' && (
                <>
                  Welcome to the faculty portal. You have 2 lecture hours scheduled today in Room LH-302 and 1 project mentoring session.
                </>
              )}
              {role === 'admin' && (
                <>
                  Administrator Control Active: All 4 campus clusters, servers, and library checkouts operating smoothly.
                </>
              )}
              {role === 'guest' && (
                <>
                  Discover academic programs, campus facilities, faculty research, student societies, and university events.
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
                onClick={() => onNavigate('student', 'timetable')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-cyan/20 transition-all hover:scale-102"
              >
                <span>View Today's Classes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('notices')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <span>Recent Circulars</span>
            </button>
          </div>
        </div>

        {/* Right Column: Key Metric Snapshot Card */}
        <div className="lg:col-span-4 bg-navy-950/60 border border-navy-700/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Award className="w-3.5 h-3.5 mr-1.5 text-brand-cyan" />
              Academic Standing
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Good Standing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-800">
              <p className="text-[11px] text-slate-400 font-medium">Cumulative CGPA</p>
              <p className="text-xl font-extrabold text-white mt-0.5">8.92</p>
              <p className="text-[10px] text-brand-cyan font-semibold mt-0.5 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Top 5%
              </p>
            </div>

            <div className="bg-navy-900/80 p-3 rounded-xl border border-navy-800">
              <p className="text-[11px] text-slate-400 font-medium">Overall Attendance</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">84.6%</p>
              <p className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">
                Safe (&gt;75% min)
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Branch: B.Tech CSE (Sem 6)</span>
            <span className="font-mono text-slate-300">Roll: 21CS104</span>
          </div>
        </div>
      </div>
    </div>
  );
};
