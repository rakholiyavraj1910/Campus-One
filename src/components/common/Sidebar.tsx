import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CampusOneLogo } from './CampusOneLogo';
import { 
  Home, 
  GraduationCap, 
  Compass, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Users, 
  HelpCircle, 
  X,
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
  const { role } = useAuth();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024 && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNav = (page: string, subTab?: string) => {
    onNavigate(page, subTab);
    // On mobile, close drawer after selection
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
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

  const renderNavList = () => (
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
                  type="button"
                  onClick={() => handleNav(item.id, item.subItems ? item.subItems[0].id : undefined)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
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
                          type="button"
                          key={sub.id}
                          onClick={() => handleNav(item.id, sub.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
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
            type="button"
            onClick={() => handleNav('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
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
  );

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile Navigation Drawer"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-navy-800 shrink-0">
          <CampusOneLogo variant="full" size="sm" withBadge />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors focus:outline-none"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavList()}
      </aside>

      {/* 3. Desktop Sticky In-Flow Sidebar (Never overlaps content; collapses smoothly) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 self-start sticky top-20 bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl shadow-xs transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen 
            ? 'w-64 opacity-100 visible' 
            : 'w-0 opacity-0 invisible border-0 p-0 m-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
        aria-label="Desktop Sidebar Navigation"
      >
        {isOpen && (
          <div className="w-64 flex flex-col h-full min-h-0">
            {renderNavList()}
          </div>
        )}
      </aside>
    </>
  );
};
