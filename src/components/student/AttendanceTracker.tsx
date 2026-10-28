import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentAttendanceSummary, AttendanceStatus } from '../../types';
import { getStudentAttendanceSummary } from '../../lib/storageService';
import { SkeletonCard } from '../common/SkeletonLoader';
import { ScrollStagger } from '../common/ScrollReveal';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Calculator, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Info,
  Calendar,
  BookOpen,
  RefreshCw,
  Award
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculator states
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [classesToAttend, setClassesToAttend] = useState<number>(3);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const data = await getStudentAttendanceSummary(user.id);
        setSummary(data);
        if (data.subjects.length > 0) {
          setSelectedSubjectCode(data.subjects[0].subjectCode);
        }
      }
    } catch (e) {
      console.error('Error fetching attendance summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user?.id]);

  const hasData = summary && summary.hasData && summary.totalClasses > 0;
  const overallPercentage = hasData ? summary.percentage : 0;

  const safeCount = hasData ? summary.subjects.filter(s => s.status === 'Safe').length : 0;
  const warningCount = hasData ? summary.subjects.filter(s => s.status === 'Warning').length : 0;
  const criticalCount = hasData ? summary.subjects.filter(s => s.status === 'Critical').length : 0;

  // Selected subject for calculator
  const targetSub = hasData ? (summary.subjects.find(s => s.subjectCode === selectedSubjectCode) || summary.subjects[0]) : null;
  const projectedAttended = targetSub ? targetSub.attendedClasses + classesToAttend : 0;
  const projectedTotal = targetSub ? targetSub.totalClasses + classesToAttend : 0;
  const projectedPercentage = targetSub && projectedTotal > 0
    ? Number(((projectedAttended / projectedTotal) * 100).toFixed(1))
    : 0;

  const safeMissCount = targetSub && targetSub.totalClasses > 0
    ? Math.max(0, Math.floor(targetSub.attendedClasses / 0.75) - targetSub.totalClasses)
    : 0;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Present</span>;
      case 'late':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">Late</span>;
      case 'leave':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">Approved Leave</span>;
      case 'absent':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">Absent</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SkeletonCard rows={2} className="h-44" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Metric Summary */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Circular dial / percentage */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-navy-950/60 rounded-2xl border border-navy-800">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e3a5f"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={hasData ? (overallPercentage >= 75 ? '#00ADB5' : '#f43f5e') : '#334155'}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={hasData ? 251.2 - (251.2 * overallPercentage) / 100 : 251.2}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">
                  {hasData ? `${overallPercentage}%` : '0%'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Aggregate</span>
              </div>
            </div>

            <p className="text-xs font-semibold mt-2 flex items-center">
              {hasData ? (
                overallPercentage >= 75 ? (
                  <span className="text-emerald-400 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Eligible for Final Exams
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Below 75% Requirement
                  </span>
                )
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Info className="w-3.5 h-3.5 mr-1" />
                  Awaiting Lecture Records
                </span>
              )}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                Attendance Compliance Radar
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {user.department || 'Government Polytechnic Ahmedabad'} • Semester {user.semester || 1}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                University regulation requires a minimum of <span className="font-bold text-white">75% attendance</span> in each enrolled course to sit for final semester examinations under GTU regulations.
              </p>
            </div>

            {hasData ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-navy-900/80 p-3 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Safe (&ge;75%)</span>
                  <p className="text-xl font-extrabold text-white mt-0.5">{safeCount} Subjects</p>
                  <p className="text-[10px] text-slate-400">Exam eligible</p>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Borderline (70-75%)</span>
                  <p className="text-xl font-extrabold text-white mt-0.5">{warningCount} Subjects</p>
                  <p className="text-[10px] text-slate-400">Needs attendance</p>
                </div>

                <div className="bg-navy-900/80 p-3 rounded-xl border border-rose-500/30">
                  <span className="text-[10px] text-rose-400 font-bold uppercase">Critical (&lt;70%)</span>
                  <p className="text-xl font-extrabold text-white mt-0.5">{criticalCount} Subjects</p>
                  <p className="text-[10px] text-rose-300">Detention alert</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center">
                  <Info className="w-3.5 h-3.5 mr-1.5 text-brand-cyan" />
                  Official Attendance Ledger
                </p>
                <p className="text-slate-400">
                  Your department faculty have not submitted attendance records for your enrolled semester yet.
                  Once lectures are conducted and submitted to the cloud, your percentage and attendance history will update here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Subject-Wise Attendance Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasData 
                ? `Detailed tracking across ${summary?.subjects.length} course components`
                : 'Enrolled course components'}
            </p>
          </div>
          <button
            onClick={fetchAttendance}
            className="text-xs text-slate-400 hover:text-brand-cyan flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {!hasData ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Course Attendance Records Available
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Faculty members record attendance using the Faculty Portal. Verified session counts will appear here once recorded.
            </p>
          </div>
        ) : (
          <ScrollStagger staggerMs={40} className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-4">
            {summary?.subjects.map((item) => {
              const isSafe = item.percentage >= 75;
              const isWarning = item.percentage >= 70 && item.percentage < 75;

              return (
                <div
                  key={item.subjectCode}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSafe
                      ? 'border-slate-200/80 dark:border-navy-800 bg-white dark:bg-navy-900/50'
                      : isWarning
                      ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-cyan">
                        {item.subjectCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.subjectName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Faculty: {item.facultyName}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase shrink-0 ${
                      item.status === 'Safe'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : item.status === 'Warning'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.percentage}% ({item.status})
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Attended: <strong className="text-slate-800 dark:text-white">{item.attendedClasses}</strong> / {item.totalClasses} classes
                      </span>
                      <span>Min Req: 75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-[75%] w-[2px] bg-slate-400 z-10 opacity-70" title="75% Cutoff" />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollStagger>
        )}
      </div>

      {/* Date-Wise Attendance History Log */}
      {hasData && summary && summary.dateWiseRecords.length > 0 && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Lecture Attendance Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official verified records per conducted lecture session
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Total {summary.dateWiseRecords.length} Lectures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Slot</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Topic / Lesson</th>
                  <th className="py-2.5 px-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {summary.dateWiseRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      {r.date}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {r.slot}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-brand-cyan">{r.subjectCode}</span>
                      <p className="text-[11px] text-slate-500">{r.subjectName}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {r.topic || 'Regular Lecture'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {getStatusBadge(r.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Goal & Recovery Calculator Widget (Only when data exists) */}
      {hasData && targetSub && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Attendance Compliance & Recovery Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculate projected percentages and safe leave margins based on verified records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-navy-950/50 p-5 rounded-2xl border border-slate-200/60 dark:border-navy-800">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Course Component
                </label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                >
                  {summary?.subjects.map(s => (
                    <option key={s.subjectCode} value={s.subjectCode}>
                      {s.subjectCode} - {s.subjectName} ({s.percentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lectures to Attend Ahead: <span className="text-brand-cyan font-bold">{classesToAttend}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={classesToAttend}
                  onChange={(e) => setClassesToAttend(Number(e.target.value))}
                  className="w-full accent-brand-cyan cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 classes</span>
                  <span>7 classes</span>
                  <span>15 classes</span>
                </div>
              </div>
            </div>

            {/* Results Outcome */}
            <div className="flex flex-col justify-center space-y-3 p-4 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/80 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Projected Attendance:</span>
                <span className={`text-lg font-extrabold ${projectedPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {projectedPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-navy-800 pt-2">
                <span className="text-slate-500">Safe leave margin right now:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {safeMissCount > 0 ? `${safeMissCount} lectures` : '0 (Attend all)'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-100 dark:border-navy-800 pt-2">
                {projectedPercentage >= 75 
                  ? '✅ Attending these lectures will maintain exam eligibility under GTU regulations.'
                  : '⚠️ This attendance projection remains below 75%. Please consult your academic mentor.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
