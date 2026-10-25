import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentPage: string;
  currentSubTab?: string;
  onNavigate: (page: string, subTab?: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage, currentSubTab, onNavigate }) => {
  const getPageTitle = (p: string) => {
    switch (p) {
      case 'home': return 'Campus Home';
      case 'about': return 'About CampusOne';
      case 'contact': return 'Contact & Helpdesk';
      case 'student': return 'Student Portal';
      case 'faculty-portal': return 'Faculty Portal';
      case 'campus': return 'Campus Information Hub';
      case 'notices': return 'Notice Board';
      case 'events': return 'Events & Fests';
      case 'admin': return 'Staff Administration';
      default: return p.charAt(0).toUpperCase() + p.slice(1);
    }
  };

  const getSubTabTitle = (sub: string) => {
    switch (sub) {
      case 'profile': return 'Student Profile';
      case 'timetable': return 'Timetable';
      case 'attendance': return 'Attendance Tracker';
      case 'marks': return 'Internal Marks';
      case 'assignments': return 'Assignments';
      case 'materials': return 'Study Materials';
      case 'exams': return 'Exam Center';
      case 'calendar': return 'Academic Calendar';
      case 'departments': return 'Departments & Labs';
      case 'faculty': return 'Faculty Directory';
      case 'facilities': return 'Campus Facilities';
      case 'library': return 'Central Library';
      case 'map': return 'Campus Map';
      case 'canteen': return 'Food & Dining';
      case 'clubs': return 'Student Clubs';
      case 'placement': return 'Placement Cell';
      case 'offices': return 'Offices & Helplines';
      default: return sub.charAt(0).toUpperCase() + sub.slice(1);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-5 overflow-x-auto scrollbar-none py-1">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center space-x-1 hover:text-brand-cyan transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="font-semibold">Home</span>
      </button>

      {currentPage !== 'home' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <button
            onClick={() => onNavigate(currentPage)}
            className={`font-semibold hover:text-brand-cyan transition-colors ${
              !currentSubTab ? 'text-brand-cyan font-bold' : ''
            }`}
          >
            {getPageTitle(currentPage)}
          </button>
        </>
      )}

      {currentSubTab && (
        <>
          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
            {getSubTabTitle(currentSubTab)}
          </span>
        </>
      )}
    </nav>
  );
};
