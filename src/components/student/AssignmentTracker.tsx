import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AssignmentItem } from '../../types';
import { getAssignments, submitAssignmentSolution } from '../../lib/storageService';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Upload, 
  AlertCircle, 
  Calendar, 
  Paperclip,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNotifications } from '../../context/NotificationContext';

export const AssignmentTracker: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const { addNotification } = useNotifications();

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (e) {
      console.error('Error fetching assignments:', e);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filtered = assignments.filter(a => {
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    return true;
  });

  const handleOpenSubmit = (id: string) => {
    setActiveModalId(id);
    const sanitizedName = user?.name ? user.name.replace(/\s+/g, '_') : 'Student';
    const roll = user?.rollNumber || 'Assignment';
    setSelectedFileName(`${sanitizedName}_${roll}_Solution.zip`);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalId) return;

    submitAssignmentSolution(activeModalId, selectedFileName || 'Submission_Archive.zip');
    fetchAssignments();
    setActiveModalId(null);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    addNotification(
      'Assignment Submitted',
      `Your submission was recorded and sent to the faculty portal.`,
      'assignment'
    );
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    return `${diff} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Coursework & Lab Submissions
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Assignment Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of project milestones, problem sets, and laboratory reports
          </p>
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs">
            {['All', 'Pending', 'Submitted'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  filterStatus === s
                    ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAssignments}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
            title="Refresh Assignments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Assignment Cards List or Empty State */}
      {isLoading ? (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-200/80 dark:border-navy-800">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-cyan" />
          <p className="text-xs font-semibold">Loading coursework assignments from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200/80 dark:border-navy-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-white">
            {assignments.length === 0 ? 'No Active Assignments' : 'No Assignments Matching Filter'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {assignments.length === 0
              ? 'Coursework problem sets and laboratory tasks published by your department professors will appear here.'
              : 'Try selecting a different filter option above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 4xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const daysLeft = getDaysRemaining(item.dueDate);
            const isPending = item.status === 'Pending';

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  isPending
                    ? 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-navy-800 hover:border-brand-cyan/50 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-navy-900/40 border-slate-200/60 dark:border-navy-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-brand-cyan">
                      {item.subjectCode} • {item.subjectName}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.instructions}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-navy-800">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned: {item.assignedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-semibold text-rose-500">{item.dueDate} ({daysLeft})</span>
                    </div>
                  </div>
                </div>

                {/* Action / Result */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  {isPending ? (
                    <button
                      onClick={() => handleOpenSubmit(item.id)}
                      className="w-full py-2 px-3 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Solution File</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{item.submittedFile || 'Completed'}</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Score: <strong className="text-brand-cyan">{item.score || 'Under Review'}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-brand-cyan" />
                <span>Upload Assignment Solution</span>
              </h3>
              <button
                onClick={() => setActiveModalId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-6 text-center space-y-2 hover:border-brand-cyan transition-colors bg-slate-50 dark:bg-navy-950/50">
                <Paperclip className="w-8 h-8 mx-auto text-brand-cyan" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select archive or drag files here
                </p>
                <p className="text-[11px] text-slate-400">
                  Accepted formats: .zip, .tar.gz, .pdf, .py, .c, .cpp (Max 25MB)
                </p>
                <input
                  type="text"
                  value={selectedFileName}
                  onChange={(e) => setSelectedFileName(e.target.value)}
                  placeholder="e.g. Solution_Archive.zip"
                  className="w-full mt-2 px-3 py-1.5 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-center font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs font-bold shadow-md"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
