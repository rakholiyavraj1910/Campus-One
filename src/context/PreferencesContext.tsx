import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  UserPreferences, 
  AccentColor, 
  InterfaceDensity, 
  ThemeMode, 
  DashboardWidgetConfig 
} from '../types';

const STORAGE_KEY = 'campusone_user_preferences_v1';

export const ACCENT_PALETTE: {
  id: AccentColor;
  label: string;
  hex: string;
  description: string;
}[] = [
  { id: 'turquoise', label: 'Turquoise Cyan', hex: '#00ADB5', description: 'Original CampusOne iconic cyan' },
  { id: 'ocean', label: 'Collegiate Ocean', hex: '#2563EB', description: 'Deep university blue' },
  { id: 'emerald', label: 'Academic Emerald', hex: '#059669', description: 'Vibrant campus green' },
  { id: 'violet', label: 'Royal Academic', hex: '#7C3AED', description: 'Distinguished collegiate purple' },
  { id: 'amber', label: 'Institutional Gold', hex: '#D97706', description: 'Warm amber gold' },
];

const DEFAULT_STUDENT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'academicOverview', label: 'Academic Identity & Roster', description: 'Roll number, PRN, semester, division, and assigned faculty mentor', visible: true, order: 0 },
  { id: 'timetableToday', label: 'Daily Class Schedule', description: 'Classroom lectures and laboratory batches scheduled for today', visible: true, order: 1 },
  { id: 'attendanceOverview', label: 'Attendance Telemetry', description: 'Subject-wise lecture attendance adherence percentage and threshold alerts', visible: true, order: 2 },
  { id: 'noticesFeed', label: 'Official Circulars & Notices', description: 'Latest academic circulars and GTU exam notices', visible: true, order: 3 },
  { id: 'studyMaterials', label: 'Course Notes & Syllabus', description: 'Downloadable syllabus, lecture notes, and lab manuals', visible: true, order: 4 },
  { id: 'campusEvents', label: 'Campus Events & Workshops', description: 'Technical symposia, sports festivals, and guest lectures', visible: true, order: 5 },
];

const DEFAULT_FACULTY_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'facultyOverview', label: 'Teaching Workload & Department', description: 'Classes assigned, students advised, and consultation hours', visible: true, order: 0 },
  { id: 'teachingSchedule', label: 'Daily Teaching Timetable', description: 'Classroom teaching slots and practical lab sessions', visible: true, order: 1 },
  { id: 'studentDirectory', label: 'Student Directory Lookup', description: 'Search enrolled students across departments and semesters', visible: true, order: 2 },
  { id: 'publishedNotices', label: 'Published Circulars', description: 'Official departmental announcements published to students', visible: true, order: 3 },
  { id: 'studyMaterials', label: 'Course Materials Archive', description: 'Uploaded lecture notes, question banks, and lab exercises', visible: true, order: 4 },
];

const DEFAULT_ADMIN_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'platformAnalytics', label: 'Institutional Telemetry', description: 'Total student, faculty, and administrative account counts', visible: true, order: 0 },
  { id: 'facultyApprovals', label: 'Faculty Verification Claims', description: 'Pending applications requiring institutional credentials verification', visible: true, order: 1 },
  { id: 'auditLogs', label: 'Security & RLS Audit Logs', description: 'Real-time database authorization logs and role changes', visible: true, order: 2 },
  { id: 'userManagement', label: 'User Directory Shortcuts', description: 'Manage accounts, promote/demote roles, and review rosters', visible: true, order: 3 },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'system',
  accentColor: 'turquoise',
  density: 'comfortable',
  reducedMotion: false,
  studentWidgets: DEFAULT_STUDENT_WIDGETS,
  facultyWidgets: DEFAULT_FACULTY_WIDGETS,
  adminWidgets: DEFAULT_ADMIN_WIDGETS,
  notifications: {
    academicAlerts: true,
    noticeUpdates: true,
    eventReminders: true,
    adminAnnouncements: true,
  },
};

