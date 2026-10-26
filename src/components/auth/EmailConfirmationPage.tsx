import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { CampusOneLogo } from '../common/CampusOneLogo';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  LogIn,
  Home,
  Check
} from 'lucide-react';

interface EmailConfirmationPageProps {
  onNavigateLogin: (portal: 'student' | 'faculty') => void;
  onNavigateHub: () => void;
}

type VerificationStatus = 
  | 'verifying'
  | 'success'
  | 'faculty_pending'
  | 'already_verified'
  | 'error'
  | 'idle';

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({
  onNavigateLogin,
  onNavigateHub,
}) => {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [detectedRole, setDetectedRole] = useState<'student' | 'faculty'>('student');

  // Resend form state
  const [resendEmail, setResendEmail] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [resendError, setResendError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const processConfirmation = async () => {
      if (typeof window === 'undefined') return;

      const searchParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      // Check role/portal hint
      const roleParam = searchParams.get('role') || hashParams.get('role');
      if (roleParam === 'faculty') {
        setDetectedRole('faculty');
      }

      // Check error parameters in hash or search
      const errorParam = hashParams.get('error') || searchParams.get('error');
      const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
      const rawErrorDesc = hashParams.get('error_description') || searchParams.get('error_description');
      const errorDescription = rawErrorDesc ? decodeURIComponent(rawErrorDesc.replace(/\+/g, ' ')) : undefined;

      if (errorParam || errorCode || errorDescription) {
        if (!isMounted) return;
        setStatus('error');
        if (errorCode === 'otp_expired' || errorParam === 'access_denied') {
          setErrorMessage('This verification link has expired or has already been used. Please request a new confirmation email below.');
        } else {
          setErrorMessage(errorDescription || errorParam || 'The verification link is invalid.');
        }
        return;
      }

      // 1. Direct Token Hash Flow (Pattern 1: token_hash parameter)
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token') || hashParams.get('token_hash');
      const otpType = (searchParams.get('type') || hashParams.get('type') || 'signup') as any;

      if (tokenHash && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });

          if (!isMounted) return;

          if (error) {
            setStatus('error');
            setErrorMessage(error.message || 'The verification token could not be verified.');
            return;
          }

          if (data?.user) {
            setVerifiedEmail(data.user.email || '');
            const meta = data.user.user_metadata || {};
            const isFacultyReq = meta.requestedRole === 'faculty' || meta.role === 'faculty' || roleParam === 'faculty';
            if (isFacultyReq) {
              setDetectedRole('faculty');
              setStatus('faculty_pending');
            } else {
              setStatus('success');
            }
          } else {
            setStatus('success');
          }
          return;
        } catch (err: any) {
          if (!isMounted) return;
          setStatus('error');
          setErrorMessage(err.message || 'Verification failed. Please try again.');
          return;
        }
      }

      // 2. PKCE Authorization Code Exchange (Pattern 2: code parameter)
      const code = searchParams.get('code') || hashParams.get('code');
      if (code && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!isMounted) return;

          if (error) {
            setStatus('error');
            setErrorMessage(error.message || 'Could not exchange authorization code.');
            return;
          }

          if (data?.user) {
            setVerifiedEmail(data.user.email || '');
            const meta = data.user.user_metadata || {};
            const isFacultyReq = meta.requestedRole === 'faculty' || meta.role === 'faculty' || roleParam === 'faculty';
            if (isFacultyReq) {
              setDetectedRole('faculty');
              setStatus('faculty_pending');
            } else {
              setStatus('success');
            }
          } else {
            setStatus('success');
          }
          return;
        } catch (err: any) {
          if (!isMounted) return;
          setStatus('error');
          setErrorMessage(err.message || 'Failed to exchange verification session.');
          return;
        }
      }

      // 3. Implicit Hash Tokens (access_token in hash)
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (!isMounted) return;

          if (!error && data?.user) {
            setVerifiedEmail(data.user.email || '');
            const meta = data.user.user_metadata || {};
            if (meta.requestedRole === 'faculty' || roleParam === 'faculty') {
              setDetectedRole('faculty');
              setStatus('faculty_pending');
            } else {
              setStatus('success');
            }
            return;
          }
        } catch (err) {
          // ignore and fall through
        }
      }

      // 4. Check if session already exists
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!isMounted) return;

          if (session?.user) {
            setVerifiedEmail(session.user.email || '');
            setStatus('already_verified');
            return;
          }
        } catch {
          // ignore
        }
      }

      // 5. No token provided
      if (!isMounted) return;
      setStatus('idle');
    };

    processConfirmation();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: resendEmail.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });

        if (error) {
          throw error;
        }
      }

      setResendSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setResendError('Email request rate limit reached. Please wait a few minutes before requesting another confirmation email.');
      } else {
        setResendError(err.message || 'Failed to dispatch confirmation email. Please verify the address.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-cyan/25 selection:text-brand-cyan">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Top Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <CampusOneLogo 
              size="lg" 
              subtext="FOR GOVERNMENT POLYTECHNIC AHMEDABAD" 
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-navy-800 space-y-6 animate-fade-in">

          {/* 1. VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-navy-900 dark:text-white">
                  Verifying Your Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Validating your institutional email credentials with Government Polytechnic Ahmedabad...
                </p>
              </div>
            </div>
          )}

          {/* 2. SUCCESS STATE (Student) */}
          {status === 'success' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Account Verified
                </span>
                <h3 className="text-2xl font-black text-navy-900 dark:text-white">
                  Email Verified Successfully
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your student account for <strong>Government Polytechnic Ahmedabad</strong> is now active. You can sign in to view class timetables, attendance records, and academic results.
                </p>
                {verifiedEmail && (
                  <p className="text-xs font-mono font-semibold text-brand-cyan pt-1">
                    {verifiedEmail}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateLogin('student')}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-extrabold text-sm shadow-md shadow-brand-cyan/20 btn-tactile transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Student Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. FACULTY PENDING STATE */}
          {status === 'faculty_pending' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto ring-8 ring-amber-500/10">
                <Clock className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Email Confirmed • Pending Approval
                </span>
                <h3 className="text-2xl font-black text-navy-900 dark:text-white">
                  Faculty Request Under Review
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your institutional email address has been verified. In accordance with Government Polytechnic Ahmedabad security policies, faculty privileges require administrative authorization before grading and attendance permissions are unlocked.
                </p>
                {verifiedEmail && (
                  <p className="text-xs font-mono font-semibold text-amber-500 pt-1">
                    {verifiedEmail}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-left text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  What Happens Next:
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Campus administrators review faculty requests in the Admin Console. Once approved, your role will be upgraded to verified faculty.
                </p>
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => onNavigateLogin('faculty')}
                  className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white dark:bg-brand-cyan dark:text-navy-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Sign In as Faculty</span>
                  <LogIn className="w-4 h-4" />
                </button>
                <button
                  onClick={onNavigateHub}
                  className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold transition-colors"
                >
                  Return to Campus Hub
                </button>
              </div>
            </div>
          )}

          {/* 4. ALREADY VERIFIED STATE */}
          {status === 'already_verified' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/15 text-blue-500 flex items-center justify-center mx-auto ring-8 ring-blue-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Active Session
                </span>
                <h3 className="text-2xl font-black text-navy-900 dark:text-white">
                  Account Already Verified
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your account is already verified and you have an active session for Government Polytechnic Ahmedabad.
                </p>
                {verifiedEmail && (
                  <p className="text-xs font-mono font-semibold text-brand-cyan pt-1">
                    {verifiedEmail}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => onNavigateLogin('student')}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Go to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 5. ERROR STATE (Expired / Invalid Link) */}
          {status === 'error' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-500/10">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  Verification Failed
                </span>
                <h3 className="text-2xl font-black text-navy-900 dark:text-white">
                  Link Invalid or Expired
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {errorMessage || 'This email confirmation link has expired, has already been used, or is malformed.'}
                </p>
              </div>

              {/* Resend Confirmation Form */}
              <div className="pt-2 text-left border-t border-slate-100 dark:border-navy-800 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Request a New Confirmation Link
                </p>
                
                {resendSuccess ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center">
                      <Check className="w-4 h-4 mr-1 text-emerald-500" />
                      Confirmation Email Dispatched!
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Check your inbox and spam folder for a fresh verification link from CampusOne.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-3">
                    {resendError && (
                      <p className="text-[11px] text-rose-500 font-semibold">
                        {resendError}
                      </p>
                    )}
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="Enter your registered college email"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white dark:bg-brand-cyan dark:text-navy-950 font-bold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {resendLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending New Link...</span>
                        </>
                      ) : (
                        <span>Send New Confirmation Email</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center space-x-4 text-xs">
                <button
                  onClick={() => onNavigateLogin('student')}
                  className="font-bold text-brand-cyan hover:underline"
                >
                  Go to Student Login
                </button>
                <span className="text-slate-400">•</span>
                <button
                  onClick={onNavigateHub}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Campus Overview
                </button>
              </div>
            </div>
          )}

          {/* 6. IDLE STATE (No token in URL) */}
          {status === 'idle' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-brand-cyan" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-navy-900 dark:text-white">
                  Email Verification Portal
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                  To confirm your account for Government Polytechnic Ahmedabad, please open the verification email sent to your inbox and tap the confirmation link.
                </p>
              </div>

              {/* Resend option */}
              <div className="pt-2 text-left border-t border-slate-100 dark:border-navy-800 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Need a confirmation link sent?
                </p>

                {resendSuccess ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center">
                      <Check className="w-4 h-4 mr-1 text-emerald-500" />
                      Confirmation Email Sent!
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Please check your inbox or spam folder.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-3">
                    {resendError && (
                      <p className="text-[11px] text-rose-500 font-semibold">
                        {resendError}
                      </p>
                    )}
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="Enter your registered email address"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {resendLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Link...</span>
                        </>
                      ) : (
                        <span>Request Confirmation Email</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center space-x-4 text-xs">
                <button
                  onClick={() => onNavigateLogin('student')}
                  className="font-bold text-brand-cyan hover:underline"
                >
                  Student Login
                </button>
                <span className="text-slate-400">•</span>
                <button
                  onClick={() => onNavigateLogin('faculty')}
                  className="font-bold text-brand-cyan hover:underline"
                >
                  Faculty Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          CampusOne &bull; Government Polytechnic Ahmedabad
        </p>
      </div>
    </div>
  );
};
