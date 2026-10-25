import React, { useState } from 'react';
import { SubjectAttendance } from '../../types';
import { STUDENT_ATTENDANCE } from '../../lib/mockData';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Calculator, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { updateSubjectAttendance } from '../../lib/storageService';

export const AttendanceTracker: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<SubjectAttendance[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_attendance_v1');
      return saved ? JSON.parse(saved) : STUDENT_ATTENDANCE;
    } catch (e) {
      return STUDENT_ATTENDANCE;
    }
  });

  // Calculator states
  const [calcSubject, setCalcSubject] = useState(attendanceList[0]?.subjectCode || 'CS601');
  const [classesToAttend, setClassesToAttend] = useState<number>(3);

  // Overall totals
  const totalAttended = attendanceList.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const totalConducted = attendanceList.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const overallPercentage = Number(((totalAttended / (totalConducted || 1)) * 100).toFixed(1));

  const safeCount = attendanceList.filter(a => a.status === 'Safe').length;
  const warningCount = attendanceList.filter(a => a.status === 'Warning').length;
  const criticalCount = attendanceList.filter(a => a.status === 'Critical').length;

  // Selected subject for calculator
  const targetSub = attendanceList.find(a => a.subjectCode === calcSubject) || attendanceList[0];
  const projectedAttended = targetSub.attendedClasses + classesToAttend;
  const projectedTotal = targetSub.totalClasses + classesToAttend;
  const projectedPercentage = Number(((projectedAttended / (projectedTotal || 1)) * 100).toFixed(1));

  // Max classes that can be safely missed
  // Formula: floor(attended / 0.75) - total
  const safeMissCount = Math.max(0, Math.floor(targetSub.attendedClasses / 0.75) - targetSub.totalClasses);

  const handleSimulateAttendance = (subCode: string, deltaAttended: number, deltaTotal: number) => {
    const updated = updateSubjectAttendance(subCode, deltaAttended, deltaTotal);
    setAttendanceList(updated);
  };

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
                  stroke={overallPercentage >= 75 ? '#00ADB5' : '#f43f5e'}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * overallPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{overallPercentage}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Aggregate</span>
              </div>
            </div>

            <p className="text-xs font-semibold mt-2 text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Eligible for Examinations
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                Attendance Compliance Radar
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Semester 6 Cumulative Attendance
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                University regulation requires a minimum of <span className="font-bold text-white">75% attendance</span> in each enrolled subject to sit for final semester theory and laboratory examinations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-navy-900/80 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Safe (&gt;75%)</span>
                <p className="text-xl font-extrabold text-white mt-0.5">{safeCount} Subjects</p>
                <p className="text-[10px] text-slate-400">No detention risk</p>
              </div>

              <div className="bg-navy-900/80 p-3 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Borderline (75%)</span>
                <p className="text-xl font-extrabold text-white mt-0.5">{warningCount} Subject</p>
                <p className="text-[10px] text-slate-400">Needs attendance</p>
              </div>

              <div className="bg-navy-900/80 p-3 rounded-xl border border-rose-500/30">
                <span className="text-[10px] text-rose-400 font-bold uppercase">Critical (&lt;75%)</span>
                <p className="text-xl font-extrabold text-white mt-0.5">{criticalCount} Subject</p>
                <p className="text-[10px] text-rose-300">Debarment notice</p>
              </div>
            </div>
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
              Detailed tracking for {attendanceList.length} course components
            </p>
          </div>
          <span className="text-xs text-slate-400">Updated: Today 08:30 AM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceList.map((item) => {
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
                      : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
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
                    {/* 75% threshold vertical marker */}
                    <div className="absolute top-0 bottom-0 left-[75%] w-[2px] bg-slate-400 z-10 opacity-70" title="75% Cutoff" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Simulator Button for demo */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Test Class Recording:</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleSimulateAttendance(item.subjectCode, 1, 1)}
                      className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100"
                      title="Simulate Attended Class"
                    >
                      + Present
                    </button>
                    <button
                      onClick={() => handleSimulateAttendance(item.subjectCode, 0, 1)}
                      className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100"
                      title="Simulate Missed Class"
                    >
                      + Absent
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Goal & Recovery Calculator Widget */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Smart Attendance Goal & Recovery Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate projected percentages and safe leave margins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-navy-950/50 p-5 rounded-2xl border border-slate-200/60 dark:border-navy-800">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Subject
              </label>
              <select
                value={calcSubject}
                onChange={(e) => setCalcSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
              >
                {attendanceList.map(a => (
                  <option key={a.subjectCode} value={a.subjectCode}>
                    {a.subjectCode} - {a.subjectName} ({a.percentage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Classes to Attend in Next 2 Weeks: <span className="text-brand-cyan font-bold">{classesToAttend}</span>
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
              <span className="text-slate-500">Classes you can safely miss right now:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {safeMissCount > 0 ? `${safeMissCount} lectures` : '0 (Attend all!)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-100 dark:border-navy-800 pt-2">
              {projectedPercentage >= 75 
                ? '✅ Attending these classes will comfortably keep you eligible for exams.'
                : '⚠️ Even with these classes, you remain below 75%. Consider meeting your faculty mentor.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
