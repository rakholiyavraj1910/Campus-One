import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserProfile } from '../../types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Building2, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { 
  getPendingFacultyRequests, 
  approveFacultyRequest, 
  rejectFacultyRequest 
} from '../../lib/storageService';

export const ManageFacultyRequests: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingFacultyRequests();
      setRequests(data);
    } catch (e) {
      console.error('Failed to load pending faculty requests:', e);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (req: UserProfile) => {
    setActionInProgress(req.id);
    try {
      await approveFacultyRequest(req.id, user?.name || 'Institutional Administrator');
      setRequests(prev => prev.filter(r => r.id !== req.id));
      addNotification(
        'Faculty Access Approved',
        `${req.name} has been granted instructional faculty privileges for ${req.department}.`,
        'academic'
      );
    } catch (err: any) {
      addNotification(
        'Approval Error',
        err.message || 'Failed to complete faculty approval.',
        'alert'
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (req: UserProfile) => {
    setActionInProgress(req.id);
    try {
      await rejectFacultyRequest(req.id, user?.name || 'Institutional Administrator');
      setRequests(prev => prev.filter(r => r.id !== req.id));
      addNotification(
        'Request Declined',
        `Access request for ${req.name} has been declined.`,
        'alert'
      );
    } catch (err: any) {
      addNotification('Rejection Error', err.message || 'Failed to decline request.', 'alert');
    } finally {
      setActionInProgress(null);
    }
  };

  const departments = ['All', ...Array.from(new Set(requests.map(r => r.department).filter((d): d is string => Boolean(d))))];

  const filteredRequests = requests.filter(req => {
    if (selectedDept !== 'All' && req.department !== selectedDept) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.name.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      (req.department && req.department.toLowerCase().includes(q)) ||
      (req.designation && req.designation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Faculty Access Requests & Approval Ledger
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              requests.length > 0 
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}>
              {requests.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Institutional verification required before granting grading and attendance permissions
          </p>
        </div>

        {/* Search and Refresh */}
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applicant name, email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
            title="Refresh Requests"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Department Filter Tabs */}
      {departments.length > 2 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedDept === d
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-xs'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-navy-800 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-200/80 dark:border-navy-800">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-cyan" />
            <p className="text-xs font-semibold">Loading pending faculty requests from database...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200/80 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              {requests.length === 0 ? 'No Pending Faculty Requests' : 'No Requests Matching Search'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {requests.length === 0
                ? 'All faculty access applications have been reviewed. When a professor signs up via the Faculty Portal, their request will appear here for administrative verification.'
                : 'Try adjusting your search query or department filter.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-xs hover:border-brand-cyan/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {req.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                    Pending Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.department}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.designation || 'Lecturer'}</span>
                  </div>
                  {req.cabin && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.cabin}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Applied: Recent</span>
                  </div>
                </div>

                {req.specialization && req.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {req.specialization.map((spec: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-navy-800">
                <button
                  onClick={() => handleReject(req)}
                  disabled={actionInProgress === req.id}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold btn-tactile transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleApprove(req)}
                  disabled={actionInProgress === req.id}
                  className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs font-bold shadow-xs btn-tactile transition-all disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionInProgress === req.id ? 'Approving...' : 'Approve Faculty'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
