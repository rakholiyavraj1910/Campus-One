import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight,
  Database,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { CampusOneIcon } from './CampusOneLogo';

export const AuthModal: React.FC = () => {
  const { 
    signInWithPassword, 
    signUp, 
    resetPassword, 
    switchRole,
    isLiveMode
  } = useAuth();
  const { isAuthModalOpen, setIsAuthModalOpen, addNotification } = useNotifications();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please provide your institutional email.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Password reset instructions have been sent to your email.');
      } else {
        setError(res.error || 'Failed to send password reset link.');
      }
      return;
    }

    if (!password) {
      setError('Please provide your password.');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please provide your full legal name.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const res = await signInWithPassword(email, password);
      setLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        addNotification(
          'Authentication Successful',
          `Welcome back to CampusOne: ${email}`,
          'academic'
        );
      } else {
        setError(res.error || 'Invalid credentials or user does not exist.');
      }
    } else if (mode === 'register') {
      const res = await signUp(email, password, name, department);
      setLoading(false);
      if (res.success) {
        setIsAuthModalOpen(false);
        addNotification(
          'Account Created',
          `Your CampusOne profile has been created successfully for ${email}.`,
          'academic'
        );
      } else {
        setError(res.error || 'Registration failed. Check password requirements.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CampusOneIcon size={36} withBadge />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">CampusOne Single Sign-On</h3>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                <span className="text-slate-400 font-medium">
                  {isSupabaseConfigured ? 'Supabase Cloud Auth' : 'Demo Mode Active'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Sign In, Register, Forgot */}
        <div className="flex border-b border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'signin'
                ? 'border-b-2 border-brand-cyan text-brand-cyan bg-brand-cyan/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-brand-cyan text-brand-cyan bg-brand-cyan/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Register Student
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'forgot'
                ? 'border-b-2 border-brand-cyan text-brand-cyan bg-brand-cyan/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-modal-dept" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-brand-cyan">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    id="auth-modal-dept"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  >
                    {COLLEGE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-[11px] text-brand-cyan flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Public registrations are provisioned with <strong>Student</strong> privileges. Admin & Faculty accounts require institutional verification.</span>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusone.edu"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-brand-cyan hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In to CampusOne'}
                  {mode === 'register' && 'Create Student Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 text-center text-[11px] text-slate-400">
          Protected by PostgreSQL Row Level Security (RLS) &amp; Institutional RBAC.
        </div>
      </div>
    </div>
  );
};
