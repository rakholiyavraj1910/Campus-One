import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  ShieldCheck, 
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
  BookOpen,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ImageCropModal } from '../common/ImageCropModal';
import { 
  uploadProfileAvatar, 
  removeProfileAvatar, 
  updateFacultyPersonalProfile 
} from '../../lib/storageService';
import { COLLEGE_DEPARTMENTS } from '../../types';
import confetti from 'canvas-confetti';

const FACULTY_DESIGNATIONS = [
  'Head of Department & Professor',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Adjunct Faculty / Visiting Expert'
];

interface FacultyProfilePageProps {
  onNavigateSection?: (sectionId: any) => void;
}

export const FacultyProfilePage: React.FC<FacultyProfilePageProps> = ({ onNavigateSection }) => {
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
  const [department, setDepartment] = useState<string>(user.department || COLLEGE_DEPARTMENTS[0]);
  const [designation, setDesignation] = useState<string>(user.designation || 'Assistant Professor');
  const [cabin, setCabin] = useState<string>(user.cabin || '');
  const [consultationHours, setConsultationHours] = useState<string>(user.consultationHours || '');
  const [specializationsText, setSpecializationsText] = useState<string>(
    user.specialization ? user.specialization.join(', ') : ''
  );

  // Photo Crop Modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Sync state if user prop changes
  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setDepartment(user.department || COLLEGE_DEPARTMENTS[0]);
    setDesignation(user.designation || 'Assistant Professor');
    setCabin(user.cabin || '');
    setConsultationHours(user.consultationHours || '');
    setSpecializationsText(user.specialization ? user.specialization.join(', ') : '');
  }, [user]);

  // Dirty check: are there unsaved modifications?
  const isDirty = name.trim() !== (user.name || '').trim() || 
                  phone.trim() !== (user.phone || '').trim() ||
                  department !== (user.department || COLLEGE_DEPARTMENTS[0]) ||
                  designation.trim() !== (user.designation || 'Assistant Professor').trim() ||
                  cabin.trim() !== (user.cabin || '').trim() ||
                  consultationHours.trim() !== (user.consultationHours || '').trim() ||
                  specializationsText.trim() !== (user.specialization ? user.specialization.join(', ') : '').trim();

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

  // Profile completion calculation based only on relevant faculty fields
  const calculateCompletion = () => {
    const fields = [
      { key: 'name', value: user.name, weight: 20 },
      { key: 'email', value: user.email, weight: 20 },
      { key: 'department', value: user.department, weight: 15 },
      { key: 'phone', value: user.phone, weight: 15 },
      { key: 'avatar', value: user.avatar, weight: 10 },
      { key: 'cabin', value: user.cabin, weight: 10 },
      { key: 'consultationHours', value: user.consultationHours, weight: 10 },
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
      const parsedSpecializations = specializationsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const updated = await updateFacultyPersonalProfile(user.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
        cabin: cabin.trim() || undefined,
        consultationHours: consultationHours.trim() || undefined,
        specialization: parsedSpecializations.length > 0 ? parsedSpecializations : undefined,
      });

      // Update AuthContext locally immediately
      updateLocalUserProfile({
        name: updated.name,
        phone: updated.phone,
        department: updated.department,
        designation: updated.designation,
        cabin: updated.cabin,
        consultationHours: updated.consultationHours,
        specialization: updated.specialization,
      });

      setIsSaving(false);
      setIsEditing(false);
      setSuccessMessage('Faculty professional profile updated successfully.');

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 }
      });

      addNotification(
        'Profile Updated',
        'Your faculty details were committed to institutional records and directory.',
        'academic'
      );

      // Refresh in background
      refreshProfile().catch(() => {});
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to save faculty details.');
    }
  };

  // Handle Cancel
  const handleCancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard modifications and restore saved values?')) {
        return;
      }
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    setDepartment(user.department || COLLEGE_DEPARTMENTS[0]);
    setDesignation(user.designation || 'Assistant Professor');
    setCabin(user.cabin || '');
    setConsultationHours(user.consultationHours || '');
    setSpecializationsText(user.specialization ? user.specialization.join(', ') : '');
    setErrorMessage(null);
    setIsEditing(false);
  };

  // Handle Photo Crop Complete
  const handlePhotoUploadComplete = async (blob: Blob) => {
    try {
      const result = await uploadProfileAvatar(user.id, blob);
      updateLocalUserProfile({ avatar: result.publicUrl });
      addNotification(
        'Faculty Photo Updated',
        'Profile photo updated and synchronized with campus directory.',
        'academic'
      );
      refreshProfile().catch(() => {});
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload photo.');
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Faculty Executive Header Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white border border-navy-700/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
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
          <div className="flex-1 w-full min-w-0 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-teal-300 border border-teal-500/30 flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>Instructional Faculty Member</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Institutional Appointment Verified</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                  {user.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 truncate">
                  {user.designation || 'Assistant Professor'} &bull; Department of {user.department || 'Computer Engineering'}
                </p>
              </div>

              {/* Edit / Change Photo Quick Action Button */}
              <div className="flex items-center justify-center gap-2 shrink-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 sm:px-4 py-2 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm min-h-[38px] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="px-3.5 sm:px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5 min-h-[38px] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCropModalOpen(true)}
                  className="px-3 py-2 rounded-2xl bg-navy-800/80 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-bold transition-all flex items-center space-x-1.5 min-h-[38px] cursor-pointer"
                  title="Upload or manage profile photo"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3">
              <div className="bg-navy-950/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-navy-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Faculty Office</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{user.cabin || 'Faculty Room'}</p>
              </div>

              <div className="bg-navy-950/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-navy-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Contact Phone</span>
                <p className="text-xs sm:text-sm font-mono font-bold text-teal-300 mt-0.5 truncate">{user.phone || 'Not Provided'}</p>
              </div>

              <div className="bg-navy-950/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-navy-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Consultation Hours</span>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">{user.consultationHours || 'Mon-Fri 03:00 - 05:00 PM'}</p>
              </div>

              <div className="bg-navy-950/60 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-navy-800 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Appointment</span>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 truncate">Permanent Full-Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="font-extrabold text-slate-800 dark:text-white">Faculty Profile Completeness</span>
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
              ? 'Your instructional profile is complete and visible to students.' 
              : 'Add office hours, office room, and specializations to guide student consultations.'}
          </span>
          <span className="text-[10px] text-slate-400">Public faculty directory synchronized</span>
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
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-teal-500/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-teal-500" />
                <span>Edit Faculty Details</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your contact information, office hours, and curriculum specializations.
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
                placeholder="e.g. Dr. Ramesh Sharma"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your academic title and name displayed in the faculty directory
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
                For administrative coordination and urgent campus alerts
              </p>
            </div>

            {/* Cabin / Office Room */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cabin / Office Location
              </label>
              <input
                type="text"
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                placeholder="e.g. Room 204, IT Building 2nd Floor"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Where students can locate you for academic advisory
              </p>
            </div>

            {/* Consultation Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Student Consultation Hours
              </label>
              <input
                type="text"
                value={consultationHours}
                onChange={(e) => setConsultationHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                placeholder="e.g. Mon, Wed, Fri: 03:00 PM - 05:00 PM"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Available hours for student doubt clearance and mentorship
              </p>
            </div>
          </div>

          {/* Specializations (Comma Separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Specializations &amp; Research Interests (Comma-Separated)
            </label>
            <input
              type="text"
              value={specializationsText}
              onChange={(e) => setSpecializationsText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              placeholder="e.g. Distributed Computing, Cloud Architecture, Network Security"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Displayed as specialization tags on your public directory card
            </p>
          </div>

          {/* Academic Appointment & Department Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h4 className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Academic Appointment &amp; Department</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
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

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
                >
                  {FACULTY_DESIGNATIONS.map((desig) => (
                    <option key={desig} value={desig}>
                      {desig}
                    </option>
                  ))}
                </select>
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

      {/* Detailed Faculty Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Appointment Details */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-teal-500" />
              <span>Department &amp; Academic Appointment</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Verified
            </span>
          </div>

          <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-navy-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.department || 'Computer Engineering'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Official Designation</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.designation || 'Assistant Professor'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Faculty Cabin / Office</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.cabin || 'Room 204, IT Block'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Consultation Schedule</span>
              <span className="font-bold text-slate-800 dark:text-white truncate">{user.consultationHours || 'Mon-Fri: 03:00 - 05:00 PM'}</span>
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

        {/* Specializations & Teaching Portfolio */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Teaching Domains &amp; Specializations</span>
            </h3>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Curriculum
            </span>
          </div>

          {/* Specialization Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Core Subject Areas</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {(user.specialization && user.specialization.length > 0) ? (
                user.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No specializations entered yet. Click "Edit Profile" to list your subject domains.
                </span>
              )}
            </div>
          </div>

          {/* Consultation Note */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-blue-900 dark:text-blue-200">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Office Consultation Policy</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Office hours are visible to students in the Campus Directory. Ensure your consultation schedule is accurate so students can book project reviews and academic counseling.
            </p>
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
        title="Update Faculty Profile Photo"
      />
    </div>
  );
};
