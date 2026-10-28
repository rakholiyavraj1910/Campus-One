import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  Calendar,
  Sparkles,
  Edit3,
  Check,
  X,
  Camera,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Clock,
  MapPin,
  Lock,
  Layers,
  KeyRound,
  FileText,
  Users,
  QrCode,
  ShieldAlert,
  Database,
  ExternalLink
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ImageCropModal } from '../common/ImageCropModal';
import { CampusOneIcon } from '../common/CampusOneLogo';
import { 
  uploadProfileAvatar, 
  removeProfileAvatar, 
  updateAdminPersonalProfile 
} from '../../lib/storageService';
import { COLLEGE_DEPARTMENTS } from '../../types';
import confetti from 'canvas-confetti';

export const ADMIN_DEPARTMENTS = [
  'Administrative Directorate',
  'Office of the Principal',
  'Academic Registrar',
  'Controller of Examinations',
  'Campus Security & Infrastructure',
  'Student Affairs & Welfare',
  'Information Technology & Networks',
  ...COLLEGE_DEPARTMENTS
];

export const ADMIN_DESIGNATIONS = [
  'Super Administrator',
  'Institutional Director / Principal',
  'Campus Registrar',
  'Controller of Examinations',
  'Head of Institutional Administration',
  'System & Security Administrator',
  'Departmental Administrator'
];

interface AdminProfilePageProps {
  onNavigateSection?: (section: any) => void;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({
  onNavigateSection
}) => {
  const { user, refreshProfile, updateLocalUserProfile } = useAuth();
  const { addNotification } = useNotifications();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState<string>(user.name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [department, setDepartment] = useState<string>(user.department || ADMIN_DEPARTMENTS[0]);
  const [designation, setDesignation] = useState<string>(user.designation || 'Super Administrator');

  // Photo Crop Modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [isAvatarUpdating, setIsAvatarUpdating] = useState<boolean>(false);

  // Sync state if user prop changes
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setDepartment(user.department || ADMIN_DEPARTMENTS[0]);
    setDesignation(user.designation || 'Super Administrator');
  }, [user]);

  // Dirty check: are there unsaved modifications?
  const isDirty = 
    name.trim() !== (user.name || '').trim() || 
    phone.trim() !== (user.phone || '').trim() ||
    department !== (user.department || ADMIN_DEPARTMENTS[0]) ||
    designation.trim() !== (user.designation || 'Super Administrator').trim();

  // Warn before browser unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, isDirty]);

  // Profile completion calculation based only on legitimate administrative fields
  const calculateAdminCompletion = () => {
    const fields = [
      { key: 'name', value: user.name, weight: 25 },
      { key: 'email', value: user.email, weight: 25 },
      { key: 'department', value: user.department, weight: 20 },
      { key: 'phone', value: user.phone, weight: 15 },
      { key: 'avatar', value: user.avatar, weight: 15 },
    ];

    const completed = fields.reduce((acc, f) => acc + (f.value ? f.weight : 0), 0);
    return Math.min(100, completed);
  };

  const completionPercent = calculateAdminCompletion();

