import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_DEPARTMENTS } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { parseAuthUrlState, cleanAuthUrlParams, processAuthRedirectCode } from '../../lib/authRedirect';
import { 
  Users, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Building2,
  ChevronLeft,
  Briefcase,
  MapPin,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface FacultyAuthPageProps {
  initialMode?: 'signin' | 'register';
  onLoginSuccess?: () => void;
  onNavigateHub?: () => void;
  onSwitchPortal?: (portal: 'student' | 'admin') => void;
}

export const FacultyAuthPage: React.FC<FacultyAuthPageProps> = ({
  initialMode = 'signin',
  onLoginSuccess = () => {},
  onNavigateHub = () => {},
  onSwitchPortal = () => {}
}) => {
  const { signInWithPassword, requestFacultyAccess, resetPassword, authError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);
  const [designation, setDesignation] = useState('Associate Professor');
  const [cabin, setCabin] = useState('Tech Tower, Room 402');
  const [specialization, setSpecialization] = useState('Distributed Systems, Cloud Architecture');
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
          setSuccessMessage('Email verified successfully! Loading your institutional portal...');
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
        setSuccessMessage('Email confirmed successfully! Your faculty account is verified and awaiting administrative approval.');
        cleanAuthUrlParams();
      }
    };

    handleUrlState();
  }, [onLoginSuccess]);

  const designationsList = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Adjunct Lecturer',
    'Visiting Faculty',
    'Lab Instructor'
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setFormError('Please enter your institutional faculty email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setFormError(result.error || 'Authentication failed. Please verify faculty credentials.');
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your academic title and full name.');
      return;
    }
    if (!department || !COLLEGE_DEPARTMENTS.includes(department as any)) {
      setFormError('Please select a valid college department.');
      return;
    }
    if (!email.trim() || !password) {
      setFormError('Please provide your institutional email and a secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await requestFacultyAccess(
      email.trim(),
      password,
      name.trim(),
      department,
      designation,
      cabin.trim(),
      specialization.trim()
    );
    setIsSubmitting(false);

    if (result.success) {
      if (result.needsEmailConfirmation) {
        setSuccessMessage(`Faculty access request submitted! A verification link has been sent to ${email.trim()}. Please tap "Confirm email address" in your email to activate your account for administrative review.`);
        setMode('signin');
      } else {
        setSuccessMessage('Faculty access request submitted! Your application is awaiting departmental administrative verification.');
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      }
    } else {
      setFormError(result.error || 'Request submission failed. Please try again.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your registered faculty email.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Password recovery instructions sent to your email.');
    } else {
      setFormError(result.error || 'Unable to send recovery email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200 dark:from-navy-950 dark:via-navy-900 dark:to-[#0a1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500/25 selection:text-emerald-500">
      
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
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-navy-900 dark:text-white">
            Faculty<span className="text-emerald-500">Suite</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onSwitchPortal('student')}
            className="hidden sm:inline-flex text-slate-500 hover:text-brand-cyan transition-colors"
          >
            Student Portal &rarr;
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
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
              <Users className="w-7 h-7" />
            </div>
            
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Instructional Operations</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white">
              {mode === 'signin' && 'Faculty Suite Sign In'}
              {mode === 'register' && 'Request Faculty Access'}
              {mode === 'forgot' && 'Reset Faculty Password'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' && 'Access course rosters, daily attendance, gradebook & schedules.'}
              {mode === 'register' && 'Submit instructional credentials for institutional admin verification.'}
              {mode === 'forgot' && 'Enter your institutional email for password recovery.'}
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
                Faculty Sign In
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
                Request Access
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
                  Institutional Faculty Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="professor@campusone.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                    className="text-[11px] text-emerald-500 hover:underline"
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Enter Faculty Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. Request Access Form */}
          {mode === 'register' && (
            <form onSubmit={handleRequestAccess} className="space-y-3.5">
              {/* Institutional Policy Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Institutional Verification Required</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-300">
                  New faculty registrations create a pending request. An administrator must verify your credentials before class rosters and gradebooks are accessible.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name &amp; Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Radhika Sen"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="prof@campusone.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="faculty-reg-dept" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    id="faculty-reg-dept"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {COLLEGE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {designationsList.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cabin / Office Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="Tech Tower, Room 402"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specialization / Subjects
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Distributed Systems, Cloud Architecture"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Faculty Application...</span>
                ) : (
                  <>
                    <span>Submit Faculty Access Request</span>
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
                  Registered Faculty Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="professor@campusone.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <span>Send Recovery Email</span>
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800 text-center text-xs text-slate-500 space-y-2">
            <p>
              Looking for student portal?{' '}
              <button
                onClick={() => onSwitchPortal('student')}
                className="text-cyan-600 dark:text-brand-cyan font-bold hover:underline"
              >
                Go to Student Portal
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
