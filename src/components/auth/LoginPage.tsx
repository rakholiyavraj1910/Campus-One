import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  intendedPath?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, intendedPath }) => {
  const { signInWithPassword, signUp, resetPassword, authError } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const departmentsList = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Information Technology',
    'Civil Engineering',
    'Electrical & Electronics Engineering'
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setFormError('Please enter both institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setFormError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !password) {
      setFormError('Please enter an institutional email and a secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email.trim(), password, name.trim(), department);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Student registration successful! Your verified student profile has been provisioned.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 1200);
    } else {
      setFormError(result.error || 'Registration failed. Please try a different email address.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your registered institutional email.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Password reset instructions have been sent to your email.');
    } else {
      setFormError(result.error || 'Failed to dispatch password recovery email.');
    }
  };

  // Quick fill helper for evaluator or testing
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('signin');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-brand-cyan/30 selection:text-brand-cyan relative overflow-hidden font-sans">
      {/* Background glowing ambient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top institutional bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-navy-950 font-extrabold shadow-md shadow-brand-cyan/20">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Campus<span className="text-brand-cyan">One</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 uppercase tracking-wider">
                  Production Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Apex Institute of Technology & Science • NAAC A++ Autonomous College
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Supabase Cloud Auth &amp; RLS Protected</span>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header Info */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'signin' && 'Institutional Sign In'}
              {mode === 'register' && 'New Student Enrollment'}
              {mode === 'forgot' && 'Reset Account Password'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'signin' && 'Access your academic records, timetables, attendance, and campus portals.'}
              {mode === 'register' && 'Create your official student account. Profile will be provisioned in the central directory.'}
              {mode === 'forgot' && 'Enter your institutional email to receive a secure recovery link.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setMode('signin'); setFormError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-brand-cyan text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setFormError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-brand-cyan text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setMode('forgot'); setFormError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'forgot'
                  ? 'bg-brand-cyan text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recover
            </button>
          </div>

          {/* Error & Success Banners */}
          {(formError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {formError || authError}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                {successMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'register' ? handleSignUp : handleForgot} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Full Name (as per college ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusone.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-brand-cyan hover:underline text-[11px]"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Academic Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-cyan transition-colors"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-brand-cyan/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to Portal'}
                    {mode === 'register' && 'Create Student Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Note */}
          <div className="mt-6 pt-5 border-t border-slate-900 text-center">
            <p className="text-[11px] text-slate-500">
              Secured by PostgreSQL Row-Level Security (RLS) &amp; GoTrue Authentication.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-3 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} CampusOne College Management System. All Institutional Rights Reserved.</p>
      </footer>
    </div>
  );
};