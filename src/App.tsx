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
import { LoginPage } from './components/auth/LoginPage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AccountPendingApproval } from './components/auth/AccountPendingApproval';

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
import { GraduationCap, Heart, Shield, Sparkles, ExternalLink } from 'lucide-react';

function getPageFromLocation(): { page: string; subTab?: string } {
  if (typeof window === 'undefined') return { page: 'home' };
  const path = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tab = searchParams.get('tab') || undefined;

  if (!path || path === 'login' || path === 'home') return { page: 'home', subTab: tab };
  if (path === 'student') return { page: 'student', subTab: tab || 'profile' };
  if (path === 'faculty-portal' || path === 'faculty') return { page: 'faculty-portal' };
  if (path === 'admin') return { page: 'admin' };
  if (path === 'notices') return { page: 'notices' };
  if (path === 'events') return { page: 'events' };
  if (path === 'campus') return { page: 'campus', subTab: tab || 'departments' };
  if (path === 'about') return { page: 'about' };
  if (path === 'contact') return { page: 'contact' };
  return { page: 'home', subTab: tab };
}

const MainLayout: React.FC = () => {
  const { user, role, isAuthenticated, isPending, loading } = useAuth();
  
  const [currentPage, setCurrentPage] = useState<string>(() => getPageFromLocation().page);
  const [currentSubTab, setCurrentSubTab] = useState<string | undefined>(() => getPageFromLocation().subTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const loc = getPageFromLocation();
      setCurrentPage(loc.page);
      setCurrentSubTab(loc.subTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, subTab?: string, noticeId?: string) => {
    setCurrentPage(page);
    setCurrentSubTab(subTab);

    // Synchronize browser history and URL pathname
    const targetUrl = page === 'home' ? '/' : `/${page}${subTab ? `?tab=${subTab}` : ''}`;
    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({ page, subTab }, '', targetUrl);
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

  // 2. Pending Verification Gate
  if (isPending) {
    return <AccountPendingApproval />;
  }

  // 3. Login-First Security Gate (Redirect unauthenticated visitors to Login)
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          const defaultPage = role === 'admin' ? 'admin' : role === 'faculty' ? 'faculty-portal' : 'home';
          handleNavigate(currentPage !== 'home' ? currentPage : defaultPage, currentSubTab);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      {/* 1. Institutional Session & Verification Status Banner */}
      <RoleSwitcherBanner />

      {/* 2. Sticky SaaS Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 3. Collapsible Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          currentSubTab={currentSubTab}
          onNavigate={handleNavigate}
        />

        {/* 4. Main Page Area (Offset on desktop for fixed sidebar) */}
        <main className="flex-1 lg:pl-72 transition-all duration-300 w-full min-w-0">
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
                  Apex Institute of Technology & Science • NAAC A++ Autonomous College
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
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
                Contact & Helplines
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
