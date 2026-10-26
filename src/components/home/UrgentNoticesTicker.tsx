import React, { useState } from 'react';
import { Notice } from '../../types';
import { 
  Bell, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  Eye, 
  Calendar, 
  ExternalLink,
  Bookmark
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { incrementNoticeViews } from '../../lib/storageService';

interface UrgentNoticesTickerProps {
  notices: Notice[];
  onNavigate: (page: string, subTab?: string, noticeId?: string) => void;
  onOpenNotice: (notice: Notice) => void;
}

export const UrgentNoticesTicker: React.FC<UrgentNoticesTickerProps> = ({
  notices,
  onNavigate,
  onOpenNotice
}) => {
  const { toggleBookmark, isBookmarked, addNotification } = useNotifications();

  // Top 4 notices, with urgent prioritized
  const displayNotices = [...notices].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }).slice(0, 4);

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <AlertCircle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Important Announcements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official circulars & exam notifications
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('notices')}
          className="text-xs font-bold text-brand-cyan hover:underline flex items-center space-x-1"
        >
          <span>All Notices</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {displayNotices.map((notice) => {
          const bookmarked = isBookmarked(notice.id);

          return (
            <div
              key={notice.id}
              className={`p-4 rounded-2xl border transition-all hover:border-brand-cyan/50 ${
                notice.isUrgent
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                  : 'border-slate-200/70 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-800/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  {notice.isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500 text-white flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Urgent</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-navy-700 text-slate-700 dark:text-slate-300">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {notice.date}
                  </span>
                </div>

                <button
                  onClick={() => toggleBookmark(notice.id)}
                  className={`p-1 rounded-lg text-slate-400 hover:text-brand-cyan transition-colors ${
                    bookmarked ? 'text-brand-cyan fill-brand-cyan' : ''
                  }`}
                  title="Bookmark notice"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h4 
                onClick={() => onOpenNotice(notice)}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:text-brand-cyan transition-colors line-clamp-2"
              >
                {notice.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {notice.content}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-navy-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">By: {notice.author}</span>

                <div className="flex items-center space-x-2">
                  {notice.attachmentName && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addNotification(
                          'Attachment Download',
                          `Downloading official circular attachment: ${notice.attachmentName}`,
                          'notice'
                        );
                      }}
                      className="inline-flex items-center space-x-1 text-brand-cyan font-semibold hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      <span>{notice.attachmentSize}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenNotice(notice)}
                    className="text-slate-700 dark:text-slate-300 font-bold hover:text-brand-cyan"
                  >
                    Read &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
