import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../lib/storageService';
import { Shield, Search, Clock, User, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

export const AuditLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => {
    if (roleFilter !== 'All' && log.actorRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.targetType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <ScrollReveal direction="down" distance={16}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              System Security & Administrative Audit Trail
            </h3>
            <p className="text-xs text-slate-400">
              Immutable log of notice publications, attendance commits, user privilege modifications, and grade revisions
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50 btn-tactile"
              title="Refresh audit logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
            </button>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={30}>
        <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Actor & Role</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4"><div className="h-4 w-28 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" />
                          <div className="h-2.5 w-12 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" />
                        </div>
                      </td>
                      <td className="py-3.5 px-3"><div className="h-5 w-20 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                      <td className="py-3.5 px-3"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-full max-w-sm rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 space-y-1">
                      <Shield className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-2" />
                      <p className="text-xs font-semibold text-slate-500">No audit log records match criteria</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search terms or role filter.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-white">{log.actorName}</p>
                        <span className="text-[10px] font-bold uppercase text-brand-cyan">{log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600 dark:text-slate-400">
                        {log.targetType}
                      </td>
                      <td className="py-3.5 px-4 leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
