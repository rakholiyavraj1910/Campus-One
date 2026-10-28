import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  QrCode,
  Edit3,
  Check,
  X,
  Camera,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ImageCropModal } from '../common/ImageCropModal';
import { 
  uploadProfileAvatar, 
  removeProfileAvatar, 
  updateStudentPersonalProfile 
} from '../../lib/storageService';
import { COLLEGE_DEPARTMENTS } from '../../types';
import confetti from 'canvas-confetti';

const ACADEMIC_YEARS = [
  '2026 - 2027',
  '2025 - 2026',
  '2024 - 2025',
  '2023 - 2024',
  '2022 - 2023'
];

const DIVISIONS = ['Div A', 'Div B', 'Div C', 'Div D', 'Div E'];

export const ProfileCard: React.FC = () => {
  const { user, refreshProfile, updateLocalUserProfile } = useAuth();
  const { addNotification } = useNotifications();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState<string>(user.name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [department, setDepartment] = useState<string>(user.department || COLLEGE_DEPARTMENTS[0]);
  const [rollNumber, setRollNumber] = useState<string>(user.rollNumber || '');
  const [prn, setPrn] = useState<string>(user.prn || '');
  const [semester, setSemester] = useState<number>(user.semester || 1);
  const [division, setDivision] = useState<string>(user.division || 'Div A');
  const [academicYear, setAcademicYear] = useState<string>(user.academicYear || '2025 - 2026');
  const [cgpa, setCgpa] = useState<string>(user.cgpa !== undefined ? String(user.cgpa) : '8.00');
  const [mentorName, setMentorName] = useState<string>(user.mentorName || '');
  const [mentorEmail, setMentorEmail] = useState<string>(user.mentorEmail || '');

  // Photo Crop Modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Sync state if user prop changes
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setDepartment(user.department || COLLEGE_DEPARTMENTS[0]);
    setRollNumber(user.rollNumber || '');
    setPrn(user.prn || '');
    setSemester(user.semester || 1);
    setDivision(user.division || 'Div A');
    setAcademicYear(user.academicYear || '2025 - 2026');
    setCgpa(user.cgpa !== undefined ? String(user.cgpa) : '8.00');
    setMentorName(user.mentorName || '');
    setMentorEmail(user.mentorEmail || '');
  }, [user]);

  // Dirty check: are there unsaved modifications?
  const isDirty = 
    name.trim() !== (user.name || '').trim() || 
    phone.trim() !== (user.phone || '').trim() ||
    department !== (user.department || COLLEGE_DEPARTMENTS[0]) ||
    rollNumber.trim() !== (user.rollNumber || '').trim() ||
    prn.trim() !== (user.prn || '').trim() ||
    semester !== (user.semester || 1) ||
    division.trim() !== (user.division || 'Div A').trim() ||
    academicYear.trim() !== (user.academicYear || '2025 - 2026').trim() ||
    cgpa.trim() !== (user.cgpa !== undefined ? String(user.cgpa) : '8.00').trim() ||
    mentorName.trim() !== (user.mentorName || '').trim() ||
    mentorEmail.trim() !== (user.mentorEmail || '').trim();

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

  // Profile completion calculation based across all student fields
  const calculateCompletion = () => {
    const fields = [
      { key: 'name', value: user.name, weight: 15 },
      { key: 'email', value: user.email, weight: 15 },
      { key: 'department', value: user.department, weight: 15 },
      { key: 'rollNumber', value: user.rollNumber, weight: 10 },
      { key: 'prn', value: user.prn, weight: 10 },
      { key: 'phone', value: user.phone, weight: 10 },
      { key: 'avatar', value: user.avatar, weight: 10 },
      { key: 'cgpa', value: user.cgpa, weight: 5 },
      { key: 'mentor', value: user.mentorName, weight: 10 },
    ];

    const completed = fields.reduce((acc, f) => acc + (f.value ? f.weight : 0), 0);
    return Math.min(100, completed);
  };

  const completionPercent = calculateCompletion();

  // Handle Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name is required (at least 2 characters).');
      return;
    }

    const parsedCgpa = parseFloat(cgpa);
    if (!isNaN(parsedCgpa) && (parsedCgpa < 0 || parsedCgpa > 10)) {
      setErrorMessage('CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }

    if (semester < 1 || semester > 8) {
      setErrorMessage('Semester must be between 1 and 8.');
      return;
    }

    if (mentorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentorEmail.trim())) {
      setErrorMessage('Please enter a valid mentor email address.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateStudentPersonalProfile(user.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        rollNumber: rollNumber.trim() || undefined,
        prn: prn.trim() || undefined,
        semester: Number(semester),
        division: division.trim() || undefined,
        academicYear: academicYear.trim() || undefined,
        cgpa: !isNaN(parsedCgpa) ? parsedCgpa : undefined,
        mentorName: mentorName.trim() || undefined,
        mentorEmail: mentorEmail.trim() || undefined,
      });

      // Update AuthContext state locally immediately
      updateLocalUserProfile({
        name: updated.name,
        phone: updated.phone,
        department: updated.department,
        rollNumber: updated.rollNumber,
        prn: updated.prn,
        semester: updated.semester,
        division: updated.division,
        academicYear: updated.academicYear,
        cgpa: updated.cgpa,
        mentorName: updated.mentorName,
        mentorEmail: updated.mentorEmail,
      });

      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage('Student profile and academic curriculum details saved successfully.');

      confetti({
        particleCount: 55,
        spread: 50,
        origin: { y: 0.6 }
      });

      addNotification(
        'Profile Updated',
        'All student profile and academic curriculum details were saved to database successfully.',
        'academic'
      );

      // Refresh in background to sync any server-computed fields
      refreshProfile().catch(() => {});
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to update profile details.');
    }
  };

  // Handle Cancel
  const handleCancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved modifications. Discard changes and restore saved values?')) {
        return;
      }
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    setDepartment(user.department || COLLEGE_DEPARTMENTS[0]);
    setRollNumber(user.rollNumber || '');
    setPrn(user.prn || '');
    setSemester(user.semester || 1);
    setDivision(user.division || 'Div A');
    setAcademicYear(user.academicYear || '2025 - 2026');
    setCgpa(user.cgpa !== undefined ? String(user.cgpa) : '8.00');
    setMentorName(user.mentorName || '');
    setMentorEmail(user.mentorEmail || '');
    setErrorMessage(null);
    setIsEditing(false);
  };

  // Handle Photo Crop Complete
  const handlePhotoUploadComplete = async (blob: Blob) => {
    try {
      const result = await uploadProfileAvatar(user.id, blob);
      updateLocalUserProfile({ avatar: result.publicUrl });
      addNotification(
        'Profile Photo Updated',
        'Your profile picture was uploaded and updated successfully.',
        'academic'
      );
      refreshProfile().catch(() => {});
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload profile photo.');
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    try {
      await removeProfileAvatar(user.id);
      updateLocalUserProfile({ avatar: undefined });
      addNotification(
        'Photo Removed',
        'Profile photo removed. Restored institutional default avatar.',
        'academic'
      );
      refreshProfile().catch(() => {});
    } catch (err: any) {
      throw new Error(err.message || 'Failed to remove photo.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Smart Campus Identity Header Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] rounded-3xl p-6 sm:p-8 text-white border border-navy-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with digital badge & edit trigger */}
          <div className="relative shrink-0 group">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              role={user.role}
              size="2xl"
              ring
              showBadge
            />
            
            {/* Quick Change Photo Overlay Button */}
            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              className="absolute inset-0 rounded-2xl bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-teal-300 font-bold text-xs space-y-1 shadow-lg cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-5 h-5 text-teal-300 animate-bounce" />
              <span>Change</span>
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-teal-300 border border-teal-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>Official Student Identity</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Active Student Roster</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  Department of {user.department || 'Computer Engineering'}
                </p>
              </div>

              {/* Edit / Change Photo Quick Action Button */}
              <div className="flex items-center justify-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-3 py-2 rounded-2xl bg-navy-800/80 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Upload or manage profile photo"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Roll Number</span>
                <p className="text-sm font-mono font-bold text-white mt-0.5">{user.rollNumber || 'Not Set'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">PRN Number</span>
                <p className="text-sm font-mono font-bold text-teal-300 mt-0.5">{user.prn || 'Not Set'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Semester &amp; Div</span>
                <p className="text-sm font-bold text-white mt-0.5">Sem {user.semester || 1} ({user.division || 'Div A'})</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current CGPA</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{user.cgpa ? `${user.cgpa} / 10.0` : '8.00 / 10.0'}</p>
              </div>
            </div>
          </div>

          {/* QR Code / Digital Identity Pass */}
          <div className="hidden lg:flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-navy-950 shadow-md shrink-0">
            <QrCode className="w-20 h-20 text-navy-950" />
            <span className="text-[9px] font-mono font-bold uppercase mt-1 tracking-tight">Smart Campus ID</span>
          </div>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="font-extrabold text-slate-800 dark:text-white">Profile Completion Status</span>
          </div>
          <span className="font-bold text-teal-600 dark:text-teal-400 font-mono text-sm">
            {completionPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            {completionPercent === 100 
              ? 'Your student profile is comprehensive and up to date.' 
              : 'Complete your contact details, PRN, and mentor information to reach 100% completion.'}
          </span>
          <span className="text-[10px] text-slate-400">Institutional records active</span>
        </p>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* EDIT MODE: Fully Editable Profile Form */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-teal-500/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-teal-500" />
                <span>Edit Student Profile Details</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your personal information, academic enrollment, and mentorship details.
              </p>
            </div>

            {isDirty && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          {/* Section 1: Personal & Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Personal &amp; Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Official Email (Identity Record) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-100 dark:bg-navy-950/80 text-slate-500 dark:text-slate-400 text-xs font-mono cursor-not-allowed"
                    title="Account email is managed through Supabase Authentication"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-slate-400">
                    Auth ID
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Curriculum & Enrollment Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h4 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Curriculum &amp; Enrollment</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Department */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                >
                  {COLLEGE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. 21CS104"
                />
              </div>

              {/* PRN Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  PRN Number
                </label>
                <input
                  type="text"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. 2021016400987654"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Division / Section
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                >
                  {DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* CGPA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cumulative CGPA (0.00 - 10.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-bold font-mono focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="8.92"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Mentorship & Advisory Information */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h4 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assigned Faculty Mentorship &amp; Advisory</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentor Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mentor Faculty Name
                </label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. Dr. Radhika Sen"
                />
              </div>

              {/* Mentor Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mentor Email Address
                </label>
                <input
                  type="email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                  placeholder="e.g. radhika.sen@campusone.edu"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className={`px-6 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
                isDirty && !isSaving
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-navy-950 shadow-md shadow-teal-500/20 cursor-pointer'
                  : 'bg-slate-200 dark:bg-navy-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* Detailed Academic Roster & Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-teal-500" />
              <span>Academic Curriculum &amp; Enrollment</span>
            </h3>
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Enrolled
            </span>
          </div>

          <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-navy-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.department || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Program</span>
              <span className="font-bold text-slate-800 dark:text-white">Diploma in Engineering</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Academic Year</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.academicYear || '2025 - 2026'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Semester &amp; Division</span>
              <span className="font-bold text-slate-800 dark:text-white">Semester {user.semester || 1} — {user.division || 'Div A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Roll Number</span>
              <span className="font-bold font-mono text-slate-800 dark:text-white">{user.rollNumber || 'Not Set'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Permanent Registration (PRN)</span>
              <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">{user.prn || 'Not Set'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Current CGPA</span>
              <span className="font-bold text-emerald-500 dark:text-emerald-400">{user.cgpa ? `${user.cgpa} / 10.0` : '8.00 / 10.0'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Institutional Email</span>
              <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Contact Phone</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.phone || 'Not Provided'}</span>
            </div>
          </div>
        </div>

        {/* Faculty Mentor & Advisory */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Assigned Faculty Mentor &amp; Advisory</span>
            </h3>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Assigned
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center space-x-4">
              <UserAvatar
                name={user.mentorName || 'Faculty Advisor'}
                role="faculty"
                size="lg"
                ring
              />
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Faculty Mentor
                </p>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {user.mentorName || 'Department Faculty Advisor'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Government Polytechnic Ahmedabad
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  {user.mentorEmail || 'studentaffairs@gpahmedabad.ac.in'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-blue-200/40 dark:border-blue-900/30 pt-3">
              Your assigned mentor oversees curriculum progress, attendance adherence, and project supervision. Consultation hours are held weekly at the Department Office.
            </p>
          </div>

          {/* Quick Support Guidance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200/80 dark:border-navy-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Profile Modifications</p>
              <p className="mt-0.5 leading-relaxed">
                Click <strong>Edit Profile</strong> at any time to update your personal information, department, PRN, or academic details directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handlePhotoUploadComplete}
        currentAvatarUrl={user.avatar}
        onRemovePhoto={handleRemovePhoto}
        title="Update Student Profile Photo"
      />
    </div>
  );
};
