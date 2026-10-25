import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_DEPARTMENTS } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { parseAuthUrlState, cleanAuthUrlParams, processAuthRedirectCode } from '../../lib/authRedirect';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  Building2,
  ChevronLeft,
  BookOpen,
  Hash
} from 'lucide-react';

interface StudentAuthPageProps {
  initialMode?: 'signin' | 'register';
  onLoginSuccess?: () => void;
  onNavigateHub?: () => void;
  onSwitchPortal?: (portal: 'faculty' | 'admin') => void;
}

export const StudentAuthPage: React.FC<StudentAuthPageProps> = ({
  initialMode = 'signin',
  onLoginSuccess = () => {},
  onNavigateHub = () => {},
  onSwitchPortal = () => {}
}) => {
  const { signInWithPassword, signUp, resetPassword, authError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);
  const [rollNumber, setRollNumber] = useState('');
  const [prn, setPrn] = useState('');
  const [division, setDivision] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inspect incoming URL parameters for email confirmation tokens, PKCE codes, or errors
  useEffect(() => {
    const handleUrlState = async () => {
      const authState = parseAuthUrlState();

      if (authState.error) {
        setFormError(
          authState.errorDescription || 
          'Email verification link is invalid or has expired. Please sign in or request a new verification link.'
        );
        cleanAuthUrlParams();
        return;
      }

      if (authState.code && isSupabaseConfigured && supabase) {
        setIsSubmitting(true);
        const res = await processAuthRedirectCode(supabase);
        setIsSubmitting(false);
        if (res.success) {
          setSuccessMessage('Email verified successfully! Loading your student portal...');
          setTimeout(() => {
            onLoginSuccess();
          }, 800);
        } else if (res.error) {
          setFormError(res.error);
        }
        return;
      }

      if (authState.isConfirmed) {
        setMode('signin');
        setSuccessMessage('Email confirmed successfully! Your student account is now verified. Please sign in below.');
        cleanAuthUrlParams();
      }
    };

    handleUrlState();
  }, [onLoginSuccess]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both student email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setFormError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your full student name.');
      return;
    }
    if (!department || !COLLEGE_DEPARTMENTS.includes(department as any)) {
      setFormError('Please select a valid college department.');
      return;
    }
    if (!email.trim() || !password) {
      setFormError('Please enter a valid email and secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(
      email.trim(), 
      password, 
      name.trim(), 
      department,
      {
        rollNumber: rollNumber.trim() || '21CS' + Math.floor(100 + Math.random() * 900),
        prn: prn.trim() || '2025' + Date.now().toString().slice(-8),
        division
      }
    );
    setIsSubmitting(false);

    if (result.success) {
      if (result.needsEmailConfirmation) {
        setSuccessMessage(`Registration successful! A verification link has been sent to ${email.trim()}. Please tap "Confirm email address" in your email to activate your account.`);
        setMode('signin');
      } else {
        setSuccessMessage('Student registration successful! Your verified student profile has been provisioned.');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } else {
      setFormError(result.error || 'Student registration failed. Please try a different email address.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your registered student email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Password recovery instructions sent to your email.');
    } else {
      setFormError(result.error || 'Unable to send reset instructions.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200 dark:from-navy-950 dark:via-navy-900 dark:to-[#0a1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onNavigateHub}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Campus Portals</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-brand-cyan flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-navy-900 dark:text-white">
            Student<span className="text-brand-cyan">One</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onSwitchPortal('faculty')}
            className="hidden sm:inline-flex text-slate-500 hover:text-emerald-500 transition-colors"
          >
            Faculty Suite &rarr;
          </button>
          <button
            onClick={() => onSwitchPortal('admin')}
            className="hidden sm:inline-flex text-slate-500 hover:text-amber-500 transition-colors"
          >
            Admin Center &rarr;
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-navy-700/80 shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 dark:bg-brand-cyan/20 text-cyan-600 dark:text-brand-cyan border border-cyan-500/30 flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-brand-cyan border border-cyan-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Student Academic Portal</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white">
              {mode === 'signin' && 'Sign in to Student Portal'}
              {mode === 'register' && 'New Student Registration'}
              {mode === 'forgot' && 'Reset Student Password'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' && 'Access your attendance, internal marks, timetable & study notes.'}
              {mode === 'register' && 'Create your verified student profile. Role is locked to Student.'}
              {mode === 'forgot' && 'Enter your registered college email to receive a password reset link.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-navy-950 rounded-xl mb-6 text-xs font-bold border border-slate-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => { setMode('signin'); setFormError(null); setSuccessMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Student Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setFormError(null); setSuccessMessage(null); }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Student Registration
              </button>
            </div>
          )}

          {/* Status Banners */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campusone.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setFormError(null); setSuccessMessage(null); }}
                    className="text-[11px] text-brand-cyan hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-brand-cyan dark:hover:bg-cyan-400 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating Student...</span>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Enforced Role Banner */}
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-[11px] text-cyan-800 dark:text-cyan-200 flex items-center justify-between">
                <span className="font-semibold">Assigned Account Role:</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-600 text-white font-bold uppercase text-[10px]">
                  Enrolled Student
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@college.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password (min 6)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="student-reg-dept" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department <span className="text-brand-cyan">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    id="student-reg-dept"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  >
                    {COLLEGE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="21CS104"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Division
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-brand-cyan dark:hover:bg-cyan-400 text-white dark:text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering Student Account...</span>
                ) : (
                  <>
                    <span>Complete Student Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campusone.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-cyan text-navy-950 text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <span>Send Reset Link</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800 text-center text-xs text-slate-500 space-y-2">
            <p>
              Are you a faculty member?{' '}
              <button
                onClick={() => onSwitchPortal('faculty')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Go to Faculty Portal
              </button>
            </p>
            <p>
              College Administrator?{' '}
              <button
                onClick={() => onSwitchPortal('admin')}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Go to Admin Center
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
