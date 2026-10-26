import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthUrlState {
  isConfirmed: boolean;
  type?: string;
  code?: string;
  error?: string;
  errorCode?: string;
  errorDescription?: string;
}

/**
 * Returns the canonical base URL for Supabase Auth redirect URLs (confirmations, password resets).
 * 
 * Order of resolution:
 * 1. import.meta.env.VITE_SITE_URL or VITE_PUBLIC_SITE_URL (Explicit configuration)
 * 2. window.location.origin (Current browser environment)
 * 3. Canonical production URL: 'https://campus-oneweb.vercel.app'
 */
export const getSiteUrl = (): string => {
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_SITE_URL) || 
    ''
  ).trim();

  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'https://campus-oneweb.vercel.app';
};

/**
 * Constructs the exact callback URL for Supabase Auth operations.
 * Example: getAuthRedirectUrl('/auth/confirm')
 * Produces: https://campus-oneweb.vercel.app/auth/confirm
 */
export const getAuthRedirectUrl = (path: string = '/auth/confirm'): string => {
  const base = getSiteUrl();

  // Strict Open-Redirect Protection:
  // Reject protocol-relative URLs (//attacker.com), backslashes, or absolute URLs to untrusted hosts
  if (!path || typeof path !== 'string' || path.startsWith('//') || path.includes('://') || path.includes('\\')) {
    return `${base}/auth/confirm`;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

/**
 * Inspects query string and URL hash fragment for Supabase confirmation/auth tokens or errors.
 */
export const parseAuthUrlState = (): AuthUrlState => {
  if (typeof window === 'undefined') {
    return { isConfirmed: false };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hashString = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hashString);

  // Check error in hash or query
  const error = hashParams.get('error') || searchParams.get('error') || undefined;
  const errorCode = hashParams.get('error_code') || searchParams.get('error_code') || undefined;
  const rawDescription = hashParams.get('error_description') || searchParams.get('error_description') || undefined;
  const errorDescription = rawDescription ? decodeURIComponent(rawDescription.replace(/\+/g, ' ')) : undefined;

  // Check code (PKCE)
  const code = searchParams.get('code') || hashParams.get('code') || undefined;

  // Check confirmation / type
  const type = hashParams.get('type') || searchParams.get('type') || undefined;
  const isExplicitConfirmed = searchParams.get('confirmed') === 'true' || hashParams.get('confirmed') === 'true';
  const isSignupType = type === 'signup' || type === 'email_confirmation' || type === 'recovery';

  return {
    isConfirmed: isExplicitConfirmed || Boolean(isSignupType && !error),
    type,
    code,
    error,
    errorCode,
    errorDescription,
  };
};

/**
 * Strips auth tokens, hashes, and confirmation flags from the browser address bar
 * to keep the URL clean and prevent repeated alerts on reload.
 */
export const cleanAuthUrlParams = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('confirmed');
    url.searchParams.delete('error');
    url.searchParams.delete('error_code');
    url.searchParams.delete('error_description');
    url.searchParams.delete('type');
    url.hash = '';

    const cleanPath = url.pathname + (url.search ? url.search : '');
    window.history.replaceState({}, document.title, cleanPath || '/');
  } catch {
    // Ignore history API errors
  }
};

/**
 * If PKCE code is in the URL, attempts to exchange it for a session.
 */
export const processAuthRedirectCode = async (
  supabaseClient: SupabaseClient | null
): Promise<{ success: boolean; error?: string }> => {
  if (!supabaseClient || typeof window === 'undefined') {
    return { success: false };
  }

  const { code, error, errorDescription } = parseAuthUrlState();

  if (error) {
    cleanAuthUrlParams();
    return { 
      success: false, 
      error: errorDescription || error || 'Email confirmation link is invalid or expired.' 
    };
  }

  if (code) {
    try {
      const { error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
      cleanAuthUrlParams();
      if (exchangeError) {
        return { success: false, error: exchangeError.message };
      }
      return { success: true };
    } catch (err: any) {
      cleanAuthUrlParams();
      return { success: false, error: err.message || 'Failed to exchange confirmation code.' };
    }
  }

  return { success: false };
};
