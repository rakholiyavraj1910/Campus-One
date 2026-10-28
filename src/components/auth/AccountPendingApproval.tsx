import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, Clock, Mail, Building2, User, RefreshCw } from 'lucide-react';
import { CampusOneLogo } from '../common/CampusOneLogo';

export const AccountPendingApproval: React.FC = () => {
  const { user, signOut, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const isFacultyReq = user.adminLevel === 'pending_faculty' || user.designation;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative z-10">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <CampusOneLogo variant="full" size="sm" withBadge theme="dark" />
        </div>

        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isFacultyReq ? 'Faculty Access Request Pending' : 'Institutional Account Verification Pending'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFacultyReq
              ? 'Your faculty credentials have been authenticated. An authorized administrator must approve your departmental access before course rosters and grading tools become accessible.'
              : 'Your CampusOne identity has been authenticated, but your academic department has not yet assigned a verified role or division to your profile.'}
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-slate-400">
            <Mail className="w-4 h-4 text-brand-cyan shrink-0" />
            <span>Email: <strong className="text-white">{user.email}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <User className="w-4 h-4 text-brand-cyan shrink-0" />
            <span>Name: <strong className="text-white">{user.name}</strong></span>
          </div>
          {user.department && (
            <div className="flex items-center space-x-2 text-slate-400">
              <Building2 className="w-4 h-4 text-brand-cyan shrink-0" />
              <span>Department: <strong className="text-white">{user.department}</strong></span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Status: <span className="text-amber-400 font-bold uppercase">Pending Admin Approval</span></span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-slate-800/60 text-slate-300 text-[11px] leading-relaxed border border-slate-700/50">
          {isFacultyReq
            ? 'Departmental administrators review faculty credentials in the Admin Control Center. Once approved, your role will be upgraded to Faculty.'
            : 'Please contact your Department Administrator or Dean\'s Office to confirm your enrollment roll number and activate your student portal.'}
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Database...' : 'Check Approval Status'}</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
