import React, { useState, useEffect } from 'react';
import { UserProfile, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Hash, 
  Award, 
  Phone, 
  Mail, 
  UserCheck, 
  UserX,
  Filter,
  Check
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  getStudents, 
  updateStudentProfile, 
  updateUserStatus 
} from '../../lib/storageService';
import { ConfirmationModal } from './ConfirmationModal';
import { UserAvatar } from '../common/UserAvatar';

interface ManageStudentsProps {
  initialDepartmentFilter?: string;
}

export const ManageStudents: React.FC<ManageStudentsProps> = ({
  initialDepartmentFilter = 'All'
}) => {
  const { addNotification } = useNotifications();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>(initialDepartmentFilter);
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'rollNumber' | 'semester'>('name');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Detail Drawer & Edit Modal State
  const [viewingStudent, setViewingStudent] = useState<UserProfile | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [suspendingStudent, setSuspendingStudent] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit form states
  const [editName, setEditName] = useState<string>('');
  const [editDept, setEditDept] = useState<string>('');
  const [editRoll, setEditRoll] = useState<string>('');
  const [editPrn, setEditPrn] = useState<string>('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editDivision, setEditDivision] = useState<string>('A');
  const [editCgpa, setEditCgpa] = useState<number>(8.0);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAcademicYear, setEditAcademicYear] = useState<string>('2025 - 2026');
  const [editMentorName, setEditMentorName] = useState<string>('');
  const [editMentorEmail, setEditMentorEmail] = useState<string>('');

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

  const openEditModal = (student: UserProfile) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditDept(student.department || COLLEGE_DEPARTMENTS[0]);
    setEditRoll(student.rollNumber || '');
    setEditPrn(student.prn || '');
    setEditSemester(student.semester || 1);
    setEditDivision(student.division || 'A');
    setEditCgpa(student.cgpa || 8.0);
    setEditPhone(student.phone || '');
    setEditAcademicYear(student.academicYear || '2025 - 2026');
    setEditMentorName(student.mentorName || '');
    setEditMentorEmail(student.mentorEmail || '');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSubmitting(true);
    try {
      const updated = await updateStudentProfile({
        id: editingStudent.id,
        name: editName.trim(),
        department: editDept,
        rollNumber: editRoll.trim(),
        prn: editPrn.trim(),
        semester: editSemester,
        division: editDivision.trim(),
        cgpa: editCgpa,
        phone: editPhone.trim(),
        academicYear: editAcademicYear.trim() || undefined,
        mentorName: editMentorName.trim() || undefined,
        mentorEmail: editMentorEmail.trim() || undefined,
      });

      if (updated) {
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (viewingStudent?.id === updated.id) setViewingStudent(updated);
        addNotification('Student Profile Updated', `Records saved for ${updated.name}.`, 'notice');
        setEditingStudent(null);
      }
    } catch (err: any) {
      addNotification('Update Failed', err.message || 'Could not update profile.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!suspendingStudent) return;
    setIsSubmitting(true);

    const isCurrentlySuspended = suspendingStudent.adminLevel === 'suspended';
    const nextStatus = isCurrentlySuspended ? 'active' : 'suspended';

    try {
      await updateUserStatus(suspendingStudent.id, nextStatus);
      setStudents(prev => prev.map(s => 
        s.id === suspendingStudent.id ? { ...s, adminLevel: nextStatus === 'suspended' ? 'suspended' : undefined } : s
      ));
      addNotification(
        'Access Updated', 
        `Student account ${suspendingStudent.name} is now ${nextStatus.toUpperCase()}.`, 
        'notice'
      );
      setSuspendingStudent(null);
    } catch (err: any) {
      addNotification('Action Failed', err.message || 'Could not change account status.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort
  const filtered = students.filter(s => {
    if (deptFilter !== 'All' && s.department !== deptFilter) return false;
    if (semesterFilter !== 'All' && s.semester !== Number(semesterFilter)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.prn && s.prn.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rollNumber') return (a.rollNumber || '').localeCompare(b.rollNumber || '');
    if (sortBy === 'semester') return (a.semester || 0) - (b.semester || 0);
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Student Enrollment Directory &amp; Academic Records
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {students.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified student profiles for Government Polytechnic Ahmedabad in PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={fetchStudents}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-navy-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search student name, roll number, PRN, email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {COLLEGE_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="rollNumber">Sort: Roll Number</option>
            <option value="semester">Sort: Semester</option>
          </select>
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto momentum-scroll">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Roll &amp; PRN</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Sem &amp; Div</th>
                <th className="py-3 px-3">CGPA</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400 animate-pulse">
                    Loading student records from PostgreSQL...
                  </td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => {
                  const isSuspended = student.adminLevel === 'suspended';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            src={student.avatar}
                            name={student.name}
                            role="student"
                            size="sm"
                            ring={false}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-700 dark:text-slate-200">
                          {student.rollNumber || '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          PRN: {student.prn || 'Pending'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {student.department || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                          Sem {student.semester || 1} • Div {student.division || 'A'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {student.cgpa !== undefined ? (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(student.cgpa).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/25">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                            title="View student dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                            title="Edit academic record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuspendingStudent(student)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSuspended
                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                            title={isSuspended ? 'Restore account access' : 'Suspend account access'}
                          >
                            {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-2" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No student profiles found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or department filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} students
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal / Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up">
            <button
              type="button"
              onClick={() => setViewingStudent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <UserAvatar
                src={viewingStudent.avatar}
                name={viewingStudent.name}
                role="student"
                size="lg"
                ring
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {viewingStudent.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{viewingStudent.email}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingStudent.department || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingStudent.rollNumber || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PRN Identifier:</span>
                <span className="font-mono font-bold text-brand-cyan">{viewingStudent.prn || 'Pending'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Semester &amp; Division:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Sem {viewingStudent.semester || 1} • Div {viewingStudent.division || 'A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CGPA:</span>
                <span className="font-mono font-extrabold text-emerald-500">{viewingStudent.cgpa !== undefined ? Number(viewingStudent.cgpa).toFixed(2) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone Contact:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{viewingStudent.phone || 'None registered'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Authorization:</span>
                <span className="font-bold text-emerald-500 uppercase">{viewingStudent.adminLevel === 'suspended' ? 'Suspended' : 'Verified Student'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-5">
              <button
                type="button"
                onClick={() => { setViewingStudent(null); openEditModal(viewingStudent); }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs cursor-pointer btn-tactile"
              >
                Edit Student Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingStudent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Edit Student Academic Record
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{editingStudent.email}</p>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Department
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold"
                >
                  {COLLEGE_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoll}
                    onChange={(e) => setEditRoll(e.target.value)}
                    placeholder="e.g. 21CS104"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PRN Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={editPrn}
                    onChange={(e) => setEditPrn(e.target.value)}
                    placeholder="e.g. 20251029001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                      <option key={sem} value={sem}>Sem {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Division
                  </label>
                  <input
                    type="text"
                    required
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CGPA Score
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    placeholder="2025 - 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mentor Name
                  </label>
                  <input
                    type="text"
                    value={editMentorName}
                    onChange={(e) => setEditMentorName(e.target.value)}
                    placeholder="Dr. Radhika Sen"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mentor Email
                  </label>
                  <input
                    type="email"
                    value={editMentorEmail}
                    onChange={(e) => setEditMentorEmail(e.target.value)}
                    placeholder="mentor@campusone.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-navy-950 cursor-pointer disabled:opacity-50 btn-tactile"
                >
                  {isSubmitting ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Suspend/Activate */}
      <ConfirmationModal
        isOpen={Boolean(suspendingStudent)}
        title={suspendingStudent?.adminLevel === 'suspended' ? 'Restore Student Access' : 'Suspend Student Account'}
        message={
          suspendingStudent?.adminLevel === 'suspended'
            ? `Are you sure you want to restore portal login and academic services for ${suspendingStudent?.name}?`
            : `Are you sure you want to suspend portal access for ${suspendingStudent?.name}? The student will not be able to log in or download hall tickets.`
        }
        confirmLabel={suspendingStudent?.adminLevel === 'suspended' ? 'Restore Account' : 'Suspend Access'}
        variant={suspendingStudent?.adminLevel === 'suspended' ? 'info' : 'danger'}
        isLoading={isSubmitting}
        onConfirm={handleToggleStatus}
        onCancel={() => setSuspendingStudent(null)}
      />

    </div>
  );
};
