import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { BookmarksModal } from './components/common/BookmarksModal';
import { AuthModal } from './components/common/AuthModal';
import { NoticeDetailModal } from './components/notices/NoticeDetailModal';
import { Breadcrumbs } from './components/common/Breadcrumbs';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AccountPendingApproval } from './components/auth/AccountPendingApproval';

// Three Distinct Portal Auth Components & Hub
import { PortalSelectHub } from './components/auth/PortalSelectHub';
import { LoginPage } from './components/auth/LoginPage';
import { StudentAuthPage } from './components/auth/StudentAuthPage';
import { FacultyAuthPage } from './components/auth/FacultyAuthPage';
import { AdminAuthPage } from './components/auth/AdminAuthPage';

import { HomePage } from './components/home/HomePage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyPortal } from './components/faculty/FacultyPortal';
import { CampusHub } from './components/campus/CampusHub';
import { NoticesList } from './components/notices/NoticesList';
import { EventsList } from './components/events/EventsList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';

import { Notice, EventItem } from './types';
import { getNotices, getEvents } from './lib/storageService';
import { GraduationCap } from 'lucide-react';

interface ParsedLocation {
  page: string;
  authMode?: 'signin' | 'register';
  subTab?: string;
}

function getPageFromLocation(): ParsedLocation {
  if (typeof window === 'undefined') return { page: 'portal-select' };
  const raw = window.location.pathname.replace(/^\/+/, '').toLowerCase();
  const segments = raw.split('/');
  const first = segments[0] || '';
  const second = segments[1] || '';
  const searchParams = new URLSearchParams(window.location.search);
  const tab = searchParams.get('tab') || undefined;
  const mode = (searchParams.get('mode') as 'signin' | 'register') || undefined;

  // 1. Dedicated Portal Authentication URLs
  if (first === 'student' && (second === 'login' || second === 'register')) {
    return { 
      page: 'student-auth', 
      authMode: second === 'register' ? 'register' : (mode || 'signin'), 
      subTab: tab 
    };
  }
  if (first === 'faculty' && (second === 'login' || second === 'register')) {
    return { 
      page: 'faculty-auth', 
      authMode: second === 'register' ? 'register' : (mode || 'signin'), 
      subTab: tab 
    };
  }
  if (first === 'admin' && (second === 'login' || second === 'signin')) {
    return { 
      page: 'admin-auth', 
      authMode: 'signin', 
      subTab: tab 
    };
  }

  // Dual-portal unified login page (/login or /login?portal=faculty)
  if (first === 'login') {
    const portalParam = searchParams.get('portal');
    return { 
      page: 'login', 
      authMode: mode || 'signin', 
      subTab: portalParam === 'faculty' ? 'faculty' : 'student' 
    };
  }

  // 2. Hub / Root / Public routes
  if (!first || first === 'portal-select' || first === 'portals') {
    return { page: 'portal-select', subTab: tab };
  }
  if (first === 'home') return { page: 'home', subTab: tab };
  if (first === 'student') return { page: 'student', subTab: tab || 'profile' };
  if (first === 'faculty-portal' || first === 'faculty') return { page: 'faculty-portal', subTab: tab };
  if (first === 'admin') return { page: 'admin', subTab: tab };
  if (first === 'notices') return { page: 'notices', subTab: tab };
  if (first === 'events') return { page: 'events', subTab: tab };
  if (first === 'campus') return { page: 'campus', subTab: tab || 'departments' };
  if (first === 'about') return { page: 'about', subTab: tab };
  if (first === 'contact') return { page: 'contact', subTab: tab };

  return { page: 'portal-select', subTab: tab };
}

