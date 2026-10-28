import React, { useState, useEffect } from 'react';
import { UserProfile, COLLEGE_DEPARTMENTS } from '../../types';
import { getStudents } from '../../lib/storageService';
import { ScrollReveal, ScrollStagger } from '../common/ScrollReveal';
import { SkeletonCard } from '../common/SkeletonLoader';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Mail, 
  Hash, 
  ChevronRight, 
  User, 
  RefreshCw, 
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface StudentDirectoryProps {
  onSelectStudent: (student: UserProfile) => void;
  defaultDepartment?: string;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ 
  onSelectStudent,
  defaultDepartment = 'All'
}) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>(defaultDepartment);
  const [selectedSem, setSelectedSem] = useState<string>('All');
  const [selectedDiv, setSelectedDiv] = useState<string>('All');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  const loadStudentRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents({
        department: selectedDept,
        semester: selectedSem,
        division: selectedDiv,
        search,
      });
      setStudents(data);
      setPage(1);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Unable to load student directory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudentRecords();
    }, 250);
    return () => clearTimeout(timeout);
  }, [selectedDept, selectedSem, selectedDiv, search]);

  // Client-side pagination
  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice((page - 1) * pageSize, page * pageSize);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'ST';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <ScrollReveal direction="down" distance={16}>
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  Institutional Directory
                </span>
                <span className="text-xs text-slate-400 font-medium">Real-Time Supabase Roster</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white mt-1">
                Enrolled Student Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Access student profiles, verified PRN numbers, attendance records, and academic evaluations for Government Polytechnic Ahmedabad.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadStudentRecords}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors disabled:opacity-50 cursor-pointer btn-tactile"
                title="Refresh directory from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-right">
                <p className="text-xs font-bold text-navy-900 dark:text-white">
                  {loading ? 'Counting...' : `${students.length} Students`}
                </p>
                <p className="text-[10px] text-slate-400">Active Records</p>
              </div>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
            {/* Search input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, roll, PRN, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="lg:col-span-4">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all truncate"
              >
                <option value="All">All 14 Departments</option>
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all"
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={String(sem)}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Division Filter */}
            <div className="lg:col-span-2">
              <select
                value={selectedDiv}
                onChange={(e) => setSelectedDiv(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 transition-all"
              >
                <option value="All">All Divisions</option>
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadStudentRecords} 
            className="font-bold underline hover:text-rose-900 dark:hover:text-rose-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      )}

      {/* Empty State: No students found */}
      {!loading && !error && students.length === 0 && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-10 border border-slate-200/80 dark:border-navy-800 text-center space-y-4 shadow-sm max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
              {search || selectedDept !== 'All' || selectedSem !== 'All' || selectedDiv !== 'All'
                ? 'No Enrolled Students Match These Filters'
                : 'No Registered Student Records in Database Yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {search || selectedDept !== 'All' || selectedSem !== 'All' || selectedDiv !== 'All'
                ? 'Try resetting the search query or selecting "All 14 Departments" to expand the directory scope.'
                : 'As students complete registration on the Student Academic Portal for Government Polytechnic Ahmedabad, their verified academic profiles will appear here.'}
            </p>
          </div>
          {(search || selectedDept !== 'All' || selectedSem !== 'All' || selectedDiv !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('All');
                setSelectedSem('All');
                setSelectedDiv('All');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Directory Grid of Real Students */}
      {!loading && !error && students.length > 0 && (
        <>
          <ScrollStagger staggerMs={25} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStudents.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectStudent(st)}
                className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 hover:border-brand-cyan/60 hover:shadow-lg dark:hover:border-brand-cyan/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group interactive-card"
              >
                <div>
                  {/* Top: Avatar & Basic Info */}
                  <div className="flex items-start space-x-3">
                    {st.avatar ? (
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-cyan/30 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-navy-900 text-brand-cyan border border-navy-700 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                        {getInitials(st.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-navy-900 dark:text-white truncate group-hover:text-brand-cyan transition-colors">
                          {st.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{st.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Academic Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Department</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px] truncate max-w-[170px]" title={st.department}>
                        {st.department || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Roll / PRN</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200 text-[11px]">
                        {st.rollNumber || 'N/A'} • {st.prn ? String(st.prn).slice(-6) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Class &amp; Division</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25">
                        Sem {st.semester || 1} • {st.division || 'Div A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-brand-cyan font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>View Student Profile &amp; Attendance</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </ScrollStagger>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500 dark:text-slate-400">
              <p>
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, students.length)} of {students.length} students
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
