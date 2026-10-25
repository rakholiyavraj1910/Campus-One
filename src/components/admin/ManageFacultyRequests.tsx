import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useNotifications } from '../../context/NotificationContext';
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
  RefreshCw,
  Sparkles
} from 'lucide-react';

export interface PendingFacultyRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  cabin?: string;
  specialization?: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SAMPLE_PENDING_REQUESTS: PendingFacultyRequest[] = [
  {
    id: 'fac-req-demo-1',
    name: 'Dr. Radhika Sen',
    email: 'radhika.sen@campusone.edu',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    cabin: 'Tech Tower, Room 402',
    specialization: ['Distributed Systems', 'Cloud Architecture'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending'
  },
  {
    id: 'fac-req-demo-2',
    name: 'Prof. Suresh Varma',
    email: 'suresh.varma@campusone.edu',
    department: 'Electronics & Communication Engineering',
    designation: 'Assistant Professor',
    cabin: 'ECE Block, Room 210',
    specialization: ['VLSI Design', 'Embedded Systems'],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'pending'
  }
];

export const ManageFacultyRequests: React.FC = () => {
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<PendingFacultyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or('admin_level.eq.pending_faculty,role.eq.pending');

        if (!error && data) {
          const mapped: PendingFacultyRequest[] = data.map((d: any) => ({
            id: d.id,
            name: d.name || 'Faculty Applicant',
            email: d.email,
            department: d.department || 'Computer Science & Engineering',
            designation: d.designation || 'Assistant Professor',
            cabin: d.cabin || 'Faculty Block',
            specialization: d.specialization || [],
            createdAt: d.created_at || new Date().toISOString(),
            status: 'pending'
          }));

          // Merge with any demo requests if DB is empty for demonstration
          if (mapped.length > 0) {
            setRequests(mapped);
          } else {
            // Read local storage
            const local = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
            setRequests(local.length > 0 ? local : SAMPLE_PENDING_REQUESTS);
          }
        } else {
          const local = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
          setRequests(local.length > 0 ? local : SAMPLE_PENDING_REQUESTS);
        }
      } catch (e) {
        const local = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
        setRequests(local.length > 0 ? local : SAMPLE_PENDING_REQUESTS);
      }
    } else {
      const local = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
      setRequests(local.length > 0 ? local : SAMPLE_PENDING_REQUESTS);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (req: PendingFacultyRequest) => {
    setActionInProgress(req.id);

    try {
      if (isSupabaseConfigured && supabase) {
        // 1. Elevate profile role to faculty and mark approved
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            role: 'faculty',
            admin_level: 'faculty_approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);

        if (profileErr) {
          console.warn('Profile update warning:', profileErr.message);
        }

        // 2. Upsert into faculty_directory
        await supabase
          .from('faculty_directory')
          .upsert({
            name: req.name,
            email: req.email,
            department: req.department,
            designation: req.designation,
            cabin: req.cabin || 'Faculty Block',
            specialization: req.specialization || ['Computer Science'],
            qualification: 'Ph.D. / M.Tech',
            experience_years: 5,
            phone: '+91 98000 00000',
            updated_at: new Date().toISOString()
          }, { onConflict: 'email' });
      }

      // Update local state
      setRequests(prev => prev.filter(r => r.id !== req.id));

      // Update local storage
      const existing = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
      const filtered = existing.filter((r: any) => r.id !== req.id);
      localStorage.setItem('campusone_pending_faculty_requests', JSON.stringify(filtered));

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

  const handleReject = async (req: PendingFacultyRequest) => {
    setActionInProgress(req.id);

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('profiles')
          .update({
            admin_level: 'faculty_rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', req.id);
      }

      setRequests(prev => prev.filter(r => r.id !== req.id));

      const existing = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
      const filtered = existing.filter((r: any) => r.id !== req.id);
      localStorage.setItem('campusone_pending_faculty_requests', JSON.stringify(filtered));

      addNotification(
        'Request Declined',
        `Access request for ${req.name} has been declined.`,
        'alert'
      );
    } catch (err: any) {
      addNotification('Rejection Error', err.message || 'Failed to reject request.', 'alert');
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === 'All' || r.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Departmental Verification Queue
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {requests.length} Application{requests.length === 1 ? '' : 's'} Pending
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white mt-1">
            Faculty Access &amp; Credential Approvals
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review professor registrations. Approving grants access to course rosters, attendance logging, and grading.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name, email, or department..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
          <option value="Electronics & Communication Engineering">Electronics &amp; Communication Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Civil Engineering">Civil Engineering</option>
        </select>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-navy-900 dark:text-white">
            No Pending Faculty Requests
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            All submitted faculty applications have been verified. New faculty registrations will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(req => {
            const isActing = actionInProgress === req.id;

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200/90 dark:border-navy-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-500/40"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-navy-900 dark:text-white">
                      {req.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      Pending Admin Approval
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {req.designation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                      <span>{req.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{req.department}</span>
                    </div>
                    {req.cabin && (
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{req.cabin}</span>
                      </div>
                    )}
                  </div>

                  {req.specialization && req.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {req.specialization.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Applied: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-navy-800">
                  <button
                    onClick={() => handleReject(req)}
                    disabled={isActing}
                    className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req)}
                    disabled={isActing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isActing ? 'Approving...' : 'Approve Faculty'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
