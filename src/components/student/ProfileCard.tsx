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
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ImageCropModal } from '../common/ImageCropModal';
import { 
  uploadProfileAvatar, 
  removeProfileAvatar, 
  updateStudentPersonalProfile 
} from '../../lib/storageService';
import confetti from 'canvas-confetti';

export const ProfileCard: React.FC = () => {
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

  // Photo Crop Modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Sync state if user prop changes
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user]);

  // Dirty check: are there unsaved modifications?
  const isDirty = name.trim() !== (user.name || '').trim() || 
                  phone.trim() !== (user.phone || '').trim();

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

  // Profile completion calculation based only on relevant student fields
  const calculateCompletion = () => {
    const fields = [
      { key: 'name', value: user.name, weight: 20 },
      { key: 'email', value: user.email, weight: 20 },
      { key: 'department', value: user.department, weight: 20 },
      { key: 'phone', value: user.phone, weight: 15 },
      { key: 'avatar', value: user.avatar, weight: 15 },
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

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Full name is required (at least 2 characters).');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateStudentPersonalProfile(user.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      // Update AuthContext locally immediately
      updateLocalUserProfile({
        name: updated.name,
        phone: updated.phone,
      });

      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage('Student profile details saved successfully.');

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 }
      });

      addNotification(
        'Profile Updated',
        'Your student personal profile details were saved successfully.',
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
      if (!window.confirm('You have unsaved changes. Discard changes?')) {
        return;
      }
    }
    setName(user.name || '');
    setPhone(user.phone || '');
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
              className="absolute inset-0 rounded-2xl bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-teal-300 font-bold text-xs space-y-1 shadow-lg"
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
                    className="px-4 py-2 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-3 py-2 rounded-2xl bg-navy-800/80 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-bold transition-all flex items-center space-x-1.5"
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
                <p className="text-sm font-mono font-bold text-white mt-0.5">{user.rollNumber || 'Not Assigned'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">PRN Number</span>
                <p className="text-sm font-mono font-bold text-teal-300 mt-0.5">{user.prn || 'Verified Institutional ID'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-2xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Semester &amp; Div</span>
                <p className="text-sm font-bold text-white mt-0.5">Sem {user.semester || 1} ({user.division || 'A'})</p>
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
              : 'Add your contact phone number and verified photo to reach 100% completion.'}
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

      {/* EDIT MODE: Form View */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-teal-500/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-teal-500" />
                <span>Edit Personal Information</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your verified personal details. Academic identifiers are locked by institutional policy.
              </p>
            </div>

            {isDirty && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                placeholder="e.g. Aarav Patel"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your official name as recognized in college records
              </p>
            </div>

            {/* Phone Number */}
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
              <p className="text-[11px] text-slate-400 mt-1">
                Used for urgent institutional notifications &amp; mentor contact
              </p>
            </div>
          </div>

          {/* Institutional Protected Fields Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Institution-Controlled Academic Fields (Locked)</span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Academic identifiers (Roll Number, PRN, Academic Department, Semester, Division, and CGPA) are verified by the Registrar of Government Polytechnic Ahmedabad and cannot be self-edited. If a correction is required, please submit an official request to your Department HOD.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Department</span>
                <span className="font-bold text-slate-800 dark:text-white truncate block">{user.department || 'Computer Engineering'}</span>
              </div>
              <div className="bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Roll Number</span>
                <span className="font-bold text-slate-800 dark:text-white block font-mono">{user.rollNumber || '21CE101'}</span>
              </div>
              <div className="bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Semester</span>
                <span className="font-bold text-slate-800 dark:text-white block">Semester {user.semester || 1}</span>
              </div>
              <div className="bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-navy-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Official Email</span>
                <span className="font-bold text-slate-800 dark:text-white truncate block font-mono text-[11px]">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className={`px-6 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
                isDirty && !isSaving
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-navy-950 shadow-md shadow-teal-500/20'
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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enrolled
            </span>
          </div>

          <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-navy-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.department || 'Computer Engineering'}</span>
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
              <span className="font-bold text-slate-800 dark:text-white">Semester {user.semester || 1} — Division {user.division || 'A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Admission Mode</span>
              <span className="font-bold text-slate-800 dark:text-white">ACPC State Merit Quota</span>
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
              <p className="font-bold text-slate-800 dark:text-white">Need an official record amendment?</p>
              <p className="mt-0.5 leading-relaxed">
                Contact the Registrar Office with your admission receipt or submit an inquiry through the Student Grievance desk.
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
