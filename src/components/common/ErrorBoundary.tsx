import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CampusOneLogo } from './CampusOneLogo';
import { RefreshCw, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CampusOne ErrorBoundary caught]:', error, errorInfo);
    this.setState({ errorInfo });

    // Handle stale bundle chunk loading failures automatically
    const isChunkOrScriptError = 
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Unexpected token') ||
      error.name === 'ChunkLoadError';

    if (isChunkOrScriptError && typeof window !== 'undefined') {
      const reloadKey = 'campusone_chunk_reload_attempt';
      const lastReload = sessionStorage.getItem(reloadKey);
      if (!lastReload) {
        sessionStorage.setItem(reloadKey, 'true');
        // Unregister service worker and force clean reload from network
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
          });
        }
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearCacheAndReset = async () => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Clear all cache storage keys
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }

      // 3. Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // 4. Navigate cleanly to root
      window.location.href = '/';
    } catch (e) {
      console.warn('Error clearing caches:', e);
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-brand-cyan/25 selection:text-brand-cyan">
          {/* Ambient background glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-lg w-full bg-navy-900/90 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md text-center space-y-6">
            
            {/* Brand Logo */}
            <div className="flex justify-center">
              <CampusOneLogo variant="full" size="md" withBadge theme="dark" />
            </div>

            {/* Error Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Application Rendering Recovery
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                CampusOne detected an unexpected runtime or cached script issue on this device.
                Your institutional database records and authentication credentials remain completely safe.
              </p>
            </div>

            {/* Error Details (Collapsible for debugging) */}
            {this.state.error && (
              <div className="bg-navy-950/80 p-3.5 rounded-xl border border-navy-800 text-left text-[11px] font-mono text-slate-400 overflow-x-auto max-h-32 scrollbar-none">
                <span className="text-rose-400 font-bold block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <span className="text-slate-500 text-[10px] whitespace-pre-wrap block">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </span>
                )}
              </div>
            )}

            {/* Recovery Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload CampusOne</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReset}
                className="w-full py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors border border-navy-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Local Device Cache &amp; Reset</span>
              </button>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-2 border-t border-navy-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by Supabase PostgreSQL RLS &amp; CampusOne Security</span>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
