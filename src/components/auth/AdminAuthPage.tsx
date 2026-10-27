import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  UserCheck,
  Mail
} from 'lucide-react';
import { CampusOneLogo } from '../common/CampusOneLogo';
import { 
  DEFAULT_ADMIN_USERNAME, 
  validateAdminInput, 
  resolveAdminCandidateEmails 
} from '../../lib/adminAuth';

interface AdminAuthPageProps {
  onLoginSuccess?: () => void;
  onNavigateHub?: () => void;
  onSwitchPortal?: (portal: 'student' | 'faculty') => void;
}

export const AdminAuthPage: React.FC<AdminAuthPageProps> = ({
  onLoginSuccess = () => {},
  onNavigateHub = () => {},
  onSwitchPortal = () => {}
}) => {
  const { signInWithPassword, signOut, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setSuccessMessage(null);

    // Client-side input validation
    const validation = validateAdminInput(identifier, password);
    if (!validation.valid) {
      setFormError(validation.error || 'Please enter valid administrative credentials.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Authenticate credentials securely with Supabase GoTrue
      const result = await signInWithPassword(identifier.trim(), password);

      if (!result.success) {
        setIsSubmitting(false);
        const rawErr = result.error || '';
        
        if (rawErr.toLowerCase().includes('invalid login credentials')) {
          setFormError('Invalid administrator credentials. Please check your username and master password.');
        } else if (rawErr.toLowerCase().includes('email not confirmed')) {
          setFormError(
            'Administrator account email confirmation is pending in Supabase. Please confirm the account or execute the provisioning migration.'
          );
        } else {
          setFormError(rawErr || 'Administrator authentication failed. Please verify credentials.');
        }
        return;
      }

      // 2. Strict Database Verification: Verify administrator role from trusted public.profiles in PostgreSQL
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileErr || !profile || profile.role !== 'admin') {
            // Immediately revoke session if not an administrator
            await signOut();
            setIsSubmitting(false);
            setFormError(
              `Access Denied: The authenticated account does not possess institutional administrator clearance in the PostgreSQL database.`
            );
            return;
          }
        }
      }

      setIsSubmitting(false);
      setSuccessMessage('Administrator clearance verified. Loading Control Center...');
      setTimeout(() => {
        onLoginSuccess();
      }, 600);

    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'An unexpected error occurred during administrator authentication.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setFormError('Please enter your administrator username or institutional email address.');
      return;
    }

    setIsSubmitting(true);
    const candidateEmails = resolveAdminCandidateEmails(identifier.trim());
    const targetEmail = candidateEmails[0] || identifier.trim();

    const result = await resetPassword(targetEmail);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(`Password recovery instructions dispatched to ${targetEmail}.`);
    } else {
      setFormError(result.error || 'Unable to send password recovery instructions.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-navy-950 to-black text-slate-100 flex flex-col font-sans transition-colors selection:bg-amber-500/25 selection:text-amber-400">
      
      {/* Top Bar */}
      <header className="border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onNavigateHub}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Campus Portals</span>
        </button>

        <CampusOneLogo variant="full" size="sm" withBadge theme="dark" />

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onSwitchPortal('student')}
            className="hidden sm:inline-flex text-slate-400 hover:text-brand-cyan transition-colors"
          >
            Student Portal &rarr;
          </button>
          <button
            onClick={() => onSwitchPortal('faculty')}
            className="hidden sm:inline-flex text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Faculty Suite &rarr;
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-navy-900/90 rounded-3xl p-6 sm:p-8 border border-navy-700/80 shadow-2xl relative backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-3 h-3" />
              <span>Institutional Governance</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {mode === 'signin' ? 'Admin Control Center' : 'Reset Administrator Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Sign in with your verified institutional administrator credentials.'
                : 'Enter your administrative username or email to receive password recovery.'}
            </p>
          </div>

          {/* Security Clearance Alert */}
          <div className="mb-6 p-3 rounded-2xl bg-navy-950/80 border border-navy-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Restricted Access Protocol</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Administrator clearance is verified in the PostgreSQL database (<code className="text-amber-300 font-mono">public.profiles.role = 'admin'</code>). Unauthorized access attempts are monitored and logged.
            </p>
          </div>

          {/* Status Banners */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2 animate-fade-in" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-start space-x-2 animate-fade-in" role="status">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleAdminSignIn} className="space-y-4" noValidate>
              <div>
                <label htmlFor="admin-username" className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator Username or Email
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="admin-username"
                    name="username"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={DEFAULT_ADMIN_USERNAME}
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="admin-password" className="block text-xs font-bold text-slate-300">
                    Master Password
                  </label>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => { setMode('forgot'); setFormError(null); setSuccessMessage(null); }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50 transition-colors"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50 btn-tactile"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                    <span>Verifying Administrative Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Control Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <div>
                <label htmlFor="admin-recovery-identifier" className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator Username or Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="admin-recovery-identifier"
                    name="recovery-identifier"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={DEFAULT_ADMIN_USERNAME}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-navy-950 border border-navy-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { setMode('signin'); setFormError(null); setSuccessMessage(null); }}
                  className="flex-1 py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50 btn-tactile"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-navy-950" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Recovery Link</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-4 border-t border-navy-800 text-center text-xs text-slate-400 space-y-2">
            <p>
              Looking for student portal?{' '}
              <button
                type="button"
                onClick={() => onSwitchPortal('student')}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Student Portal
              </button>
            </p>
            <p>
              Looking for teaching suite?{' '}
              <button
                type="button"
                onClick={() => onSwitchPortal('faculty')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Faculty Portal
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
