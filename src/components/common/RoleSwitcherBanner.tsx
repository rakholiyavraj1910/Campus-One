import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Sparkles, Database, ShieldCheck, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getBackendStatus, BackendStatus, subscribeToBackendHealth } from '../../lib/supabaseClient';

export const RoleSwitcherBanner: React.FC = () => {
  const { role, switchRole, user, isAuthenticated, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(getBackendStatus());

  useEffect(() => {
    return subscribeToBackendHealth(setBackendStatus);
  }, []);

  const demoRoles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'student', label: 'Student', desc: 'Aarav Sharma (B.Tech CSE)' },
    { id: 'faculty', label: 'Faculty', desc: 'Dr. Radhika Sen (Assoc. Prof)' },
    { id: 'admin', label: 'Admin', desc: 'Prof. K. Verma (Dean)' },
    { id: 'guest', label: 'Guest', desc: 'Public / Visitor View (Read-Only)' },
  ];

  const isCloudVerified = backendStatus.status === 'connected';

  return (
    <div className="bg-navy-900 border-b border-navy-800 text-xs text-slate-300 py-1.5 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {isCloudVerified ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Supabase Live Cloud [{backendStatus.projectRef}]
            </span>
          ) : backendStatus.status === 'schema_missing' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Supabase Schema Incomplete (Demo Fallback)
            </span>
          ) : backendStatus.status === 'error' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Supabase Connection Error
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 uppercase tracking-wide">
              <Sparkles className="w-3 h-3 mr-1" />
              Interactive Demo Mode
            </span>
          )}

          <span className="hidden sm:inline text-slate-400">
            {isCloudVerified && isAuthenticated
              ? `Authenticated session: ${user.name} (${user.email})`
              : 'Switch roles to test student portal, faculty grading, or administrative controls:'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {(!isCloudVerified || !isAuthenticated) ? (
            demoRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => switchRole(r.id)}
                className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  role === r.id
                    ? 'bg-brand-cyan text-navy-950 font-bold shadow-sm'
                    : 'bg-navy-800/80 hover:bg-navy-700 text-slate-300 hover:text-white'
                }`}
                title={r.desc}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${role === r.id ? 'bg-navy-950' : 'bg-brand-cyan'}`} />
                <span>{r.label}</span>
                {role === r.id && <span className="opacity-75 text-[10px]">({user.name.split(' ')[0]})</span>}
              </button>
            ))
          ) : (
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700 text-[11px] font-semibold">
                Role: <span className="text-brand-cyan uppercase font-bold">{role}</span>
              </span>
              <button
                onClick={logout}
                className="px-2 py-0.5 rounded-full bg-navy-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-navy-700 flex items-center space-x-1 text-[11px] transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <div className="h-4 w-[1px] bg-navy-700 mx-1 hidden sm:block" />

          <div className="hidden md:flex items-center space-x-1 text-[11px] pl-1" title={backendStatus.healthMessage}>
            <Database className="w-3 h-3 text-brand-cyan" />
            <span className={
              isCloudVerified ? 'text-emerald-400 font-semibold' :
              backendStatus.status === 'schema_missing' ? 'text-amber-400 font-semibold' :
              backendStatus.status === 'error' ? 'text-rose-400 font-semibold' :
              'text-slate-400'
            }>
              {isCloudVerified 
                ? `Supabase Live (${backendStatus.latencyMs}ms)` 
                : backendStatus.status === 'schema_missing'
                ? `Supabase [${backendStatus.projectRef}] Missing Tables`
                : 'Demo Local Engine'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
