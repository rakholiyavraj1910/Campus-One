import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { saveAttendanceSession } from '../../lib/storageService';
import { StudentDirectory } from './StudentDirectory';
import { StudentProfileView } from './StudentProfileView';
import { FacultyProfilePage } from '../profile/FacultyProfilePage';
import { FacultyDashboard } from './FacultyDashboard';
import { FacultyNotices } from './FacultyNotices';
import { FacultyStudyMaterials } from './FacultyStudyMaterials';
import { FacultyEvents } from './FacultyEvents';
import { FacultyAcademicResources } from './FacultyAcademicResources';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  BookOpen, 
  Calendar, 
  Award, 
  User, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export type FacultyTabType = 'dashboard' | 'students' | 'notices' | 'materials' | 'events' | 'academic' | 'profile';

interface FacultyPortalProps {
  initialTab?: string;
  onNavigateTab?: (tab: string) => void;
}

const mapSubTabToSection = (tab?: string): FacultyTabType => {
  if (!tab) return 'dashboard';
  const lower = tab.toLowerCase().trim();
  if (lower === 'students' || lower === 'directory') return 'students';
  if (lower === 'notices' || lower === 'announcements' || lower === 'circulars') return 'notices';
  if (lower === 'materials' || lower === 'notes' || lower === 'studymaterials') return 'materials';
  if (lower === 'events' || lower === 'workshops' || lower === 'seminars') return 'events';
  if (lower === 'academic' || lower === 'attendance' || lower === 'marks' || lower === 'assignments') return 'academic';
  if (lower === 'profile') return 'profile';
  if (lower === 'dashboard' || lower === 'overview') return 'dashboard';
  return 'dashboard';
};

export const FacultyPortal: React.FC<FacultyPortalProps> = ({
  initialTab,
  onNavigateTab
}) => {
  const { user, role, isFaculty, isAdmin } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<FacultyTabType>(mapSubTabToSection(initialTab));
  
  // Selected Student for Profile View
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Academic subsection if navigating from sub-item
  const [academicSubSection, setAcademicSubSection] = useState<'attendance' | 'marks' | 'assignments'>('attendance');

  // Key to force refresh if needed
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (initialTab) {
      const mapped = mapSubTabToSection(initialTab);
      setActiveTab(mapped);

      if (initialTab === 'attendance' || initialTab === 'marks' || initialTab === 'assignments') {
        setAcademicSubSection(initialTab);
      }
    }
  }, [initialTab]);

  const handleTabChange = (tabId: string) => {
    const mapped = mapSubTabToSection(tabId);
    setActiveTab(mapped);
    setSelectedStudent(null);
    if (tabId === 'attendance' || tabId === 'marks' || tabId === 'assignments') {
      setAcademicSubSection(tabId);
    }
    if (onNavigateTab) {
      onNavigateTab(tabId);
    }
  };

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Security Gate
  if (!isFaculty && !isAdmin) {
    return (
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-8 border border-slate-200/80 dark:border-navy-800 text-center space-y-4 max-w-xl mx-auto my-12 shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto font-bold">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Faculty Portal Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You are currently viewing CampusOne under the <strong className="text-slate-800 dark:text-white capitalize">{role}</strong> role. The faculty operations suite requires an authorized faculty or institutional administrator account.
        </p>
      </div>
    );
  }

  const NAVIGATION_TABS: { id: FacultyTabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'events', label: 'Events & Workshops', icon: Calendar },
    { id: 'academic', label: 'Academic Resources', icon: Award },
    { id: 'profile', label: 'Faculty Profile', icon: User },
  ];

  return (
    <div key={refreshKey} className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Institutional Faculty Suite
            </span>
            <span className="text-xs text-slate-300 font-medium">Government Polytechnic Ahmedabad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Faculty Teaching &amp; Academic Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome, <strong className="text-white">{user.name}</strong> ({user.designation || 'Lecturer / Faculty'}). Manage department notices, lecture attendance, course materials, and student rosters with direct Supabase connectivity.
          </p>
        </div>

        <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-xs shrink-0 space-y-1">
          <p className="text-slate-400">Department</p>
          <p className="font-bold text-white text-sm truncate max-w-[200px]">{user.department || 'Computer Engineering'}</p>
          <p className="text-brand-cyan text-[11px] font-mono">Role: {role.toUpperCase()}</p>
        </div>
      </div>

      {/* 2. Primary 7-Section Navigation Tabs */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none momentum-scroll">
        {NAVIGATION_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION CONTENT */}

      {/* 1. Dashboard */}
      {activeTab === 'dashboard' && (
        <FacultyDashboard
          user={user}
          onNavigateTab={handleTabChange}
          onRefreshAll={handleRefreshAll}
        />
      )}

      {/* 2. Students */}
      {activeTab === 'students' && (
        <div>
          {selectedStudent ? (
            <StudentProfileView
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            <StudentDirectory
              onSelectStudent={(st) => setSelectedStudent(st)}
              defaultDepartment={user.department || 'All'}
            />
          )}
        </div>
      )}

      {/* 3. Notices */}
      {activeTab === 'notices' && (
        <FacultyNotices
          user={user}
          onRefreshAll={handleRefreshAll}
        />
      )}

      {/* 4. Study Materials */}
      {activeTab === 'materials' && (
        <FacultyStudyMaterials
          user={user}
          onRefreshAll={handleRefreshAll}
        />
      )}

      {/* 5. Events & Workshops */}
      {activeTab === 'events' && (
        <FacultyEvents
          user={user}
        />
      )}

      {/* 6. Academic Resources */}
      {activeTab === 'academic' && (
        <FacultyAcademicResources
          user={user}
          initialSubSection={academicSubSection}
        />
      )}

      {/* 7. My Profile */}
      {activeTab === 'profile' && (
        <FacultyProfilePage />
      )}
    </div>
  );
};