interface PreferencesContextType {
  preferences: UserPreferences;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setDensity: (density: InterfaceDensity) => void;
  setReducedMotion: (reduced: boolean) => void;
  toggleWidget: (role: 'student' | 'faculty' | 'admin', widgetId: string) => void;
  reorderWidgets: (role: 'student' | 'faculty' | 'admin', fromIndex: number, toIndex: number) => void;
  resetWidgets: (role: 'student' | 'faculty' | 'admin') => void;
  updateNotificationPref: (key: keyof UserPreferences['notifications'], value: boolean) => void;
  resetAllPreferences: () => void;
  isWidgetVisible: (role: 'student' | 'faculty' | 'admin', widgetId: string) => boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          studentWidgets: parsed.studentWidgets || DEFAULT_STUDENT_WIDGETS,
          facultyWidgets: parsed.facultyWidgets || DEFAULT_FACULTY_WIDGETS,
          adminWidgets: parsed.adminWidgets || DEFAULT_ADMIN_WIDGETS,
          notifications: {
            ...DEFAULT_PREFERENCES.notifications,
            ...(parsed.notifications || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to parse campusone_user_preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to OS system color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    try {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } catch {
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);

  const resolvedTheme: 'light' | 'dark' = 
    preferences.themeMode === 'system'
      ? (systemIsDark ? 'dark' : 'light')
      : preferences.themeMode;

  // Apply attributes to documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Dark class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Data attributes for CSS variables and density
    root.setAttribute('data-accent', preferences.accentColor);
    root.setAttribute('data-density', preferences.density);
    root.setAttribute('data-motion', preferences.reducedMotion ? 'reduced' : 'normal');

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      // Backwards compatibility with campusone_theme
      localStorage.setItem('campusone_theme', resolvedTheme);
    } catch {
      // ignore storage quota issues
    }
  }, [preferences, resolvedTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setPreferences(prev => ({ ...prev, themeMode: mode }));
  };

  const setAccentColor = (color: AccentColor) => {
    setPreferences(prev => ({ ...prev, accentColor: color }));
  };

  const setDensity = (density: InterfaceDensity) => {
    setPreferences(prev => ({ ...prev, density }));
  };

  const setReducedMotion = (reduced: boolean) => {
    setPreferences(prev => ({ ...prev, reducedMotion: reduced }));
  };

  const toggleWidget = (role: 'student' | 'faculty' | 'admin', widgetId: string) => {
    setPreferences(prev => {
      const key = role === 'student' ? 'studentWidgets' : role === 'faculty' ? 'facultyWidgets' : 'adminWidgets';
      const updated = prev[key].map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w);
      return { ...prev, [key]: updated };
    });
  };

  const reorderWidgets = (role: 'student' | 'faculty' | 'admin', fromIndex: number, toIndex: number) => {
    setPreferences(prev => {
      const key = role === 'student' ? 'studentWidgets' : role === 'faculty' ? 'facultyWidgets' : 'adminWidgets';
      const list = [...prev[key]];
      if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
        return prev;
      }
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      const reindexed = list.map((w, idx) => ({ ...w, order: idx }));
      return { ...prev, [key]: reindexed };
    });
  };

  const resetWidgets = (role: 'student' | 'faculty' | 'admin') => {
    setPreferences(prev => {
      if (role === 'student') return { ...prev, studentWidgets: DEFAULT_STUDENT_WIDGETS };
      if (role === 'faculty') return { ...prev, facultyWidgets: DEFAULT_FACULTY_WIDGETS };
      return { ...prev, adminWidgets: DEFAULT_ADMIN_WIDGETS };
    });
  };

  const updateNotificationPref = (key: keyof UserPreferences['notifications'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const resetAllPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const isWidgetVisible = (role: 'student' | 'faculty' | 'admin', widgetId: string): boolean => {
    const key = role === 'student' ? 'studentWidgets' : role === 'faculty' ? 'facultyWidgets' : 'adminWidgets';
    const widget = preferences[key].find(w => w.id === widgetId);
    return widget ? widget.visible : true;
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        resolvedTheme,
        setThemeMode,
        setAccentColor,
        setDensity,
        setReducedMotion,
        toggleWidget,
        reorderWidgets,
        resetWidgets,
        updateNotificationPref,
        resetAllPreferences,
        isWidgetVisible,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
