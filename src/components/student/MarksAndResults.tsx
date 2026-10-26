import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentMarks } from '../../lib/storageService';
import { 
  Award, 
  TrendingUp, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  BarChart2, 
  RefreshCw,
  BookOpen,
  Info
} from 'lucide-react';

export const MarksAndResults: React.FC = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Target Calculator state
  const [targetSubject, setTargetSubject] = useState<string>('');
  const [desiredGrade, setDesiredGrade] = useState<'A+' | 'A' | 'B+'>('A+');

  const fetchMarks = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const data = await getStudentMarks(user.id);
        setMarks(data);
        if (data.length > 0) {
          setTargetSubject(data[0].subjectCode);
        }
      }
    } catch (e) {
      console.error('Error fetching student marks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [user?.id]);

  const hasData = marks.length > 0;

  // Compute actual aggregate metrics
  const totalScoreSum = marks.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0);
  const averagePercentage = hasData ? Number((totalScoreSum / marks.length).toFixed(1)) : 0;
  // Estimated SGPA out of 10 based on standard GTU percentage conversion
  const estimatedSgpa = hasData ? Math.min(10, Number(((averagePercentage / 10)).toFixed(2))) : 0;

  const selectedMark = marks.find(m => m.subjectCode === targetSubject) || marks[0];

  // Target Calculator formula
  const targetThreshold = desiredGrade === 'A+' ? 90 : desiredGrade === 'A' ? 80 : 70;
  const currentInternal = selectedMark ? (selectedMark.totalMarks || 0) : 0;
  const neededEndSem = selectedMark
    ? Math.max(0, Math.min(100, Math.ceil((targetThreshold - (currentInternal * 0.4)) / 0.6)))
    : 0;

  const handleDownloadReport = () => {
    alert('Academic transcript generated for ' + (user.name || 'Student') + '. In an upcoming update, this will export as a cryptographically signed GTU PDF.');
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-200/80 dark:border-navy-800">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-cyan" />
        <p className="text-xs font-semibold">Loading verified academic assessment records from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Academic Snapshot */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              hasData
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {hasData ? 'Continuous Assessment Published' : 'CIE Assessment Pending'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Continuous Internal Evaluation (CIE)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {user.department || 'Government Polytechnic Ahmedabad'} • Semester {user.semester || 1}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Internal Average</span>
              <p className="text-3xl font-extrabold text-brand-cyan">
                {hasData ? `${averagePercentage}%` : '—'}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {hasData ? (averagePercentage >= 70 ? 'Distinction Pace' : 'Good Standing') : 'Awaiting Marks'}
              </span>
            </div>

            <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated SGPA</span>
              <p className="text-3xl font-extrabold text-white">
                {hasData ? estimatedSgpa.toFixed(2) : '—'}
              </p>
              <span className="text-[10px] text-brand-cyan font-semibold">
                {hasData ? 'CIE Projected' : 'Pending Evaluation'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Info className="w-3.5 h-3.5 text-brand-cyan" />
            <span>
              {hasData 
                ? `${marks.length} courses evaluated by department faculty`
                : 'Evaluation in progress for current academic semester'}
            </span>
          </div>

          {hasData && (
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-1.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Grade Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Internal Marks Table or Empty State */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Course-Wise Internal Assessment Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mid-Semester Tests (60), Quizzes (10), Lab Practical (20), & Attendance Component (10)
            </p>
          </div>
          <button
            onClick={fetchMarks}
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
              No Internal Marks Published Yet
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your professors enter CIE scores into the cloud database after mid-semester evaluations, practical lab sessions, and quizzes are verified. Once submitted, your scores will appear here.
            </p>
          </div>
        ) : (
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
                  <th className="py-3 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 font-medium text-slate-700 dark:text-slate-300">
                {marks.map((m) => (
                  <tr key={m.id || m.subjectCode} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
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
        )}
      </div>

      {/* Target Grade Calculator (Only when marks exist) */}
      {hasData && selectedMark && (
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
                  Target Course
                </label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                >
                  {marks.map(m => (
                    <option key={m.subjectCode} value={m.subjectCode}>
                      {m.subjectCode} - {m.subjectName} (Current CIE: {m.totalMarks}/100)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Desired Grade in Final Examination
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
              <span className="text-xs text-slate-500">Required End-Sem Score:</span>
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
      )}
    </div>
  );
};
