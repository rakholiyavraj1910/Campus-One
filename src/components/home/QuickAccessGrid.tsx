import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Bell, 
  Award, 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin,
  ArrowUpRight
} from 'lucide-react';

interface QuickAccessGridProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ onNavigate }) => {
  const quickCards = [
    {
      id: 'timetable',
      title: 'Class Timetable',
      desc: 'Today: 4 lectures & 1 lab slot',
      icon: Clock,
      page: 'student',
      subTab: 'timetable',
      accentColor: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-500',
      badge: 'Active Now'
    },
    {
      id: 'attendance',
      title: 'Attendance Tracker',
      desc: '84.6% Aggregate (5 Safe, 1 Warning)',
      icon: CheckCircle2,
      page: 'student',
      subTab: 'attendance',
      accentColor: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-500',
      badge: 'Threshold 75%'
    },
    {
      id: 'notices',
      title: 'Official Circulars',
      desc: '6 active notices, 2 urgent exams',
      icon: Bell,
      page: 'notices',
      accentColor: 'from-rose-500/10 to-rose-500/5',
      iconColor: 'text-rose-500',
      badge: '2 Urgent'
    },
    {
      id: 'results',
      title: 'Marks & Results',
      desc: 'Midterms, quiz scores & SGPA 8.92',
      icon: Award,
      page: 'student',
      subTab: 'marks',
      accentColor: 'from-amber-500/10 to-amber-500/5',
      iconColor: 'text-amber-500',
      badge: 'Midterms Out'
    },
    {
      id: 'events',
      title: 'Events & Fests',
      desc: 'HackNova 2026, Aura Fest, Keynotes',
      icon: Calendar,
      page: 'events',
      accentColor: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-500',
      badge: 'Register'
    },
    {
      id: 'faculty',
      title: 'Faculty Directory',
      desc: 'Find cabins, emails & office hours',
      icon: Users,
      page: 'campus',
      subTab: 'faculty',
      accentColor: 'from-brand-cyan/15 to-brand-cyan/5',
      iconColor: 'text-brand-cyan',
      badge: 'Search'
    },
    {
      id: 'library',
      title: 'Central Library',
      desc: 'Search 65,000+ books & digital journals',
      icon: BookOpen,
      page: 'campus',
      subTab: 'library',
      accentColor: 'from-indigo-500/10 to-indigo-500/5',
      iconColor: 'text-indigo-500',
      badge: '24x7 Open'
    },
    {
      id: 'map',
      title: 'Interactive Campus Map',
      desc: 'Floor navigations, blocks & facilities',
      icon: MapPin,
      page: 'campus',
      subTab: 'map',
      accentColor: 'from-teal-500/10 to-teal-500/5',
      iconColor: 'text-teal-500',
      badge: 'Vector Map'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy-900 dark:text-white flex items-center space-x-2">
          <span>Quick Campus Services</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
            8 Portals
          </span>
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          One-click access to all student and campus operations
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.page, card.subTab)}
              className="group relative bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-navy-800 hover:border-brand-cyan/60 dark:hover:border-brand-cyan/60 shadow-sm hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle gradient hover wash */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-navy-800/90 flex items-center justify-center ${card.iconColor} shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-navy-700">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors">
                    {card.title}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-brand-cyan transition-all" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
