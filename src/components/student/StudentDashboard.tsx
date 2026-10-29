import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { RoleAdaptiveProfile } from '../profile/RoleAdaptiveProfile';
import { AttendanceTracker } from './AttendanceTracker';
import { TimetableSchedule } from './TimetableSchedule';
import { MarksAndResults } from './MarksAndResults';
import { AssignmentTracker } from './AssignmentTracker';
import { StudyMaterialsHub } from './StudyMaterialsHub';
import { ExamCenter } from './ExamCenter';
import { AcademicCalendarView } from './AcademicCalendarView';
import { FeesManagement } from './FeesManagement';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  Award, 
  FileText, 
  Download, 
  Calendar,
  Sparkles,
  Receipt,
  ShieldCheck,
  Sliders
} from 'lucide-react';

interface StudentDashboardProps {
  currentSubTab?: string;
  onNavigateSubTab: (subTab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentSubTab = 'profile',
  onNavigateSubTab
}) => {
  const { role } = useAuth();
  const { isWidgetVisible } = usePreferences();

  const profileLabel = role === 'admin' 
    ? 'Administrator Identity' 
    : role === 'faculty' 
      ? 'Faculty Profile' 
      : 'Student Profile';

  const ProfileIcon = role === 'admin' ? ShieldCheck : User;

  const tabs = [
    { id: 'profile', label: profileLabel, icon: ProfileIcon },
    { id: 'timetable', label: 'Class Timetable', icon: Clock },
    { id: 'attendance', label: 'Attendance Tracker', icon: CheckCircle2 },
    { id: 'marks', label: 'Internal Marks & SGPA', icon: Award },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'materials', label: 'Notes & PYQ Papers', icon: Download },
    { id: 'exams', label: 'Exam Center & Hall Ticket', icon: Award },
    { id: 'fees', label: 'Fees & Payment', icon: Receipt },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
  ];

  const isTabAllowed = (tabId: string) => {
    if (tabId === 'profile' || tabId === 'fees' || tabId === 'marks' || tabId === 'exams' || tabId === 'calendar') return true;
    if (tabId === 'timetable') return isWidgetVisible('student', 'timetableToday');
    if (tabId === 'attendance') return isWidgetVisible('student', 'attendanceOverview');
    if (tabId === 'materials') return isWidgetVisible('student', 'studyMaterials');
    return true;
  };

  const visibleTabs = tabs.filter(t => isTabAllowed(t.id));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Admin Preview Notice */}
      {role === 'admin' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs font-medium">
              <strong className="font-bold">Administrative View:</strong> You are currently previewing the Student Academic Dashboard. Your administrator credentials and clearance are preserved.
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = '/admin';
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Go to Admin Control Center &rarr;
          </button>
        </div>
      )}

      {/* Sub-tab Navigation Bar with Personalization Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none momentum-scroll flex-1">
          {visibleTabs.map((t) => {
            const Icon = t.icon;
            const isActive = currentSubTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onNavigateSubTab(t.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold whitespace-nowrap btn-tactile transition-all shrink-0 ${
                  isActive
                    ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/settings';
            }
          }}
          className="p-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors shrink-0 shadow-xs flex items-center space-x-1.5 text-xs font-semibold btn-tactile cursor-pointer"
          title="Personalize Dashboard Views & Theme"
        >
          <Sliders className="w-4 h-4 text-purple-500" />
          <span className="hidden sm:inline">Customize Views</span>
        </button>
      </div>

      {/* Tab Contents */}
      {currentSubTab === 'profile' && <RoleAdaptiveProfile />}
      {currentSubTab === 'timetable' && <TimetableSchedule />}
      {currentSubTab === 'attendance' && <AttendanceTracker />}
      {currentSubTab === 'marks' && <MarksAndResults />}
      {currentSubTab === 'assignments' && <AssignmentTracker />}
      {currentSubTab === 'materials' && <StudyMaterialsHub />}
      {currentSubTab === 'exams' && <ExamCenter />}
      {currentSubTab === 'fees' && <FeesManagement />}
      {currentSubTab === 'calendar' && <AcademicCalendarView />}
    </div>
  );
};
