import React from 'react';
import { ProfileCard } from './ProfileCard';
import { AttendanceTracker } from './AttendanceTracker';
import { TimetableSchedule } from './TimetableSchedule';
import { MarksAndResults } from './MarksAndResults';
import { AssignmentTracker } from './AssignmentTracker';
import { StudyMaterialsHub } from './StudyMaterialsHub';
import { ExamCenter } from './ExamCenter';
import { AcademicCalendarView } from './AcademicCalendarView';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  Award, 
  FileText, 
  Download, 
  Calendar,
  Sparkles 
} from 'lucide-react';

interface StudentDashboardProps {
  currentSubTab?: string;
  onNavigateSubTab: (subTab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentSubTab = 'profile',
  onNavigateSubTab
}) => {
  const tabs = [
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'timetable', label: 'Class Timetable', icon: Clock },
    { id: 'attendance', label: 'Attendance Tracker', icon: CheckCircle2 },
    { id: 'marks', label: 'Internal Marks & SGPA', icon: Award },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'materials', label: 'Notes & PYQ Papers', icon: Download },
    { id: 'exams', label: 'Exam Center & Hall Ticket', icon: Award },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-tab Navigation Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentSubTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onNavigateSubTab(t.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Tab Contents */}
      {currentSubTab === 'profile' && <ProfileCard />}
      {currentSubTab === 'timetable' && <TimetableSchedule />}
      {currentSubTab === 'attendance' && <AttendanceTracker />}
      {currentSubTab === 'marks' && <MarksAndResults />}
      {currentSubTab === 'assignments' && <AssignmentTracker />}
      {currentSubTab === 'materials' && <StudyMaterialsHub />}
      {currentSubTab === 'exams' && <ExamCenter />}
      {currentSubTab === 'calendar' && <AcademicCalendarView />}
    </div>
  );
};
