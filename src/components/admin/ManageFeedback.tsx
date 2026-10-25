import React, { useState, useEffect } from 'react';
import { FeedbackItem } from '../../types';
import { getFeedbackList, updateFeedbackStatus } from '../../lib/storageService';
import { MessageSquare, CheckCircle2, Clock, Mail, Search, Check } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const ManageFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    getFeedbackList()
      .then(setFeedback)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: FeedbackItem['status']) => {
    try {
      const updated = await updateFeedbackStatus(id, newStatus);
      setFeedback(updated);
      addNotification('Ticket Status Updated', `Marked as ${newStatus}`, 'notice');
    } catch (e: any) {
      addNotification('Update Failed', e.message, 'alert');
    }
  };

  const filtered = feedback.filter(f => {
    if (statusFilter !== 'All' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Student Inquiries & Grievances Desk
          </h3>
          <p className="text-xs text-slate-400">Review feedback submissions and track resolution workflows</p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          {['All', 'Pending', 'In Review', 'Resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === s
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  item.status === 'Resolved'
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : item.status === 'In Review'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-rose-500/20 text-rose-500'
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "{item.message}"
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center text-[11px] text-slate-400">
                <span>By: <strong className="text-slate-700 dark:text-slate-300">{item.userName}</strong> ({item.userEmail})</span>
                <span>{item.createdAt}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="text-[11px] text-slate-400">Set Status:</span>
              <button
                onClick={() => handleStatusChange(item.id, 'In Review')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100"
              >
                In Review
              </button>
              <button
                onClick={() => handleStatusChange(item.id, 'Resolved')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100"
              >
                Resolved
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
