import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserRole, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Phone, 
  Mail, 
  UserCheck, 
  UserX,
  Filter,
  Check,
  Key,
  Building2,
  Briefcase,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  getAllManageableUsers, 
  updateAnyUserProfile, 
  changeUserRole, 
  sendUserPasswordReset,
  findMohiniMishraAccounts
} from '../../lib/storageService';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { ScrollStagger } from '../common/ScrollReveal';

interface ManageUsersProps {
  onNavigateTab?: (tab: string, filter?: string) => void;
}

export const ManageUsers: React.FC<ManageUsersProps> = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Mohini Mishra Spotlight State
  const [mohiniAccounts, setMohiniAccounts] = useState<UserProfile[]>([]);
  const [isResolvingMohini, setIsResolvingMohini] = useState<boolean>(false);

  // Modal States
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Edit User Form State
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editRollNumber, setEditRollNumber] = useState<string>('');
  const [editPrn, setEditPrn] = useState<string>('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editAcademicYear, setEditAcademicYear] = useState<string>('2025 - 2026');
  const [editDivision, setEditDivision] = useState<string>('A');
  const [editCgpa, setEditCgpa] = useState<string>('8.0');
  const [editMentorName, setEditMentorName] = useState<string>('');
  const [editMentorEmail, setEditMentorEmail] = useState<string>('');
  const [editDesignation, setEditDesignation] = useState<string>('Assistant Professor');
  const [editCabin, setEditCabin] = useState<string>('');
  const [editSpecialization, setEditSpecialization] = useState<string>('');
  const [editConsultationHours, setEditConsultationHours] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Role Change Modal State
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('student');
  const [roleChangeReason, setRoleChangeReason] = useState<string>('');
  const [adminPromotionConfirmed, setAdminPromotionConfirmed] = useState<boolean>(false);
  const [isSavingRole, setIsSavingRole] = useState<boolean>(false);

  // Password Reset In-Flight State
  const [sendingResetForEmail, setSendingResetForEmail] = useState<string | null>(null);

  // Load all users
  const loadUsers = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const allUsers = await getAllManageableUsers({
        role: roleFilter,
        department: deptFilter,
        status: statusFilter,
        search: search
      });
      setUsers(allUsers);

      // Check for Mohini Mishra specifically
      const mohiniMatches = await findMohiniMishraAccounts();
      const needsReview = (mohiniMatches || []).filter(u => u.role !== 'faculty' || u.adminLevel === 'pending_faculty');
      setMohiniAccounts(needsReview);
    } catch (e: any) {
      console.error('Failed to load users:', e);
      setActionNotice({ type: 'error', message: 'Could not fetch user directory: ' + (e?.message || 'Network error') });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, deptFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingUser) setEditingUser(null);
        if (roleModalUser) setRoleModalUser(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editingUser, roleModalUser]);

  // Filtered and paginated lists
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter !== 'All') {
        if (roleFilter === 'pending' && user.adminLevel !== 'pending_faculty') return false;
        if (roleFilter !== 'pending' && user.role !== roleFilter) return false;
      }
      if (deptFilter !== 'All' && user.department !== deptFilter) return false;
      if (statusFilter !== 'All' && user.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = 
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          (user.rollNumber && user.rollNumber.toLowerCase().includes(q)) ||
          (user.prn && user.prn.toLowerCase().includes(q)) ||
          (user.department && user.department.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [users, roleFilter, deptFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const faculty = users.filter(u => u.role === 'faculty').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const pending = users.filter(u => u.adminLevel === 'pending_faculty').length;
    return { total, students, faculty, admins, suspended, pending };
  }, [users]);

  // Open Edit User Modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditAvatar(user.avatar || '');
    setEditDepartment(user.department || COLLEGE_DEPARTMENTS[5]); // Default Computer Engineering
    setEditRollNumber(user.rollNumber || '');
    setEditPrn(user.prn || '');
    setEditSemester(user.semester || 1);
    setEditAcademicYear(user.academicYear || '2025 - 2026');
    setEditDivision(user.division || 'A');
    setEditCgpa(user.cgpa ? String(user.cgpa) : '8.0');
    setEditMentorName(user.mentorName || '');
    setEditMentorEmail(user.mentorEmail || '');
    setEditDesignation(user.designation || 'Assistant Professor');
    setEditCabin(user.cabin || 'Faculty Tower');
    setEditSpecialization(user.specialization ? user.specialization.join(', ') : '');
    setEditConsultationHours(user.consultationHours || 'Mon-Fri 2:00 PM - 4:00 PM');
    setEditStatus(user.status || 'active');
  };

  // Submit Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      setActionNotice({ type: 'error', message: 'Full name cannot be left blank.' });
      return;
    }

    setIsSavingEdit(true);
    try {
      const updates: Partial<UserProfile> = {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        avatar: editAvatar.trim() || undefined,
        department: editDepartment,
        status: editStatus
      };

      if (editingUser.role === 'student' || editingUser.role === 'guest') {
        updates.rollNumber = editRollNumber.trim() || undefined;
        updates.prn = editPrn.trim() || undefined;
        updates.semester = Number(editSemester) || 1;
        updates.academicYear = editAcademicYear.trim() || undefined;
        updates.division = editDivision.trim() || undefined;
        updates.cgpa = Number(editCgpa) || undefined;
        updates.mentorName = editMentorName.trim() || undefined;
        updates.mentorEmail = editMentorEmail.trim() || undefined;
      }

      if (editingUser.role === 'faculty') {
        updates.designation = editDesignation.trim() || undefined;
        updates.cabin = editCabin.trim() || undefined;
        updates.consultationHours = editConsultationHours.trim() || undefined;
        if (editSpecialization.trim()) {
          updates.specialization = editSpecialization.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const updated = await updateAnyUserProfile(
        editingUser.id, 
        updates, 
        currentAdmin?.name || 'Super Administrator'
      );

      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setEditingUser(null);
      setActionNotice({ type: 'success', message: `Profile for ${updated.name} updated successfully.` });
    } catch (err: any) {
      console.error('Failed to update user profile:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to update user profile.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Role Change Modal
  const handleOpenRoleModal = (user: UserProfile) => {
    setRoleModalUser(user);
    setNewSelectedRole(user.role);
    setRoleChangeReason('');
    setAdminPromotionConfirmed(false);
  };

  // Submit Role Change
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;

    if (newSelectedRole === roleModalUser.role) {
      setRoleModalUser(null);
      return;
    }

    if (newSelectedRole === 'admin' && !adminPromotionConfirmed) {
      setActionNotice({ type: 'error', message: 'You must confirm Super Administrator elevation authorization.' });
      return;
    }

    setIsSavingRole(true);
    try {
      const updated = await changeUserRole(
        roleModalUser,
        newSelectedRole,
        roleChangeReason || 'Administrative reclassification',
        {
          id: currentAdmin?.id || 'admin',
          name: currentAdmin?.name || 'Super Administrator',
          email: currentAdmin?.email || 'campusonegpa@gmail.com'
        }
      );

      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setRoleModalUser(null);
      setActionNotice({ 
        type: 'success', 
        message: `Account role for ${updated.name} successfully updated to '${newSelectedRole.toUpperCase()}'.` 
      });

      // Refresh Mohini state if it was her
      if (updated.name.toLowerCase().includes('mohini') || updated.email.toLowerCase().includes('mohini')) {
        setMohiniAccounts(prev => prev.filter(u => u.id !== updated.id));
      }
    } catch (err: any) {
      console.error('Failed to change user role:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to update role.' });
    } finally {
      setIsSavingRole(false);
    }
  };

  // One-click quick resolve for Mohini Mishra
  const handlePromoteMohini = async (mohiniUser: UserProfile) => {
    setIsResolvingMohini(true);
    try {
      const updated = await changeUserRole(
        mohiniUser,
        'faculty',
        'Automatic institutional promotion: Mohini Mishra Assistant Professor account restoration',
        {
          id: currentAdmin?.id || 'admin',
          name: currentAdmin?.name || 'Super Administrator',
          email: currentAdmin?.email || 'campusonegpa@gmail.com'
        }
      );

      // Also ensure designation & cabin are configured
      await updateAnyUserProfile(
        updated.id,
        {
          designation: 'Assistant Professor',
          cabin: 'Faculty Tower, Room 302',
          department: mohiniUser.department || 'Computer Engineering'
        },
        currentAdmin?.name || 'Super Administrator'
      );

      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, role: 'faculty', designation: 'Assistant Professor', adminLevel: undefined } : u));
      setMohiniAccounts(prev => prev.filter(u => u.id !== updated.id));
      setActionNotice({
        type: 'success',
        message: `Mohini Mishra (${mohiniUser.email}) has been successfully restored as Faculty (Assistant Professor). Her password, UUID, and academic history were preserved.`
      });
    } catch (err: any) {
      console.error('Failed to promote Mohini Mishra:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to promote Mohini Mishra.' });
    } finally {
      setIsResolvingMohini(false);
    }
  };

  // Send Password Reset
  const handleSendResetPassword = async (email: string, name: string) => {
    if (!email) {
      setActionNotice({ type: 'error', message: 'No registered email found for this user.' });
      return;
    }

    setSendingResetForEmail(email);
    try {
      const res = await sendUserPasswordReset(email);
      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Official Supabase Auth password recovery email successfully dispatched to ${email} for ${name}.`
        });
      } else {
        setActionNotice({
          type: 'error',
          message: `Failed to dispatch reset email: ${res.error}`
        });
      }
    } catch (e: any) {
      setActionNotice({
        type: 'error',
        message: `Reset email failed: ${e.message || 'Network error'}`
      });
    } finally {
      setSendingResetForEmail(null);
    }
  };

  // Toggle Suspend / Active status
  const handleToggleSuspend = async (user: UserProfile) => {
    const isPrimaryAdmin = user.email.toLowerCase() === 'campusonegpa@gmail.com';
    if (isPrimaryAdmin) {
      setActionNotice({ type: 'error', message: 'The primary institutional Super Administrator cannot be suspended.' });
      return;
    }

    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const updated = await updateAnyUserProfile(
        user.id,
        { status: nextStatus },
        currentAdmin?.name || 'Super Administrator'
      );
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, status: nextStatus } : u));
      setActionNotice({
        type: 'info',
        message: `Account for ${user.name} has been ${nextStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVATED'}.`
      });
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update account status.' });
    }
  };

  const getRoleBadge = (role: UserRole, adminLevel?: string) => {
    if (adminLevel === 'pending_faculty') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>Pending Faculty</span>
        </span>
      );
    }

    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
            <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Administrator</span>
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60">
            <Briefcase className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>Faculty</span>
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60">
            <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Student</span>
          </span>
        );
      case 'guest':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span>Guest</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice / Toast Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-md transition-all animate-fade-in ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : actionNotice.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            {actionNotice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {actionNotice.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {actionNotice.type === 'info' && <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
            <span className="text-sm font-semibold">{actionNotice.message}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mohini Mishra Spotlight Banner (if detected as student or pending) */}
      {mohiniAccounts.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 border-2 border-amber-500/50 dark:border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-navy-950 shadow-md shrink-0">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-navy-950">
                  Account Resolution Required
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-bold">
                  Faculty Account Classification
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white mt-1">
                Mohini Mishra is currently cataloged with role '{mohiniAccounts[0].role}'
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5">
                Registered email <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-navy-900 text-amber-900 dark:text-amber-200 font-mono font-bold text-xs">{mohiniAccounts[0].email}</code> was assigned student default on initial registration. Click below to promote directly to <strong>Faculty (Assistant Professor)</strong> without touching her password or authentication UUID.
              </p>
            </div>
          </div>
          <button
            onClick={() => handlePromoteMohini(mohiniAccounts[0])}
            disabled={isResolvingMohini}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg shrink-0 disabled:opacity-50"
          >
            {isResolvingMohini ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Promoting...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Restore to Faculty Role</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Stats Summary Counter Cards */}
      <ScrollStagger staggerMs={25} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered in CampusOne</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.students}</p>
          <span className="text-[11px] text-blue-500 dark:text-blue-400 mt-1 block">Undergraduate GPA</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Faculty Roster</span>
            <Briefcase className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.faculty}</p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 block">Professors & Lecturers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Super Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.admins}</p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Institutional Control</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.pending}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">Faculty claims</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Suspended</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-navy-950 dark:text-white mt-2">{stats.suspended}</p>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">Restricted logins</span>
        </div>
      </ScrollStagger>

      {/* Control & Filter Toolbar */}
      <div className="bg-white dark:bg-navy-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, email, roll number, or PRN..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => {
              setIsRefreshing(true);
              loadUsers(false);
            }}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center space-x-2 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-navy-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All Roles (Students, Faculty, Admins)</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Members Only</option>
              <option value="admin">Administrators Only</option>
              <option value="pending">Pending Faculty Claims</option>
              <option value="guest">Guest Users</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All 14 Departments</option>
              {COLLEGE_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Account Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All Statuses (Active & Suspended)</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto momentum-scroll">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">User Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Institutional Identifiers</th>
                <th className="py-3.5 px-4">Academic / Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-navy-800 skeleton-shimmer shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="h-3.5 w-32 bg-slate-200 dark:bg-navy-800 rounded skeleton-shimmer" />
                          <div className="h-3 w-44 bg-slate-200 dark:bg-navy-800 rounded skeleton-shimmer" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                    <td className="py-4 px-4"><div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                    <td className="py-4 px-4"><div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-7 w-20 ml-auto rounded-xl bg-slate-200 dark:bg-navy-800 skeleton-shimmer" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-2" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">No matching user accounts found</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your search term or resetting the role/department filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isPrimaryAdmin = user.email.toLowerCase() === 'campusonegpa@gmail.com';
                  const isSelf = user.id === currentAdmin?.id;
                  const isSuspended = user.status === 'suspended';

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-navy-800/50 transition-colors ${
                        isSuspended ? 'opacity-65 bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <UserAvatar 
                            name={user.name} 
                            src={user.avatar} 
                            role={user.role} 
                            size="md" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-navy-950 dark:text-white truncate max-w-[160px] sm:max-w-[220px]">
                                {user.name}
                              </span>
                              {isPrimaryAdmin && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                                  PRIMARY
                                </span>
                              )}
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block truncate max-w-[220px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getRoleBadge(user.role, user.adminLevel)}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                          {user.department || 'General Administration'}
                        </span>
                      </td>

                      {/* Identifiers */}
                      <td className="py-3.5 px-4">
                        {user.role === 'student' ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-slate-800 dark:text-slate-200">
                              Roll: <strong className="font-semibold">{user.rollNumber || '—'}</strong>
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              PRN: {user.prn || '—'}
                            </div>
                          </div>
                        ) : user.role === 'faculty' ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {user.designation || 'Faculty Member'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Cabin: {user.cabin || 'Main Campus'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                            {user.adminLevel || 'Super Administrator'}
                          </div>
                        )}
                      </td>

                      {/* Academic / Status Details */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {user.role === 'student' && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-300">
                              Sem {user.semester || 1} • Div {user.division || 'A'} • CGPA {user.cgpa || '—'}
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                            }`} />
                            <span className={`text-[11px] font-bold ${
                              isSuspended ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                            {user.createdAt && (
                              <span className="text-[10px] text-slate-400 ml-1">
                                • {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Change Role */}
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 transition-colors"
                            title="Change Account Role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Password Reset */}
                          <button
                            onClick={() => handleSendResetPassword(user.email, user.name)}
                            disabled={sendingResetForEmail === user.email}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors disabled:opacity-50"
                            title="Dispatch Supabase Password Reset Email"
                          >
                            <Key className={`w-3.5 h-3.5 ${sendingResetForEmail === user.email ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Suspend / Activate Toggle */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => handleToggleSuspend(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSuspended
                                  ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              }`}
                              title={isSuspended ? 'Activate Account' : 'Suspend Account'}
                            >
                              {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>of {filteredUsers.length} accounts</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-navy-950 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT USER DETAILS */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-navy-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-navy-950 dark:text-white">
                    Edit Account Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modifying {editingUser.name} (<span className="font-mono text-teal-500">{editingUser.email}</span>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  <span>Personal & Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Supabase Auth Login)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={editingUser.email}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950/40 text-xs sm:text-sm text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                  >
                    {COLLEGE_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Academic Fields */}
              {(editingUser.role === 'student' || editingUser.role === 'guest') && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    <span>Student Academic Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={editRollNumber}
                        onChange={(e) => setEditRollNumber(e.target.value)}
                        placeholder="e.g. 210020107001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        PRN (Enrollment Number)
                      </label>
                      <input
                        type="text"
                        value={editPrn}
                        onChange={(e) => setEditPrn(e.target.value)}
                        placeholder="14-digit number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Semester
                      </label>
                      <select
                        value={editSemester}
                        onChange={(e) => setEditSemester(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Division
                      </label>
                      <input
                        type="text"
                        value={editDivision}
                        onChange={(e) => setEditDivision(e.target.value)}
                        placeholder="A / B"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={editCgpa}
                        onChange={(e) => setEditCgpa(e.target.value)}
                        placeholder="8.50"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mentor Name
                      </label>
                      <input
                        type="text"
                        value={editMentorName}
                        onChange={(e) => setEditMentorName(e.target.value)}
                        placeholder="Faculty Mentor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Fields */}
              {editingUser.role === 'faculty' && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-teal-500" />
                    <span>Faculty Appointment & Cabin Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        placeholder="e.g. Assistant Professor, HOD"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cabin / Office
                      </label>
                      <input
                        type="text"
                        value={editCabin}
                        onChange={(e) => setEditCabin(e.target.value)}
                        placeholder="e.g. Faculty Block A, Room 304"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Specializations (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editSpecialization}
                      onChange={(e) => setEditSpecialization(e.target.value)}
                      placeholder="Data Structures, Machine Learning, Cloud Computing"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Consultation Hours
                    </label>
                    <input
                      type="text"
                      value={editConsultationHours}
                      onChange={(e) => setEditConsultationHours(e.target.value)}
                      placeholder="Mon-Fri 2:00 PM - 4:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Account Status Control */}
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Account Access Status
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Suspended accounts are locked from authentication across CampusOne.
                  </span>
                </div>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                  disabled={editingUser.email.toLowerCase() === 'campusonegpa@gmail.com'}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-bold text-navy-950 dark:text-white"
                >
                  <option value="active">Active (Permitted)</option>
                  <option value="suspended">Suspended (Locked)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHANGE USER ROLE (WITH 2-STEP CONFIRMATION & SAFEGUARDS) */}
      {/* ========================================================================= */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-navy-950 dark:text-white">
                    Reassign Account Role
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {roleModalUser.name} (<span className="font-mono text-purple-500">{roleModalUser.email}</span>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-4">
              {/* Safeguard: Primary Admin Protection */}
              {roleModalUser.email.toLowerCase() === 'campusonegpa@gmail.com' ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center space-x-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Protected Primary Institutional Administrator</span>
                  </div>
                  <p className="opacity-90">
                    The primary Super Admin account (<code className="font-mono font-bold">campusonegpa@gmail.com</code>) cannot be demoted or removed to protect institutional continuity.
                  </p>
                </div>
              ) : roleModalUser.id === currentAdmin?.id ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Lockout Safeguard: Self-Demotion Blocked</span>
                  </div>
                  <p className="opacity-90">
                    You are logged in with this account. You cannot remove your own administrator status to prevent accidental lockout.
                  </p>
                </div>
              ) : null}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Institutional Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['student', 'faculty', 'admin', 'guest'] as UserRole[]).map((r) => {
                    const isCurrent = roleModalUser.role === r;
                    const isSelected = newSelectedRole === r;

                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setNewSelectedRole(r)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/30'
                            : 'border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold capitalize text-xs">{r}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] opacity-75 mt-1">
                          {r === 'admin' ? 'Super Admin Privileges' : r === 'faculty' ? 'Teacher / Staff' : r === 'student' ? 'Undergraduate Student' : 'Limited Guest'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 Warning when promoting to Admin */}
              {newSelectedRole === 'admin' && roleModalUser.role !== 'admin' && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs space-y-2.5">
                  <div className="flex items-center space-x-2 font-bold text-rose-700 dark:text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Elevation to Institutional Administrator</span>
                  </div>
                  <p className="leading-relaxed opacity-90">
                    Super Administrators possess full institutional authority: managing all 14 departments, reassigning user roles, viewing database telemetry, and accessing college grievance reports.
                  </p>
                  <label className="flex items-start space-x-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminPromotionConfirmed}
                      onChange={(e) => setAdminPromotionConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-rose-400 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-extrabold text-[11px] text-rose-950 dark:text-rose-100">
                      I understand the permissions granted and confirm promoting this user to Super Administrator.
                    </span>
                  </label>
                </div>
              )}

              {/* Reason for Audit Log */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Role Change (Institutional Audit Log) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  placeholder="e.g. Faculty appointment confirmation, administrative reclassification..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSavingRole ||
                    (newSelectedRole === 'admin' && roleModalUser.role !== 'admin' && !adminPromotionConfirmed) ||
                    (roleModalUser.email.toLowerCase() === 'campusonegpa@gmail.com' && newSelectedRole !== 'admin') ||
                    (roleModalUser.id === currentAdmin?.id && newSelectedRole !== 'admin')
                  }
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md disabled:opacity-40"
                >
                  {isSavingRole ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reclassifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirm Role Change</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
