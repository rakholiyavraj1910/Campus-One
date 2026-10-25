import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  GraduationCap, 
  Compass, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Download, 
  Building2, 
  Users, 
  Coffee, 
  Briefcase, 
  HelpCircle, 
  PhoneCall, 
  X,
  MapPin,
  ChevronRight,
  Lock
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  currentSubTab?: string;
  onNavigate: (page: string, subTab?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  currentSubTab,
  onNavigate
}) => {
  const { role, canManageContent } = useAuth();

  const handleNav = (page: string, subTab?: string) => {
    onNavigate(page, subTab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Campus Overview',
      icon: Home,
      badge: null
    },
    {
      id: 'about',
      label: 'About CampusOne',
      icon: Building2,
      badge: null
    },
    {
      id: 'student',
      label: 'Student Portal',
      icon: GraduationCap,
      subItems: [
        { id: 'profile', label: 'Student Profile' },
        { id: 'timetable', label: 'Class Timetable' },
        { id: 'attendance', label: 'Attendance Tracker' },
        { id: 'marks', label: 'Internal Marks & SGPA' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'materials', label: 'Notes & PYQ Papers' },
        { id: 'exams', label: 'Exam Center & Hall Ticket' },
        { id: 'calendar', label: 'Academic Calendar' }
      ]
    },
    {
      id: 'faculty-portal',
      label: 'Faculty Portal',
      icon: Users,
      badge: role === 'faculty' ? 'Authorized' : null,
    },
    {
      id: 'campus',
      label: 'Campus Hub',
      icon: Compass,
      subItems: [
        { id: 'departments', label: 'Departments & Labs' },
        { id: 'faculty', label: 'Faculty Directory' },
        { id: 'facilities', label: 'Campus Facilities' },
        { id: 'library', label: 'Central Library' },
        { id: 'map', label: 'Interactive Campus Map' },
        { id: 'canteen', label: 'Canteen & Food' },
        { id: 'clubs', label: 'Clubs & Societies' },
        { id: 'placement', label: 'Placement Cell' },
        { id: 'offices', label: 'Offices & FAQs' }
      ]
    },
    {
      id: 'notices',
      label: 'Notices & Circulars',
      icon: Bell,
      badge: 'Live'
    },
    {
      id: 'events',
      label: 'Events & Fests',
      icon: Calendar,
      badge: 'New'
    },
    {
      id: 'contact',
      label: 'Contact & Help',
      icon: HelpCircle,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-navy-800 lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-brand-cyan flex items-center justify-center text-white dark:text-navy-950 font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-navy-900 dark:text-white">CampusOne</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Main Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => handleNav(item.id, item.subItems ? item.subItems[0].id : undefined)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 font-semibold shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-brand-cyan dark:text-navy-950' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white dark:bg-navy-900/30 dark:text-navy-950' 
                            : 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Sub-items when active */}
                    {isActive && item.subItems && (
                      <div className="ml-8 pl-3 border-l-2 border-brand-cyan/30 space-y-1 py-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = currentSubTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleNav(item.id, sub.id)}
                              className={`w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                isSubActive
                                  ? 'text-brand-cyan font-bold bg-brand-cyan/10'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <span>{sub.label}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Admin / Staff Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </p>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                role === 'admin'
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-400 border-slate-200 dark:border-navy-700'
              }`}>
                {role === 'admin' ? 'Authorized' : 'Admin Only'}
              </span>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => handleNav('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  currentPage === 'admin'
                    ? 'bg-amber-500 text-navy-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {role === 'admin' ? (
                    <ShieldCheck className={`w-5 h-5 ${currentPage === 'admin' ? 'text-navy-950' : 'text-amber-500'}`} />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                  <span>Admin Control Center</span>
                </div>
                {role !== 'admin' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-navy-800 text-slate-400">
                    Restricted
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-60" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Footer: Quick Emergency Helpline */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60">
          <div className="bg-navy-900 text-white dark:bg-navy-800 p-3.5 rounded-2xl shadow-sm border border-navy-700/60">
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">24x7 Campus Helpline</p>
                <p className="text-[11px] font-mono text-brand-cyan">+91 98200 99999</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Direct line to Medical Center, Campus Security, and Anti-Ragging Cell.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
