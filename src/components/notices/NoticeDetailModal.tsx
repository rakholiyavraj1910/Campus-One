import React from 'react';
import { Notice } from '../../types';
import { 
  X, 
  Bell, 
  AlertCircle, 
  Download, 
  Calendar, 
  User, 
  Building, 
  Eye, 
  Bookmark, 
  Share2 
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface NoticeDetailModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ notice, onClose }) => {
  const { toggleBookmark, isBookmarked, addNotification } = useNotifications();

  if (!notice) return null;

  const bookmarked = isBookmarked(notice.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addNotification('Link Copied', 'Notice permalink copied to clipboard.', 'alert');
  };

  const handleDownloadAttachment = () => {
    addNotification('Download Started', `Downloading circular attachment: ${notice.attachmentName} (${notice.attachmentSize})`, 'notice');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {notice.isUrgent ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-rose-500 text-white flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Urgent Announcement</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                Official Circular
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
              {notice.category}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleBookmark(notice.id)}
              className={`p-2 rounded-xl text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 ${
                bookmarked ? 'text-brand-cyan' : ''
              }`}
              title="Bookmark Notice"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {notice.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-navy-800 py-3">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-brand-cyan" />
              <span>Published: {notice.date} ({notice.time})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <User className="w-4 h-4 text-blue-500" />
              <span>Authority: <strong className="text-slate-800 dark:text-slate-200">{notice.author}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-amber-500" />
              <span>Target: {notice.department}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{notice.views} student reads</span>
            </div>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line py-2">
            {notice.content}
          </div>

          {/* Attachment Box */}
          {notice.attachmentName && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/80 border border-slate-200/80 dark:border-navy-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {notice.attachmentName}
                  </p>
                  <p className="text-[11px] text-slate-400">PDF Document • {notice.attachmentSize}</p>
                </div>
              </div>

              <button
                onClick={handleDownloadAttachment}
                className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Official GP Ahmedabad Document ID: #{notice.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy-900 text-white dark:bg-slate-800 font-bold hover:bg-navy-800"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