const MainLayout: React.FC = () => {
  const { user, role, isAuthenticated, isPending, loading } = useAuth();
  
  const initialLoc = getPageFromLocation();
  const [currentPage, setCurrentPage] = useState<string>(initialLoc.page);
  const [currentSubTab, setCurrentSubTab] = useState<string | undefined>(initialLoc.subTab);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(initialLoc.authMode || 'signin');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campusone_sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        localStorage.setItem('campusone_sidebar_open', String(next));
      }
      return next;
    });
  };

  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Notice | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const loadData = async () => {
    const n = await getNotices();
    const e = await getEvents();
    setNotices(n);
    setEvents(e);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Synchronize location when authenticated user visits portal-select or auth pages
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (
        currentPage === 'portal-select' || 
        currentPage === 'login' ||
        currentPage === 'student-auth' || 
        currentPage === 'faculty-auth' || 
        currentPage === 'admin-auth'
      ) {
        const defaultPage = role === 'admin' ? 'admin' : role === 'faculty' ? 'faculty-portal' : 'student';
        handleNavigate(defaultPage);
      }
    }
  }, [isAuthenticated, loading, currentPage, role]);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const loc = getPageFromLocation();
      setCurrentPage(loc.page);
      setCurrentSubTab(loc.subTab);
      if (loc.authMode) setAuthMode(loc.authMode);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (
    page: string, 
    subTab?: string, 
    noticeId?: string, 
    mode?: 'signin' | 'register'
  ) => {
    setCurrentPage(page);
    setCurrentSubTab(subTab);
    if (mode) setAuthMode(mode);

    // Compute browser target URL
    let targetUrl = '/';
    if (page === 'portal-select') {
      targetUrl = '/';
    } else if (page === 'student-auth') {
      targetUrl = (mode || authMode) === 'register' ? '/student/login?mode=register' : '/student/login';
    } else if (page === 'faculty-auth') {
      targetUrl = (mode || authMode) === 'register' ? '/faculty/login?mode=register' : '/faculty/login';
    } else if (page === 'admin-auth') {
      targetUrl = '/admin/login';
    } else if (page === 'home') {
      targetUrl = '/home';
    } else {
      targetUrl = `/${page}${subTab ? `?tab=${subTab}` : ''}`;
    }

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({ page, subTab, mode }, '', targetUrl);
    }

    // If specific notice target
    if (noticeId) {
      const match = notices.find(n => n.id === noticeId);
      if (match) setSelectedNoticeModal(match);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Session Restoration Loading Gate
  if (loading) {
    return <LoadingScreen message="Restoring verified institutional session..." />;
  }

  // 2. Pending Verification Gate (Faculty or Student undergoing admin approval)
  if (isPending) {
    return <AccountPendingApproval />;
  }

  // 3. Unauthenticated / Logged-Out Routing Gate
  if (!isAuthenticated) {
    // Unified Dual-Portal Login (/login)
    if (currentPage === 'login') {
      return (
        <LoginPage
          initialPortal={currentSubTab === 'faculty' ? 'faculty' : 'student'}
          initialMode={authMode}
          onLoginSuccess={() => {
            const defaultPage = role === 'admin' ? 'admin' : role === 'faculty' ? 'faculty-portal' : 'student';
            handleNavigate(defaultPage);
          }}
          onSwitchToAdmin={() => handleNavigate('admin-auth')}
        />
      );
    }

    // Dedicated Student Auth
    if (currentPage === 'student-auth' || currentPage === 'student') {
      return (
        <StudentAuthPage
          initialMode={authMode}
          onLoginSuccess={() => handleNavigate('student')}
          onNavigateHub={() => handleNavigate('portal-select')}
          onSwitchPortal={(p) => handleNavigate(p === 'faculty' ? 'faculty-auth' : 'admin-auth')}
        />
      );
    }

    // Dedicated Faculty Auth
    if (currentPage === 'faculty-auth' || currentPage === 'faculty-portal' || currentPage === 'faculty') {
      return (
        <FacultyAuthPage
          initialMode={authMode}
          onLoginSuccess={() => handleNavigate('faculty-portal')}
          onNavigateHub={() => handleNavigate('portal-select')}
          onSwitchPortal={(p) => handleNavigate(p === 'student' ? 'student-auth' : 'admin-auth')}
        />
      );
    }

    // Dedicated Admin Auth
    if (currentPage === 'admin-auth' || currentPage === 'admin') {
      return (
        <AdminAuthPage
          onLoginSuccess={() => handleNavigate('admin')}
          onNavigateHub={() => handleNavigate('portal-select')}
          onSwitchPortal={(p) => handleNavigate(p === 'student' ? 'student-auth' : 'faculty-auth')}
        />
      );
    }

    // Public Open Resources (Allow prospective students & visitors to inspect notices, calendar, etc.)
    const isPublicResource = ['notices', 'events', 'campus', 'about', 'contact', 'home'].includes(currentPage);
    if (!isPublicResource) {
      return (
        <PortalSelectHub
          onSelectPortal={(portal, mode) => {
            const pageMap: Record<string, string> = {
              student: 'student-auth',
              faculty: 'faculty-auth',
              admin: 'admin-auth'
            };
            handleNavigate(pageMap[portal] || 'portal-select', undefined, undefined, mode);
          }}
          onNavigatePublic={(p, sub) => handleNavigate(p, sub)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      {/* 1. Institutional Session & Verification Status Banner */}
      <RoleSwitcherBanner />

      {/* 2. Sticky SaaS Navbar */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      <div className={`flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-300 ${isSidebarOpen ? 'lg:gap-6' : 'gap-0'}`}>
        {/* 3. Collapsible Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          currentSubTab={currentSubTab}
          onNavigate={handleNavigate}
        />

        {/* 4. Main Page Area (Reclaims full 100% width when sidebar is collapsed; zero overlap) */}
        <main className="flex-1 min-w-0 transition-all duration-300 w-full">
          <Breadcrumbs
            currentPage={currentPage}
            currentSubTab={currentSubTab}
            onNavigate={handleNavigate}
          />

          {currentPage === 'home' && (
            <HomePage
              notices={notices}
              events={events}
              onNavigate={handleNavigate}
              onOpenNotice={(n) => setSelectedNoticeModal(n)}
              onRefreshEvents={loadData}
            />
          )}

          {currentPage === 'about' && (
            <AboutPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'contact' && (
            <ContactPage />
          )}

          {currentPage === 'faculty-portal' && (
            <FacultyPortal />
          )}

          {currentPage === 'student' && (
            <StudentDashboard
              currentSubTab={currentSubTab || 'profile'}
              onNavigateSubTab={(sub) => setCurrentSubTab(sub)}
            />
          )}

          {currentPage === 'campus' && (
            <CampusHub
              currentSubTab={currentSubTab || 'departments'}
              onNavigateSubTab={(sub) => setCurrentSubTab(sub)}
            />
          )}

          {currentPage === 'notices' && (
            <NoticesList
              notices={notices}
              onOpenNotice={(n) => setSelectedNoticeModal(n)}
            />
          )}

          {currentPage === 'events' && (
            <EventsList
              events={events}
              onRefreshEvents={loadData}
            />
          )}

          {currentPage === 'admin' && (
            <AdminDashboard
              notices={notices}
              events={events}
              onRefreshNotices={loadData}
              onRefreshEvents={loadData}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

      {/* 5. Production-Ready Footer */}
      <footer className="mt-auto bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 py-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-navy-900 dark:bg-brand-cyan flex items-center justify-center text-white dark:text-navy-950 font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-navy-900 dark:text-white">
                  CampusOne Digital Portal
                </p>
                <p className="text-[11px] text-slate-400">
                  Apex Institute of Technology &amp; Science • NAAC A++ Autonomous College
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button onClick={() => handleNavigate('portal-select')} className="hover:text-brand-cyan transition-colors font-medium">
                Portal Selection
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('about')} className="hover:text-brand-cyan transition-colors">
                About CampusOne
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('campus', 'departments')} className="hover:text-brand-cyan transition-colors">
                Departments
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('campus', 'facilities')} className="hover:text-brand-cyan transition-colors">
                Facilities
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('contact')} className="hover:text-brand-cyan transition-colors">
                Contact &amp; Helplines
              </button>
              {role === 'admin' && (
                <>
                  <span>•</span>
                  <button onClick={() => handleNavigate('admin')} className="hover:text-brand-cyan transition-colors font-semibold text-amber-500">
                    Staff Admin
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center md:text-right">
              &copy; {new Date().getFullYear()} CampusOne. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal onNavigate={handleNavigate} />
      <NotificationDrawer onNavigate={handleNavigate} />
      <BookmarksModal onNavigate={handleNavigate} />
      <AuthModal />
      <NoticeDetailModal
        notice={selectedNoticeModal}
        onClose={() => setSelectedNoticeModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
