import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminSectionId } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { PlatformAnalytics } from './PlatformAnalytics';
import { ManageUsers } from './ManageUsers';
import { ManageStudents } from './ManageStudents';
import { ManageFaculty } from './ManageFaculty';
import { ManageRolesAndPermissions } from './ManageRolesAndPermissions';
import { ManageFacultyRequests } from './ManageFacultyRequests';
import { ManageDepartments } from './ManageDepartments';
import { ManageNoticesAndEvents } from './ManageNoticesAndEvents';
import { ManageAcademicRecords } from './ManageAcademicRecords';
import { AuditLogsViewer } from './AuditLogsViewer';
import { SystemSettings } from './SystemSettings';
import { AdminProfilePage } from '../profile/AdminProfilePage';
import { useAuth } from '../../context/AuthContext';
import { Notice, EventItem } from '../../types';
import { 
  getNotices, 
  getEvents, 
  getPendingFacultyRequests 
} from '../../lib/storageService';
import { getBackendStatus, subscribeToBackendHealth, BackendStatus } from '../../lib/supabaseClient';

interface AdminLayoutProps {
  initialSection?: string;
  onNavigateSection?: (section: string) => void;
  onSignOut: () => void;
  onNavigatePublic?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialSection = 'overview',
  onNavigateSection,
  onSignOut,
  onNavigatePublic
}) => {
  const { user } = useAuth();
  
  // Resolve valid section ID with fallback to 'overview'
  const resolveSection = (sec?: string): AdminSectionId => {
    if (!sec) return 'overview';
    const valid: AdminSectionId[] = [
      'overview', 'users', 'students', 'faculty', 'roles', 
      'approvals', 'departments', 'notices-events', 'academic', 'audit', 'settings', 'profile'
    ];
    if (sec === 'notices' || sec === 'events') return 'notices-events';
    if (sec === 'faculty-requests') return 'approvals';
    if (sec === 'system' || sec === 'database') return 'settings';
    if (sec === 'profile' || sec === 'my-profile' || sec === 'identity' || sec === 'account') return 'profile';
    if (sec === 'users' || sec === 'user-management' || sec === 'user-roles' || sec === 'manage-users') return 'users';
    if (sec === 'roles' || sec === 'role-management' || sec === 'permissions') return 'roles';
    return valid.includes(sec as AdminSectionId) ? (sec as AdminSectionId) : 'overview';
  };

  const [currentSection, setCurrentSection] = useState<AdminSectionId>(resolveSection(initialSection));
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());
  
  // Real data for notices, events, and pending requests counts
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Sync if initialSection changes from outside
  useEffect(() => {
    if (initialSection) {
      setCurrentSection(resolveSection(initialSection));
    }
  }, [initialSection]);

  // Subscribe to backend status
  useEffect(() => {
    return subscribeToBackendHealth(setBackendStatus);
  }, []);

  const loadData = async () => {
    try {
      const [n, e, pending] = await Promise.all([
        getNotices().catch(() => []),
        getEvents().catch(() => []),
        getPendingFacultyRequests().catch(() => [])
      ]);
      setNotices(n);
      setEvents(e);
      setPendingCount(pending.length);
    } catch {
      // Ignore background errors
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSection]);

  const handleSelectSection = (sec: AdminSectionId) => {
    setCurrentSection(sec);
    if (onNavigateSection) {
      onNavigateSection(sec);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-teal-500/30 selection:text-teal-300">
      {/* 1. Standalone Admin Sidebar */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        adminUser={user}
        pendingRequestsCount={pendingCount}
        backendStatus={backendStatus}
        onSignOut={onSignOut}
        onNavigatePublic={onNavigatePublic}
      />

      {/* 2. Main Admin Work Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Admin Header Bar */}
        <AdminHeader
          currentSection={currentSection}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          adminUser={user}
          backendStatus={backendStatus}
          onRefreshAll={loadData}
          onSignOut={onSignOut}
          onSelectSection={handleSelectSection}
          onNavigatePublic={onNavigatePublic}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentSection === 'overview' && (
            <PlatformAnalytics
              onNavigateTab={(tab) => handleSelectSection(resolveSection(tab))}
              onRefreshAll={loadData}
            />
          )}

          {currentSection === 'users' && (
            <ManageUsers
              onNavigateTab={(tab) => handleSelectSection(resolveSection(tab))}
            />
          )}

          {currentSection === 'students' && (
            <ManageStudents />
          )}

          {currentSection === 'faculty' && (
            <ManageFaculty />
          )}

          {currentSection === 'roles' && (
            <ManageRolesAndPermissions
              onNavigateTab={(tab) => handleSelectSection(resolveSection(tab))}
            />
          )}

          {currentSection === 'approvals' && (
            <ManageFacultyRequests />
          )}

          {currentSection === 'departments' && (
            <ManageDepartments
              onFilterStudents={() => handleSelectSection('students')}
              onFilterFaculty={() => handleSelectSection('faculty')}
              onFilterNotices={() => handleSelectSection('notices-events')}
            />
          )}

          {currentSection === 'notices-events' && (
            <ManageNoticesAndEvents
              notices={notices}
              events={events}
              onRefreshNotices={loadData}
              onRefreshEvents={loadData}
            />
          )}

          {currentSection === 'academic' && (
            <ManageAcademicRecords />
          )}

          {currentSection === 'audit' && (
            <AuditLogsViewer />
          )}

          {currentSection === 'settings' && (
            <SystemSettings />
          )}

          {currentSection === 'profile' && (
            <AdminProfilePage onNavigateSection={handleSelectSection} />
          )}
        </main>
      </div>
    </div>
  );
};
