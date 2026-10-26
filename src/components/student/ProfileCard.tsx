import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  QrCode
} from 'lucide-react';

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Student ID Smart Card */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with digital badge */}
          <div className="relative shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-brand-cyan/40 shadow-lg"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan text-navy-950 shadow-md">
              Enrolled
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-brand-cyan border border-brand-cyan/30">
                Official Student Identity
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active RFID Verified
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user.name}
            </h2>

            <p className="text-sm text-slate-300">
              Department of {user.department || 'Computer Science & Engineering'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-navy-950/60 p-2.5 rounded-xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Roll Number</span>
                <p className="text-sm font-mono font-bold text-white">{user.rollNumber || '21CS104'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">PRN Number</span>
                <p className="text-sm font-mono font-bold text-brand-cyan">{user.prn || '2021016400987654'}</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Semester & Div</span>
                <p className="text-sm font-bold text-white">Sem {user.semester || 6} ({user.division || 'Div A'})</p>
              </div>

              <div className="bg-navy-950/60 p-2.5 rounded-xl border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current CGPA</span>
                <p className="text-sm font-bold text-emerald-400">{user.cgpa || 8.92} / 10.0</p>
              </div>
            </div>
          </div>

          {/* QR Code / Digital Pass */}
          <div className="hidden lg:flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-navy-950 shadow-md shrink-0">
            <QrCode className="w-20 h-20 text-navy-900" />
            <span className="text-[9px] font-mono font-bold uppercase mt-1 tracking-tight">Smart Campus ID</span>
          </div>
        </div>
      </div>

      {/* Additional Enrollment & Academic Mentorship Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-brand-cyan" />
            <span>Academic Curriculum & Enrollment</span>
          </h3>

          <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-navy-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.department || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Degree Program</span>
              <span className="font-bold text-slate-800 dark:text-white">Bachelor of Technology (B.Tech)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Academic Year</span>
              <span className="font-bold text-slate-800 dark:text-white">{user.academicYear || '2025 - 2026'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Admission Category</span>
              <span className="font-bold text-slate-800 dark:text-white">Merit Quota (State CET)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Batch Duration</span>
              <span className="font-bold text-slate-800 dark:text-white">2023 — 2027</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Institutional Email</span>
              <span className="font-mono text-xs font-semibold text-brand-cyan">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Faculty Mentor & Advisory */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Assigned Faculty Mentor & Advisory</span>
          </h3>

          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Mentor"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40"
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
              <p className="text-xs text-brand-cyan font-mono mt-0.5">
                {user.mentorEmail || 'studentaffairs@gpahmedabad.ac.in'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700/60 space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mentor Consultation Hours
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every Tuesday & Thursday from 02:00 PM to 04:00 PM at Tech Tower Room 402. For emergency academic leaves, submit requests through the mentor portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
