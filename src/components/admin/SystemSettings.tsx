import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Copy, 
  Check, 
  Activity,
  FileCode2,
  ExternalLink
} from 'lucide-react';
import { isSupabaseConfigured, getBackendStatus, testSupabaseConnection, ConnectionHealthStatus, supabaseUrl, supabaseKey } from '../../lib/supabaseClient';
import { resetToInitialDemoData } from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';

export const SystemSettings: React.FC = () => {
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    status: ConnectionHealthStatus;
    latencyMs?: number;
    message: string;
    projectRef: string;
  } | null>(null);

  const status = getBackendStatus();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult({
        tested: true,
        success: result.success,
        status: result.status,
        latencyMs: result.latencyMs,
        message: result.message,
        projectRef: result.projectRef,
      });
      if (result.success) {
        addNotification('Connection Verified', `Supabase responded in ${result.latencyMs}ms.`, 'notice');
      } else if (result.status === 'schema_missing') {
        addNotification('Schema Setup Required', 'Connected to Supabase, but PostgreSQL tables are missing.', 'alert');
      } else {
        addNotification('Connection Test Failed', result.message, 'alert');
      }
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      handleTestConnection();
    }
  }, []);

  const handleResetData = () => {
    if (confirm('Reset all demo notices, events, attendance, and study materials back to original initial state?')) {
      resetToInitialDemoData();
      addNotification('Demo Engine Reset', 'All campus data reset to default seed records.', 'alert');
      window.location.reload();
    }
  };

  const handleCopyEnv = () => {
    const envSnippet = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_PUBLISHABLE_KEY=${supabaseKey}`;
    navigator.clipboard?.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportBackup = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('campusone_')) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          // ignore
        }
      }
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusOne_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addNotification('Backup Exported', 'Campus database snapshot saved to your computer.', 'notice');
  };

  return (
    <div className="space-y-6">
      {/* Backend Status Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              status.isVerifiedConnected
                ? 'bg-emerald-500/20 text-emerald-500'
                : status.status === 'schema_missing'
                ? 'bg-amber-500/20 text-amber-500'
                : isSupabaseConfigured
                ? 'bg-blue-500/20 text-blue-500'
                : 'bg-brand-cyan/20 text-brand-cyan'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Database Engine &amp; Cloud Connection
              </h3>
              <p className="text-xs text-slate-400">
                {status.isVerifiedConnected 
                  ? 'Connected to official Supabase PostgreSQL cloud backend' 
                  : status.status === 'schema_missing'
                  ? 'Project reachable, but PostgreSQL tables are not yet created (PGRST205)'
                  : isSupabaseConfigured
                  ? 'Supabase credentials detected; verifying cloud connectivity...'
                  : 'Running in Local Demo Mode with full browser persistence'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              status.isVerifiedConnected
                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                : status.status === 'schema_missing'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : isSupabaseConfigured
                ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                : 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
            }`}>
              {status.mode}
            </span>

            {isSupabaseConfigured && (
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1 rounded-full text-xs font-bold bg-navy-800 hover:bg-navy-700 text-brand-cyan border border-brand-cyan/30 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Ping'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic details */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">API Endpoint:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white truncate max-w-[280px] sm:max-w-none">
              {status.url}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Project Reference:</span>
            <span className="font-mono font-bold text-brand-cyan">
              {status.projectRef}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Key Prefix:</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {status.keyPrefix}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Verification Result:</span>
            <span className={`font-semibold ${
              status.isVerifiedConnected 
                ? 'text-emerald-500' 
                : status.status === 'schema_missing'
                ? 'text-amber-500 font-bold'
                : 'text-slate-400'
            }`}>
              {status.healthMessage}
            </span>
          </div>
        </div>

        {/* Test Result Box */}
        {testResult && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : testResult.status === 'schema_missing'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                testResult.status === 'schema_missing' ? 'text-amber-500' : 'text-rose-500'
              }`} />
            )}
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {testResult.success 
                  ? `Supabase Cloud Verified (${testResult.latencyMs}ms latency)` 
                  : testResult.status === 'schema_missing'
                  ? 'Connected to Project, but PostgreSQL Tables Not Found (PGRST205)'
                  : 'Supabase Connection Failed'}
              </p>
              <p className="opacity-90 leading-relaxed">{testResult.message}</p>
              {testResult.status === 'schema_missing' && (
                <div className="pt-2">
                  <a
                    href={`https://supabase.com/dashboard/project/${testResult.projectRef}/sql`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs transition-colors"
                  >
                    <span>Open Supabase SQL Editor for [{testResult.projectRef}]</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Steps to connect real Supabase */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-cyan" />
          <span>How to Apply Database Migrations on Supabase</span>
        </h4>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Your credentials for project <code className="font-mono font-bold text-brand-cyan bg-slate-100 dark:bg-navy-800 px-1 py-0.5 rounded">bbtjbazbeyedxjfgnfcm</code> are correctly loaded in <code className="font-mono text-brand-cyan">.env.local</code>. Follow these simple steps to instantiate the database tables:
          </p>

          <ol className="list-decimal list-inside space-y-2.5 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-navy-800">
            <li>
              Open your Supabase dashboard at <a href="https://supabase.com/dashboard/project/bbtjbazbeyedxjfgnfcm/sql" target="_blank" rel="noreferrer" className="text-brand-cyan font-bold hover:underline">https://supabase.com/dashboard/project/bbtjbazbeyedxjfgnfcm/sql</a>.
            </li>
            <li>
              Copy the contents of <code className="bg-slate-200 dark:bg-navy-800 px-1.5 py-0.5 rounded font-mono text-brand-cyan font-bold">supabase/migrations/20261026000000_campusone_core_schema.sql</code> (or <code className="bg-slate-200 dark:bg-navy-800 px-1.5 py-0.5 rounded font-mono text-brand-cyan font-bold">supabase/schema.sql</code>) from this codebase and paste into the SQL Editor.
            </li>
            <li>
              Click <strong>Run</strong>. PostgreSQL will create all tables, indexes, RLS security policies, and user provisioning triggers.
            </li>
            <li>
              Optionally paste and run <code className="bg-slate-200 dark:bg-navy-800 px-1.5 py-0.5 rounded font-mono text-brand-cyan font-bold">supabase/seed.sql</code> to populate realistic college departments, faculty profiles, notices, and facilities.
            </li>
            <li>
              Return here and click <strong>Test Ping</strong> above to verify your cloud tables.
            </li>
          </ol>

          {/* Snippet box */}
          <div className="relative p-3.5 rounded-xl bg-navy-950 font-mono text-xs text-slate-200 flex items-center justify-between border border-navy-800">
            <div>
              <p><span className="text-brand-cyan">VITE_SUPABASE_URL</span>=https://bbtjbazbeyedxjfgnfcm.supabase.co</p>
              <p><span className="text-brand-cyan">VITE_SUPABASE_PUBLISHABLE_KEY</span>=sb_publishable_YKpH-uVxnGsgXxV0oJzdDQ_g9ELtjeD</p>
            </div>
            <button
              onClick={handleCopyEnv}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center space-x-1"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-sans font-bold">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Backup, Export &amp; Factory Reset
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-left transition-colors flex items-center space-x-3"
          >
            <Download className="w-5 h-5 text-brand-cyan shrink-0" />
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">Export Database Snapshot</p>
              <p className="text-[11px] text-slate-400">Download all notices, events, and records as JSON</p>
            </div>
          </button>

          <button
            onClick={handleResetData}
            className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-left transition-colors flex items-center space-x-3"
          >
            <RefreshCw className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="font-bold text-xs text-rose-600 dark:text-rose-400">Reset Initial Demo Records</p>
              <p className="text-[11px] text-slate-400">Reverts custom edits back to college default seed data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
