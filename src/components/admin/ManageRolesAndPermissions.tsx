import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  KeyRound, 
  Users, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  FileCheck2,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { 
  getAllManageableUsers, 
  changeUserRole, 
  findMohiniMishraAccounts,
  updateAnyUserProfile
} from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

interface ManageRolesAndPermissionsProps {
  onNavigateTab?: (section: string) => void;
}

export const ManageRolesAndPermissions: React.FC<ManageRolesAndPermissionsProps> = ({
  onNavigateTab = () => {}
}) => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [mohiniAccounts, setMohiniAccounts] = useState<UserProfile[]>([]);
  const [isPromotingMohini, setIsPromotingMohini] = useState<boolean>(false);
  
  // Role assignment modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('student');
  const [changeReason, setChangeReason] = useState<string>('');
  const [confirmAdminElevation, setConfirmAdminElevation] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await getAllManageableUsers();
      setUsers(all);

      const mohini = await findMohiniMishraAccounts();
      const needsPromotion = (mohini || []).filter(u => u.role !== 'faculty' || u.adminLevel === 'pending_faculty');
      setMohiniAccounts(needsPromotion);
    } catch (e: any) {
      console.error('Failed to load roles directory:', e);
      setNotice({ type: 'error', message: 'Could not load users for role governance: ' + (e?.message || 'Error') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats
  const adminCount = users.filter(u => u.role === 'admin').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const guestCount = users.filter(u => u.role === 'guest').length;
  const pendingCount = users.filter(u => u.adminLevel === 'pending_faculty').length;

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
           (u.prn && u.prn.toLowerCase().includes(q));
  }).slice(0, 25);

  const handleOpenRoleModal = (user: UserProfile) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setChangeReason('');
    setConfirmAdminElevation(false);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (targetRole === 'admin' && !confirmAdminElevation) {
      setNotice({ type: 'error', message: 'You must confirm Super Administrator elevation authorization.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await changeUserRole(
        selectedUser,
        targetRole,
        changeReason || 'Administrative reclassification',
        {
          id: currentAdmin?.id || 'admin',
          name: currentAdmin?.name || 'Super Administrator',
          email: currentAdmin?.email || 'campusonegpa@gmail.com'
        }
      );

      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setSelectedUser(null);
      setNotice({
        type: 'success',
        message: `Account role for ${updated.name} successfully reassigned to ${targetRole.toUpperCase()}.`
      });

      if (updated.email.toLowerCase().includes('mohini') || updated.name.toLowerCase().includes('mohini')) {
        setMohiniAccounts(prev => prev.filter(u => u.id !== updated.id));
      }
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to update role.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPromoteMohini = async (u: UserProfile) => {
    setIsPromotingMohini(true);
    try {
      const updated = await changeUserRole(
        u,
        'faculty',
        'Automatic institutional promotion: Mohini Mishra Assistant Professor account restoration',
        {
          id: currentAdmin?.id || 'admin',
          name: currentAdmin?.name || 'Super Administrator',
          email: currentAdmin?.email || 'campusonegpa@gmail.com'
        }
      );

      await updateAnyUserProfile(
        updated.id,
        {
          designation: 'Assistant Professor',
          cabin: 'Faculty Tower, Room 302',
          department: u.department || 'Computer Engineering'
        },
        currentAdmin?.name || 'Super Administrator'
      );

      setUsers(prev => prev.map(x => x.id === updated.id ? { ...x, role: 'faculty', designation: 'Assistant Professor' } : x));
      setMohiniAccounts(prev => prev.filter(x => x.id !== updated.id));
      setNotice({
        type: 'success',
        message: `Mohini Mishra (${u.email}) restored to Faculty (Assistant Professor). Existing UUID and login credentials preserved.`
      });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to promote Mohini Mishra.' });
    } finally {
      setIsPromotingMohini(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {notice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* Mohini Mishra Spotlight */}
      {mohiniAccounts.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Action Required
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
                Faculty Member Mohini Mishra is cataloged with role '{mohiniAccounts[0].role}'
              </h3>
              <p className="text-xs text-slate-400 max-w-xl mt-0.5">
                The account <code className="text-amber-300 font-mono text-xs">{mohiniAccounts[0].email}</code> can be promoted directly to <strong>Faculty (Assistant Professor)</strong> without modifying passwords or generating duplicate entries.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleQuickPromoteMohini(mohiniAccounts[0])}
            disabled={isPromotingMohini}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isPromotingMohini ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Promoting...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Restore to Faculty</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Role Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Super Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{adminCount}</p>
          <span className="text-[10px] text-purple-400 font-medium mt-0.5 block">Full institutional governance</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty Roster</span>
            <Briefcase className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{facultyCount}</p>
          <span className="text-[10px] text-teal-400 font-medium mt-0.5 block">Instructional professors</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Undergraduates</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{studentCount}</p>
          <span className="text-[10px] text-blue-400 font-medium mt-0.5 block">Active student profiles</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{pendingCount}</p>
          <span className="text-[10px] text-amber-400 font-medium mt-0.5 block">Faculty approvals</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guest Accounts</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{guestCount}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Public access roles</span>
        </div>
      </div>

      {/* Security Policies Architecture Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Database Row Level Security &amp; Authorization Guardrails
            </h3>
            <p className="text-xs text-slate-400">
              Active PostgreSQL protections enforced on <code className="text-teal-400">public.profiles</code> in project <code className="text-teal-400">bbtjbazbeyedxjfgnfcm</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Primary Admin Protection</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Account <code className="text-slate-300 font-mono">campusonegpa@gmail.com</code> is hard-guarded by trigger <code className="text-slate-300 font-mono">prevent_role_escalation()</code>. It cannot be demoted or stripped of administrative permissions under any circumstance.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Self-Demotion Lockout Guard</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Trigger rule <code className="text-slate-300 font-mono">auth.uid() = OLD.id</code> blocks administrators from accidentally or intentionally demoting their own logged-in session, safeguarding institutional continuity.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090d16] border border-slate-800/80 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Immutable Identity Anchors</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Profile UUID (<code className="text-slate-300 font-mono">id</code>) and registered <code className="text-slate-300 font-mono">email</code> cannot be modified through frontend or user updates, preventing account-takeover exploits.
            </p>
          </div>
        </div>
      </div>

      {/* Role Reassignment Console */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Institutional Role Assignment Console
            </h3>
            <p className="text-xs text-slate-400">
              Select an account to adjust clearance levels with audit logging
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user to reclassify..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* User Role Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1220] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Clearance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#090d16]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-400" />
                    <span>Loading role directory...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching accounts found for query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPrimaryAdmin = u.email.toLowerCase() === 'campusonegpa@gmail.com';
                  const isSelf = u.id === currentAdmin?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <UserAvatar name={u.name} src={u.avatar} role={u.role} size="sm" />
                          <div>
                            <span className="font-extrabold text-white block">{u.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'faculty'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : u.role === 'student'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {u.department || 'General Administration'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {u.adminLevel || (u.role === 'admin' ? 'Super Administrator' : 'Standard')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          disabled={isPrimaryAdmin || (isSelf && u.role === 'admin')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all"
                        >
                          {isPrimaryAdmin ? 'Protected' : 'Reassign'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Reclassify Account Role
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px]">
                  {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select New Clearance Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['student', 'faculty', 'admin', 'guest'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setTargetRole(r)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        targetRole === r
                          ? 'border-teal-500 bg-teal-500/10 text-teal-200 ring-2 ring-teal-500/30'
                          : 'border-slate-800 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <span className="font-extrabold capitalize text-xs block">{r}</span>
                      <span className="text-[10px] text-slate-500">
                        {r === 'admin' ? 'Super Admin' : r === 'faculty' ? 'Teacher/Staff' : r === 'student' ? 'Undergraduate' : 'Guest'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Step Confirmation for Admin Role */}
              {targetRole === 'admin' && selectedUser.role !== 'admin' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-rose-200">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Security Warning: Super Admin Elevation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-300/90">
                    This user will receive full institutional authority across all 14 departments, user role management, and database telemetry.
                  </p>
                  <label className="flex items-start space-x-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmAdminElevation}
                      onChange={(e) => setConfirmAdminElevation(e.target.checked)}
                      className="mt-0.5 rounded border-rose-400 text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-bold text-rose-100">
                      I understand and confirm promoting this account to Super Administrator.
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Reason for Role Change (Audit Log) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Faculty appointment confirmation, reclassification..."
                  className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (targetRole === 'admin' && selectedUser.role !== 'admin' && !confirmAdminElevation)
                  }
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-navy-950 text-xs font-black uppercase tracking-wider transition-all"
                >
                  {isSubmitting ? 'Updating...' : 'Confirm Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
