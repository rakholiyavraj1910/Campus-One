import React, { useState } from 'react';
import { STUDENT_MARKS } from '../../lib/mockData';
import { 
  Award, 
  TrendingUp, 
  Download, 
  Sparkles, 
  CheckCircle, 
  Calculator,
  BarChart2
} from 'lucide-react';

export const MarksAndResults: React.FC = () => {
  const [targetSubject, setTargetSubject] = useState(STUDENT_MARKS[0]?.subjectCode || 'CS601');
  const [desiredGrade, setDesiredGrade] = useState<'A+' | 'A' | 'B+'>('A+');

  const selectedMark = STUDENT_MARKS.find(m => m.subjectCode === targetSubject) || STUDENT_MARKS[0];

  // Calculate needed marks out of 100 for end-sem
  // Target for A+ is 90+, Target for A is 80+, Target for B+ is 70+
  const targetThreshold = desiredGrade === 'A+' ? 90 : desiredGrade === 'A' ? 80 : 70;
  // Let internal count for 40% and end-sem count for 60%
  // Current internal score out of 100: selectedMark.totalMarks
  // Equation: (currentInternal * 0.4) + (endSemMarks * 0.6) = targetThreshold
  const neededEndSem = Math.max(0, Math.min(100, Math.ceil((targetThreshold - (selectedMark.totalMarks * 0.4)) / 0.6)));

  const handleDownloadReport = () => {
    alert('Generating signed digital grade sheet transcript (PDF)...');
  };

  return (
    <div className="space-y-6">
      {/* Top CGPA & Performance Snapshot */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Controller of Examinations Certified
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Cumulative Academic Performance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Continuous internal assessment (CIE) records and semester grade point progression
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Current CGPA</span>
              <p className="text-3xl font-extrabold text-brand-cyan">8.92</p>
              <span className="text-[10px] text-emerald-400 font-semibold">Distinction</span>
            </div>

            <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Sem 5 SGPA</span>
              <p className="text-3xl font-extrabold text-white">9.14</p>
              <span className="text-[10px] text-brand-cyan font-semibold">Rank #3</span>
            </div>
          </div>
        </div>

        {/* Semester Trend Pills */}
        <div className="mt-6 pt-5 border-t border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-semibold">Progression Record:</span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { sem: 'Sem 1', sgpa: '8.40' },
              { sem: 'Sem 2', sgpa: '8.65' },
              { sem: 'Sem 3', sgpa: '8.80' },
              { sem: 'Sem 4', sgpa: '8.95' },
              { sem: 'Sem 5', sgpa: '9.14' },
              { sem: 'Sem 6', sgpa: '8.92 (Mid)' },
            ].map((s) => (
              <div key={s.sem} className="px-3 py-1.5 rounded-xl bg-navy-900/90 border border-navy-700 flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">{s.sem}:</span>
                <span className="font-bold text-brand-cyan">{s.sgpa}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-1.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Transcripts</span>
          </button>
        </div>
      </div>

      {/* Internal Marks Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Internal Marks & Continuous Evaluation (CIE)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated from Test 1 (30), Test 2 (30), Quizzes (10), Labs (20), & Attendance (10)
            </p>
          </div>
          <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
            All Internals Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-2 text-center">Test 1 (30)</th>
                <th className="py-3 px-2 text-center">Test 2 (30)</th>
                <th className="py-3 px-2 text-center">Quiz (10)</th>
                <th className="py-3 px-2 text-center">Lab (20)</th>
                <th className="py-3 px-2 text-center">Att (10)</th>
                <th className="py-3 px-2 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Predicted Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 font-medium text-slate-700 dark:text-slate-300">
              {STUDENT_MARKS.map((m) => (
                <tr key={m.subjectCode} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-brand-cyan">{m.subjectCode}</span>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{m.subjectName}</p>
                  </td>
                  <td className="py-3 px-2 text-center font-semibold">{m.internal1}</td>
                  <td className="py-3 px-2 text-center font-semibold">{m.internal2}</td>
                  <td className="py-3 px-2 text-center font-semibold">{m.quizAverage}</td>
                  <td className="py-3 px-2 text-center font-semibold">{m.labAssignment}</td>
                  <td className="py-3 px-2 text-center font-semibold">{m.attendanceMarks}</td>
                  <td className="py-3 px-2 text-center font-extrabold text-slate-900 dark:text-white text-sm">
                    {m.totalMarks}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Grade Calculator Widget */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              End-Semester Grade Predictor & Target Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find out the exact end-sem marks required to secure your target grade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-navy-950/50 p-5 rounded-2xl border border-slate-200/60 dark:border-navy-800">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Subject
              </label>
              <select
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
              >
                {STUDENT_MARKS.map(m => (
                  <option key={m.subjectCode} value={m.subjectCode}>
                    {m.subjectCode} - {m.subjectName} (Internal: {m.totalMarks}/100)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Desired Grade in Final Results
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['A+', 'A', 'B+'] as Array<'A+' | 'A' | 'B+'>).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setDesiredGrade(g)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      desiredGrade === g
                        ? 'bg-amber-500 text-navy-950 border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-3 p-4 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/80 dark:border-navy-800">
            <span className="text-xs text-slate-500">Required End-Sem Examination Score:</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-amber-500">{neededEndSem}</span>
              <span className="text-xs text-slate-400">/ 100 marks</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-2">
              With your current CIE internal score of <strong className="text-slate-900 dark:text-white">{selectedMark.totalMarks}</strong>, scoring at least <strong className="text-amber-500">{neededEndSem}</strong> on the final 100-mark paper guarantees you a grade of <strong>{desiredGrade}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
