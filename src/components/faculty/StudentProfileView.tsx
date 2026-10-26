import React, { useState, useEffect } from 'react';
import { UserProfile, StudentAttendanceSummary } from '../../types';
import { getStudentAttendanceSummary, getStudentMarks, getAssignments } from '../../lib/storageService';
import { 
  ArrowLeft, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Award, 
  Calendar, 
  Mail, 
  Phone, 
  Hash, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Building2, 
  TrendingUp,
  AlertTriangle,
  XCircle,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface StudentProfileViewProps {
  student: UserProfile;
  onBack: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ 
  student, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'academics' | 'activity'>('overview');
  
  // Real Attendance State
  const [attendanceSummary, setAttendanceSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(true);

  // Real Marks State
  const [marks, setMarks] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(true);

  // Assignments State
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    // 1. Fetch real attendance
    setLoadingAttendance(true);
    getStudentAttendanceSummary(student.id).then((summary) => {
      if (isMounted) {
        setAttendanceSummary(summary);
        setLoadingAttendance(false);
      }
    });

    // 2. Fetch real marks
    setLoadingMarks(true);
    getStudentMarks(student.id).then((res) => {
      if (isMounted) {
        setMarks(res);
        setLoadingMarks(false);
      }
    });

    // 3. Fetch real assignments
    getAssignments().then((res) => {
      if (isMounted) {
        setAssignments(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [student.id]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'ST';
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Late Arrival
          </span>
        );
      case 'leave':
      case 'excused':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3 h-3 mr-1" />
            Authorized Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </button>
        <span className="text-[11px] font-mono text-slate-400">
          Student ID: {student.id.slice(0, 8)}...
        </span>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-cyan/30 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-navy-950 text-brand-cyan border-2 border-brand-cyan/50 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                {getInitials(student.name)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  Verified Student
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                {student.department || 'Government Polytechnic Ahmedabad'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="font-mono text-slate-300">Roll: {student.rollNumber || 'N/A'}</span>
                <span>•</span>
                <span className="font-mono text-slate-300">PRN: {student.prn || 'N/A'}</span>
                <span>•</span>
                <span className="text-brand-cyan font-bold">Sem {student.semester || 1} • {student.division || 'Div A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="bg-navy-950/70 border border-navy-700/80 rounded-2xl p-4 flex items-center space-x-6 text-center shrink-0">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance</p>
              <p className="text-lg font-black text-white mt-0.5">
                {loadingAttendance ? '...' : attendanceSummary?.hasData ? `${attendanceSummary.percentage}%` : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">
                {attendanceSummary?.hasData ? `${attendanceSummary.attendedClasses}/${attendanceSummary.totalClasses} classes` : 'No logs yet'}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-navy-700" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Marks Eval</p>
              <p className="text-lg font-black text-brand-cyan mt-0.5">
                {loadingMarks ? '...' : marks.length > 0 ? `${marks.length} Subjects` : 'None'}
              </p>
              <p className="text-[10px] text-slate-400">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-1.5 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1">
        {[
          { id: 'overview', label: 'Personal & Academic Profile', icon: User },
          { id: 'attendance', label: 'Attendance Records', icon: CheckCircle2 },
          { id: 'academics', label: 'Academic Performance', icon: Award },
          { id: 'activity', label: 'Assignments & Activity', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW (Personal & Academic Profile) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Personal Details */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-cyan" />
              <span>Personal Identity &amp; Contact</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-white">{student.name}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-400">Institutional Email</span>
                <a href={`mailto:${student.email}`} className="font-semibold text-brand-cyan hover:underline flex items-center space-x-1">
                  <span>{student.email}</span>
                  <Mail className="w-3 h-3" />
                </a>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{student.phone || 'Not Registered'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Account Authorization</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Student (RLS Active)
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Academic Enrollment */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-brand-cyan" />
              <span>Academic Enrollment Details</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-navy-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">College Department</span>
                <span className="font-bold text-slate-800 dark:text-white text-right max-w-[220px]">
                  {student.department || 'Government Polytechnic Ahmedabad'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Roll Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{student.rollNumber || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Permanent Registration (PRN)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{student.prn || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Semester &amp; Division</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  Semester {student.semester || 1} • {student.division || 'Div A'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-semibold text-slate-800 dark:text-white">{student.academicYear || '2025 - 2026'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Assigned Faculty Mentor</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {student.mentorName || 'Department HOD Office'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE (Real Calculated Metrics & Date-wise Log) */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {loadingAttendance ? (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-10 border border-slate-200/80 dark:border-navy-800 text-center animate-pulse">
              <p className="text-xs text-slate-400">Loading verified attendance ledger from Supabase...</p>
            </div>
          ) : !attendanceSummary?.hasData ? (
            /* Honest Empty State */
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-10 border border-slate-200/80 dark:border-navy-800 text-center space-y-3 shadow-sm max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white">
                Attendance Data Not Available Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                No faculty has recorded attendance sessions for this student's class and enrolled semester yet. Once an attendance sheet is committed, attendance percentages and date-wise records will automatically calculate here.
              </p>
            </div>
          ) : (
            <>
              {/* Top Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200/80 dark:border-navy-800 text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Aggregate Attendance</p>
                  <p className={`text-2xl font-black mt-1 ${
                    attendanceSummary.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {attendanceSummary.percentage}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {attendanceSummary.percentage >= 75 ? 'Above 75% Threshold' : 'Below 75% Requirement'}
                  </p>
                </div>

                <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200/80 dark:border-navy-800 text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Classes Conducted</p>
                  <p className="text-2xl font-black text-navy-900 dark:text-white mt-1">
                    {attendanceSummary.totalClasses}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Total Class Sessions</p>
                </div>

                <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200/80 dark:border-navy-800 text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Classes Attended</p>
                  <p className="text-2xl font-black text-emerald-500 mt-1">
                    {attendanceSummary.attendedClasses}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Present / Late</p>
                </div>

                <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200/80 dark:border-navy-800 text-center">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Classes Missed</p>
                  <p className="text-2xl font-black text-rose-500 mt-1">
                    {attendanceSummary.missedClasses}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Absent / Leave</p>
                </div>
              </div>

              {/* Subject-Wise Attendance Breakdown */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-brand-cyan" />
                  <span>Subject-Wise Attendance Breakdown</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Instructor</th>
                        <th className="py-2.5 px-3 text-center">Attended</th>
                        <th className="py-2.5 px-3 text-center">Total</th>
                        <th className="py-2.5 px-3 text-right">Percentage</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {attendanceSummary.subjects.map((sub) => (
                        <tr key={sub.subjectCode} className="hover:bg-slate-50 dark:hover:bg-navy-800/50">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 dark:text-white">{sub.subjectName}</span>
                            <span className="block text-[10px] font-mono text-slate-400">{sub.subjectCode}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{sub.facultyName}</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{sub.attendedClasses}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">{sub.totalClasses}</td>
                          <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">{sub.percentage}%</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.status === 'Safe' 
                                ? 'bg-emerald-500/15 text-emerald-500' 
                                : sub.status === 'Warning' 
                                ? 'bg-amber-500/15 text-amber-500' 
                                : 'bg-rose-500/15 text-rose-500'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Date-Wise Attendance History */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  <span>Date-Wise Attendance History</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Time Slot</th>
                        <th className="py-2.5 px-3">Curriculum Lecture Topic</th>
                        <th className="py-2.5 px-3 text-right">Recorded Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {attendanceSummary.dateWiseRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50">
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{rec.date}</td>
                          <td className="py-3 px-3 font-bold text-slate-800 dark:text-white">{rec.subjectName}</td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{rec.slot}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">{rec.topic}</td>
                          <td className="py-3 px-3 text-right">{getStatusBadge(rec.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: ACADEMIC PERFORMANCE (Real Marks & SGPA) */}
      {activeTab === 'academics' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-brand-cyan" />
                <span>Internal Marks &amp; Continuous Assessment</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluations submitted by course faculty and recorded in Supabase marks table.
              </p>
            </div>
            {student.cgpa && (
              <div className="px-3 py-1 rounded-xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 text-xs font-bold">
                Cumulative CGPA: {student.cgpa}
              </div>
            )}
          </div>

          {loadingMarks ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading verified academic evaluations...
            </div>
          ) : marks.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl max-w-md mx-auto my-4">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">No Marks Recorded Yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Examination Cell and departmental faculty have not posted internal marks or mid-semester test grades for this student yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Test 1 (/30)</th>
                    <th className="py-2.5 px-3 text-center">Test 2 (/30)</th>
                    <th className="py-2.5 px-3 text-center">Quiz (/10)</th>
                    <th className="py-2.5 px-3 text-center">Lab (/20)</th>
                    <th className="py-2.5 px-3 text-center">Total (/100)</th>
                    <th className="py-2.5 px-3 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {marks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-white">{m.subjectName}</span>
                        <span className="block text-[10px] font-mono text-slate-400">{m.subjectCode}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{m.internal1}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.internal2}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.quizAverage}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.labAssignment}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">{m.totalMarks}</td>
                      <td className="py-3 px-3 text-right font-black text-brand-cyan">{m.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACTIVITY (Assignments) */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-cyan" />
            <span>Course Assignments &amp; Submissions</span>
          </h3>

          {assignments.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl max-w-md mx-auto my-4">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">No Course Assignments</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Course instructors have not published assignments for this department and semester yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">{asg.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {asg.subjectName} ({asg.subjectCode}) • Due Date: {asg.dueDate}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    {asg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
