import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { Users, Search, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { getStudents } from '../../lib/storageService';

export const ManageStudents: React.FC = () => {
  const { addNotification } = useNotifications();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const list = await getStudents();
      setStudents(list);
    } catch (e) {
      console.error('Error fetching students:', e);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStudentRole = async (id: string, currentRole: UserRole) => {
    setUpdatingId(id);
    const nextRole: UserRole = currentRole === 'student' ? 'faculty' : 'student';

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: nextRole })
          .eq('id', id);

        if (error) {
          throw error;
        }
      }

      setStudents(prev => prev.map(s => s.id === id ? { ...s, role: nextRole } : s));
      addNotification('Role Updated', `User permissions updated to ${nextRole.toUpperCase()}`, 'alert');
    } catch (err: any) {
      addNotification('Update Failed', err.message || 'Could not update user role', 'alert');
    } finally {
      setUpdatingId(null);
    }
  };

  const departments = ['All', ...Array.from(new Set(students.map(s => s.department).filter((d): d is string => Boolean(d))))];

  const filtered = students.filter(s => {
    if (deptFilter !== 'All' && s.department !== deptFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.prn && s.prn.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Student Enrollment Directory & Access Control
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {students.length} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real Supabase student profiles for Government Polytechnic Ahmedabad
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll no, PRN..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <button
            onClick={fetchStudents}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Department Filter Pills */}
      {departments.length > 2 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                deptFilter === d
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-xs'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-navy-800 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Directory Table / Empty State */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-cyan" />
            <p className="text-xs font-semibold">Loading student roster from Supabase...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              {students.length === 0 ? 'No Registered Students in Database' : 'No Students Matching Search'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {students.length === 0
                ? 'When students create accounts and verify their email via the student signup page, their verified profiles, roll numbers, and departments will be recorded here.'
                : 'Try adjusting your search query or department filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student Name & Email</th>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">PRN Code</th>
                  <th className="py-3 px-3">Department & Semester</th>
                  <th className="py-3 px-3">Portal Role</th>
                  <th className="py-3 px-3 text-right">Access Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-cyan">
                      {s.rollNumber || '—'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                      {s.prn || '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.department}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.semester ? `Semester ${s.semester}` : 'Semester 1'} • Div {s.division || 'A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => toggleStudentRole(s.id, s.role)}
                        disabled={updatingId === s.id}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:text-brand-cyan text-[11px] font-bold transition-colors disabled:opacity-50"
                      >
                        {updatingId === s.id ? 'Updating...' : 'Toggle Privileges'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
