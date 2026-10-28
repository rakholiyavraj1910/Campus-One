import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminProfilePage } from './AdminProfilePage';
import { FacultyProfilePage } from './FacultyProfilePage';
import { ProfileCard } from '../student/ProfileCard';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RoleAdaptiveProfileProps {
  onNavigateSection?: (sectionId: any) => void;
}

/**
 * RoleAdaptiveProfile dynamically inspects the authenticated user's verified database role
 * and routes to the dedicated role profile:
 * - 'admin'   -> Dedicated AdminProfilePage (clearance, security credentials, zero student fields)
 * - 'faculty' -> Dedicated FacultyProfilePage (academic designation, cabin, consultation hours)
 * - 'student' -> Dedicated ProfileCard (authentic semester, roll number, PRN, student credentials)
 *
 * This completely prevents role pollution where admin accounts might accidentally see student fields.
 */
export const RoleAdaptiveProfile: React.FC<RoleAdaptiveProfileProps> = ({ onNavigateSection }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Loading verified account profile...</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Retrieving institutional clearance & credentials</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm max-w-lg mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Please log in to your institutional account to view your verified identity credentials.
        </p>
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminProfilePage onNavigateSection={onNavigateSection} />;
  }

  if (role === 'faculty') {
    return <FacultyProfilePage onNavigateSection={onNavigateSection} />;
  }

  return <ProfileCard />;
};
