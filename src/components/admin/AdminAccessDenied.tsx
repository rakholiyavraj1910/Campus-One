import React from 'react';
import { ShieldAlert, LogIn, ArrowLeft, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminAccessDeniedProps {
  onNavigateLogin: () => void;
  onNavigatePortal: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  onNavigateLogin,
  onNavigatePortal
}) => {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0c1220] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-scale-up">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Lock className="w-3 h-3 mr-1" />
            <span>Restricted Governance Area</span>
          </span>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Administrative Clearance Required
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            The CampusOne Admin Control Center is strictly restricted to institutional administrators. You are currently authenticated as:
          </p>
        </div>

        {/* Current Account Details */}
        <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 text-left text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Account Name</span>
            <span className="text-white font-bold">{user?.name || 'Verified User'}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400 font-medium font-sans text-xs">Email Address</span>
            <span className="text-teal-400">{user?.email || 'user@campusone.edu'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Assigned Role</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300">
              {role || 'student'}
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          If you are an institutional administrator, please sign in with your administrator email and credentials. To continue using the standard university portal, return below.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onNavigateLogin}
            className="w-full px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Administrator Account</span>
          </button>

          <button
            onClick={onNavigatePortal}
            className="w-full px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
