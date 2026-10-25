import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Sanitize URL helper to handle accidental /rest/v1 or trailing slashes
// Ensures createClient receives only the root origin (https://xyz.supabase.co)
export const cleanSupabaseUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    // Standard Supabase endpoint must be the project root origin without any path prefix
    return parsed.origin;
  } catch {
    let u = trimmed;
    while (u.endsWith('/') || u.endsWith('/rest/v1')) {
      if (u.endsWith('/')) {
        u = u.slice(0, -1);
      } else if (u.endsWith('/rest/v1')) {
        u = u.slice(0, -8);
      }
    }
    return u;
  }
};

// Environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const rawSupabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  ''
);

export const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);
export const supabaseKey = rawSupabaseKey;

// Extract project ref if standard Supabase URL
export const getSupabaseProjectRef = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length >= 3 && hostname.endsWith('.supabase.co')) {
      return parts[0];
    }
  } catch {
    // ignore
  }
  return 'unknown';
};

// Detect if credential format is provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseKey.length > 15 &&
  !supabaseKey.includes('your-supabase-publishable-key')
);

// Instantiate real Supabase client with safe browser auth settings
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'campusone_auth_token',
      },
    })
  : null;

export type ConnectionHealthStatus = 
  | 'unconfigured'      // No credentials provided
  | 'verifying'         // Currently checking health
  | 'connected'         // Real request succeeded & tables present
  | 'schema_missing'    // Project reached, but tables missing (PGRST205)
  | 'error';            // Network unreachable / invalid credentials

export interface BackendStatus {
  configured: boolean;
  isVerifiedConnected: boolean;
  status: ConnectionHealthStatus;
  url: string;
  projectRef: string;
  keyPrefix: string;
  mode: string;
  healthMessage: string;
  latencyMs?: number;
}

// Module-level cache of last verified connection test
let lastHealthCheck: {
  status: ConnectionHealthStatus;
  latencyMs?: number;
  message: string;
  timestamp: number;
} = {
  status: isSupabaseConfigured ? 'verifying' : 'unconfigured',
  message: isSupabaseConfigured 
    ? 'Credentials provided; pending connection verification.' 
    : 'Running on Local Demo Engine (Browser Storage).',
  timestamp: 0,
};

// Subscribers for health status changes
type HealthSubscriber = (status: BackendStatus) => void;
const healthSubscribers = new Set<HealthSubscriber>();

export const subscribeToBackendHealth = (callback: HealthSubscriber): (() => void) => {
  healthSubscribers.add(callback);
  callback(getBackendStatus());
  return () => {
    healthSubscribers.delete(callback);
  };
};

const notifySubscribers = () => {
  const current = getBackendStatus();
  healthSubscribers.forEach(cb => {
    try {
      cb(current);
    } catch (e) {
      console.warn('Error in health subscriber:', e);
    }
  });
};

/**
 * Execute actual ping test to Supabase to verify whether cloud database is live
 * NEVER claims connected unless a real request succeeds.
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  status: ConnectionHealthStatus;
  latencyMs?: number;
  message: string;
  projectRef: string;
}> => {
  const projectRef = getSupabaseProjectRef(supabaseUrl);

  if (!isSupabaseConfigured || !supabase) {
    lastHealthCheck = {
      status: 'unconfigured',
      message: 'No Supabase credentials in .env.local. Demo mode active.',
      timestamp: Date.now(),
    };
    notifySubscribers();
    return {
      success: false,
      status: 'unconfigured',
      message: 'Supabase credentials are not configured in .env.local',
      projectRef: 'none',
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('notices').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      if (error.code === 'PGRST205') {
        // Table doesn't exist in schema cache
        const msg = `Connected to Supabase project [${projectRef}], but table 'public.notices' was not found. Please run supabase/schema.sql in the Supabase SQL Editor.`;
        lastHealthCheck = {
          status: 'schema_missing',
          latencyMs,
          message: msg,
          timestamp: Date.now(),
        };
        notifySubscribers();
        return {
          success: false,
          status: 'schema_missing',
          latencyMs,
          message: msg,
          projectRef,
        };
      }

      const msg = `Supabase responded with error (${error.code}): ${error.message}`;
      lastHealthCheck = {
        status: 'error',
        latencyMs,
        message: msg,
        timestamp: Date.now(),
      };
      notifySubscribers();
      return {
        success: false,
        status: 'error',
        latencyMs,
        message: msg,
        projectRef,
      };
    }

    // Success: real request completed and table exists
    const msg = `Cloud database verified & operational (${latencyMs}ms)`;
    lastHealthCheck = {
      status: 'connected',
      latencyMs,
      message: msg,
      timestamp: Date.now(),
    };
    notifySubscribers();
    return {
      success: true,
      status: 'connected',
      latencyMs,
      message: msg,
      projectRef,
    };
  } catch (err: any) {
    const msg = `Network failure connecting to ${supabaseUrl}: ${err.message || 'Unknown network error'}`;
    lastHealthCheck = {
      status: 'error',
      message: msg,
      timestamp: Date.now(),
    };
    notifySubscribers();
    return {
      success: false,
      status: 'error',
      message: msg,
      projectRef,
    };
  }
};

export const getBackendStatus = (): BackendStatus => {
  const isVerifiedConnected = lastHealthCheck.status === 'connected';
  const projectRef = getSupabaseProjectRef(supabaseUrl);

  let mode: string;
  if (!isSupabaseConfigured) {
    mode = 'Local Demo Mode (Offline Persistence)';
  } else if (isVerifiedConnected) {
    mode = `Supabase Live Cloud [${projectRef}]`;
  } else if (lastHealthCheck.status === 'schema_missing') {
    mode = `Supabase Detected (Schema Missing / Migration Needed)`;
  } else if (lastHealthCheck.status === 'verifying') {
    mode = `Supabase Connecting [${projectRef}]...`;
  } else {
    mode = `Supabase Connection Failed`;
  }

  return {
    configured: isSupabaseConfigured,
    isVerifiedConnected,
    status: lastHealthCheck.status,
    url: isSupabaseConfigured ? supabaseUrl : 'Demo Local Engine (Browser Storage)',
    projectRef,
    keyPrefix: isSupabaseConfigured
      ? `${supabaseKey.slice(0, 10)}...${supabaseKey.slice(-4)}`
      : 'None (Offline)',
    mode,
    healthMessage: lastHealthCheck.message,
    latencyMs: lastHealthCheck.latencyMs,
  };
};

// Automatically run a non-blocking initial diagnostic verification on startup
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  setTimeout(() => {
    testSupabaseConnection().catch(() => {});
  }, 100);
}
