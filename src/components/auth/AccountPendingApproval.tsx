import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, Clock, Mail, Building2, User } from 'lucide-react';

export const AccountPendingApproval: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative z-10">
        
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Institutional Account Verification Pending
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your CampusOne identity has been authenticated, but your academic department has not yet assigned a verified role or division to your profile.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-slate-400">
            <Mail className="w-4 h-4 text-brand-cyan" />
            <span>Email: <strong className="text-white">{user.email}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <User className="w-4 h-4 text-brand-cyan" />
            <span>Name: <strong className="text-white">{user.name}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Status: <span className="text-amber-400 font-bold uppercase">Pending Verification</span></span>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-slate-800/60 text-slate-300 text-[11px] leading-relaxed border border-slate-700/50">
          Please contact your Department Administrator or Dean&apos;s Office to confirm your enrollment roll number and activate your student/faculty portal.
        </div>

        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Institutional Portal</span>
        </button>
      </div>
    </div>
  );
};