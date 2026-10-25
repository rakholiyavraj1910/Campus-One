import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentSubTab, setCurrentSubTab] = useState<string | undefined>(undefined);
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

  const handleNavigate = (page: string, subTab?: string, noticeId?: string) => {
    setCurrentPage(page);
    setCurrentSubTab(subTab);

    // If specific notice target
    if (noticeId) {
      const match = notices.find(n => n.id === noticeId);
      if (match) setSelectedNoticeModal(match);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      {/* 1. Quick Testing Role Switcher Banner */}
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
              <span>•</span>
              <button onClick={() => handleNavigate('admin')} className="hover:text-brand-cyan transition-colors font-semibold text-amber-500">
                Staff Admin
              </button>
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