  // Save changes to Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name is required (at least 2 characters).');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateAdminPersonalProfile(user.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
      });

      updateLocalUserProfile(updated);
      await refreshProfile();

      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage('Administrator profile credentials updated successfully.');

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });

      addNotification(
        'Admin Profile Updated',
        'Your administrator profile has been updated and persisted to Supabase.',
        'alert'
      );
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to update admin profile.');
    }
  };

  // Avatar Crop / Upload
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropModalOpen(false);
    setIsAvatarUpdating(true);
    setErrorMessage(null);

    try {
      const result = await uploadProfileAvatar(user.id, croppedBlob);
      updateLocalUserProfile({ avatar: result.publicUrl });
      await refreshProfile();
      setIsAvatarUpdating(false);

      addNotification('Avatar Updated', 'New administrative profile photo saved.', 'alert');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (err: any) {
      setIsAvatarUpdating(false);
      setErrorMessage(err.message || 'Failed to upload administrator photo.');
    }
  };

  // Avatar Removal
  const handleRemoveAvatar = async () => {
    if (!user.avatar) return;
    setIsAvatarUpdating(true);
    setErrorMessage(null);

    try {
      await removeProfileAvatar(user.id);
      updateLocalUserProfile({ avatar: undefined });
      await refreshProfile();
      setIsAvatarUpdating(false);
      addNotification('Avatar Removed', 'Profile photo cleared.', 'alert');
    } catch (err: any) {
      setIsAvatarUpdating(false);
      setErrorMessage(err.message || 'Failed to remove avatar.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1120] via-[#0d1b30] to-[#122844] text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <UserAvatar
                src={user.avatar}
                name={user.name || 'Super Administrator'}
                role="admin"
                size="xl"
                className="border-2 border-teal-500/50 shadow-xl"
              />

              {isAvatarUpdating ? (
                <div className="absolute inset-0 bg-navy-950/80 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                  <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-navy-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="p-1.5 bg-teal-500 hover:bg-teal-400 text-navy-950 rounded-lg shadow-sm transition-all"
                    title="Upload & Crop Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg shadow-sm transition-all"
                      title="Remove Avatar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Admin Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {user.adminLevel || 'Super Administrator'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Institutional Clearance</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  Administrator Identity
                </span>
                <span className="text-xs text-slate-400">Government Polytechnic Ahmedabad</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.name || 'Super Administrator'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {user.designation || 'Institutional Super Administrator'} • <span className="text-teal-300 font-semibold">{user.department || 'Administrative Directorate'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-slate-200">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-200">{user.phone}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-slate-200">Role: ADMIN</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0 flex items-center space-x-3 w-full md:w-auto justify-end">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Admin Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name || '');
                  setPhone(user.phone || '');
                  setDepartment(user.department || ADMIN_DEPARTMENTS[0]);
                  setDesignation(user.designation || 'Super Administrator');
                  setErrorMessage(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Admin Profile Completion & Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile Completion */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Admin Profile Completion</span>
            <span className="font-mono text-teal-600 dark:text-teal-400">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculated across verified administrative parameters (Name, Email, Directorate, Phone, Identity Photo).
          </p>
        </div>

        {/* Security Clearance */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <KeyRound className="w-4 h-4" />
            <span>Governance Authority</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            {user.adminLevel || 'Super Administrator'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Full authority over user reclassification, faculty approvals, and institutional notices.
          </p>
        </div>

        {/* Database Integrity */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Account Security</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            RLS &amp; Trigger Protected
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Primary admin account protected against accidental demotion and unauthorized role tampering.
          </p>
        </div>
      </div>

      {/* 3. Main Content Split: Profile Details vs Official Admin ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Admin Details / Editor (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Modify Administrator Credentials' : 'Administrative Identity & Parameters'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official institutional profile linked to Government Polytechnic Ahmedabad.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
              Role: ADMIN
            </span>
          </div>

          {!isEditing ? (
            /* Read-Only Administrative Profile View */
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Administrator Full Name</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name || 'Super Administrator'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Institutional Email Address</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Administrative Department / Office</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{user.department || 'Administrative Directorate'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Official Designation</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{user.designation || 'Super Administrator'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Contact Phone Number</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{user.phone || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-1">
                  <p className="text-slate-400 font-medium">Clearance Level</p>
                  <p className="font-bold text-teal-600 dark:text-teal-400 text-sm flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{user.adminLevel || 'Super Administrator'} (Level 1)</span>
                  </p>
                </div>
              </div>

              {/* Administrative Responsibilities List */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-teal-500" />
                  <span>Authorized Administrative Responsibilities</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>User &amp; Role Management with Demotion Guards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Review &amp; Approve Faculty Registration Requests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Publish Official College Circulars &amp; Notices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Monitor Real-Time Database Security Audit Logs</span>
                  </div>
                </div>
              </div>

              {/* Notice regarding student fields */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-700 dark:text-teal-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
                <div className="space-y-0.5">
                  <p className="font-bold">Role-Segregated Profile Architecture</p>
                  <p className="leading-relaxed">
                    This account is provisioned as an institutional administrator. Student-specific fields (such as roll numbers, PRNs, semesters, divisions, CGPA, and faculty mentors) are strictly omitted from this identity ledger in compliance with CampusOne role integrity protocols.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Admin Profile Form */
            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Hitesh Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                {/* Email Address (Read-Only) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Institutional Email Address</span>
                    <span className="text-[10px] text-amber-500 font-semibold">Protected Auth Field</span>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Directorate / Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/30"
                  >
                    {ADMIN_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Official Administrative Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/30"
                  >
                    {ADMIN_DESIGNATIONS.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Level (Read-Only) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Admin Clearance Level</span>
                    <span className="text-[10px] text-amber-500 font-semibold">Immutable Policy</span>
                  </label>
                  <input
                    type="text"
                    value={user.adminLevel || 'Super Administrator'}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 text-teal-600 dark:text-teal-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit / Cancel Bar */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name || '');
                    setPhone(user.phone || '');
                    setDepartment(user.department || ADMIN_DEPARTMENTS[0]);
                    setDesignation(user.designation || 'Super Administrator');
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Commit Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Administrator Official Identity Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#101e36] to-[#0c1a2d] border-2 border-teal-500/40 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CampusOneIcon size={20} withBadge />
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-300">
                  CampusOne Admin Clearance
                </span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                OFFICIAL
              </span>
            </div>

            {/* Photo & Identity Center */}
            <div className="text-center space-y-2 py-2">
              <UserAvatar
                src={user.avatar}
                name={user.name || 'Super Administrator'}
                role="admin"
                size="xl"
                className="mx-auto border-2 border-teal-400 shadow-xl"
              />
              <h4 className="font-extrabold text-base text-white tracking-tight pt-1">
                {user.name || 'Super Administrator'}
              </h4>
              <p className="text-xs text-teal-300 font-semibold">
                {user.designation || 'Institutional Super Administrator'}
              </p>
              <p className="text-[11px] text-slate-400">
                {user.department || 'Administrative Directorate'}
              </p>
            </div>

            {/* Badge Metadata */}
            <div className="space-y-2 text-[11px] font-mono bg-navy-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Authority:</span>
                <span className="text-slate-200">GP Ahmedabad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clearance:</span>
                <span className="text-amber-400 font-bold">{user.adminLevel || 'Super Administrator'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Role:</span>
                <span className="text-teal-400 font-bold">ADMIN (security definer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin ID:</span>
                <span className="text-slate-300 truncate max-w-[130px]" title={user.id}>{user.id}</span>
              </div>
            </div>

            {/* Official Security Seal / Footer */}
            <div className="text-center pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium">
                Government Polytechnic Ahmedabad • CampusOne
              </p>
              <p className="text-[9px] text-teal-400/80 mt-0.5 font-mono">
                Verified Cryptographic Identity Ledger
              </p>
            </div>
          </div>

          {/* Quick Shortcuts to Admin Tools */}
          {onNavigateSection && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Administrative Shortcuts
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onNavigateSection('users')}
                  className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-teal-500" />
                    <span>User &amp; Role Management</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSection('roles')}
                  className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Role Governance &amp; Safeguards</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSection('audit')}
                  className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Security Audit Logs</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Image Crop Modal */}
      {isCropModalOpen && (
        <ImageCropModal
          isOpen={true}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          currentAvatarUrl={user.avatar}
          onRemovePhoto={handleRemoveAvatar}
          title="Crop Administrator Profile Avatar"
        />
      )}
    </div>
  );
};
