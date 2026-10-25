import React from 'react';
import { ShieldAlert, LogIn, Sparkles, Home, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface AdminAccessDeniedProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ onNavigate }) => {
  const { role, isLiveMode, switchRole } = useAuth();
  const { setIsAuthModalOpen } = useNotifications();

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-8 sm:p-10 border border-amber-200/80 dark:border-amber-900/40 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 tracking-wider">
            <Lock className="w-3.5 h-3.5 mr-1" />
            Restricted Institutional Area
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            Administrative Access Required
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            You are currently browsing as <strong className="uppercase text-slate-700 dark:text-slate-200">{role}</strong>. 
            The Admin Control Center is strictly restricted to authorized institutional administrators.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 text-left space-y-2">
          <p className="font-bold text-slate-800 dark:text-white">Security Policy Enforcements:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
            <li>Guest &amp; Student accounts cannot view internal administrative analytics.</li>
            <li>Creating, editing, or deleting notices, events, faculty records, and materials is blocked.</li>
            <li>All administrative operations require verified credentials validated via Row Level Security (RLS).</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as Administrator</span>
          </button>

          {!isLiveMode && (
            <button
              onClick={() => switchRole('admin')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-navy-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <span>Simulate Admin Persona (Dean)</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Campus Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
