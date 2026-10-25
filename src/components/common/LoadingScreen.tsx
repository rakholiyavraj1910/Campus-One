import React from 'react';
import { GraduationCap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Restoring secure institutional session...' 
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-sm">
        {/* Animated Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-brand-cyan/25 animate-pulse">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div className="absolute -inset-1.5 rounded-2xl border border-brand-cyan/40 animate-ping opacity-30 pointer-events-none" />
        </div>

        {/* Brand Text */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Campus<span className="text-brand-cyan">One</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Apex Institute of Technology &amp; Science
          </p>
        </div>

        {/* Spinner & Message */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs shadow-inner">
          <div className="w-3.5 h-3.5 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};