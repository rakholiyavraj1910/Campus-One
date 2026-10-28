import React, { useMemo } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bookmark, 
  X, 
  FileText, 
  Bell, 
  Trash2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { INITIAL_NOTICES, INITIAL_STUDY_MATERIALS } from '../../lib/mockData';

interface BookmarksModalProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({ onNavigate }) => {
  const { bookmarks, toggleBookmark, isBookmarksOpen, setIsBookmarksOpen } = useNotifications();

  // Find bookmarked items from notices & study materials
  const savedItems = useMemo(() => {
    const list: Array<{ id: string; title: string; type: string; subtitle: string; page: string; subTab?: string }> = [];

    INITIAL_NOTICES.forEach(n => {
      if (bookmarks.includes(n.id)) {
        list.push({
          id: n.id,
          title: n.title,
          type: 'Notice',
          subtitle: `${n.category} • ${n.date}`,
          page: 'notices'
        });
      }
    });

    INITIAL_STUDY_MATERIALS.forEach(m => {
      if (bookmarks.includes(m.id)) {
        list.push({
          id: m.id,
          title: m.title,
          type: 'Material',
          subtitle: `${m.subjectCode} • ${m.type} (${m.fileFormat})`,
          page: 'student',
          subTab: 'materials'
        });
      }
    });

    return list;
  }, [bookmarks]);

  if (!isBookmarksOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Saved Bookmarks</h3>
              <p className="text-xs text-slate-400">{savedItems.length} resources pinned for quick access</p>
            </div>
          </div>
          <button
            onClick={() => setIsBookmarksOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto momentum-scroll p-4 space-y-2.5">
          {savedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-30 text-brand-cyan" />
              <p className="text-sm font-semibold">No bookmarks saved yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Click the bookmark icon on any notice or study document to pin it here.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700/60 flex items-center justify-between group hover:border-brand-cyan/50 transition-colors"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1 pr-2"
                  onClick={() => {
                    setIsBookmarksOpen(false);
                    onNavigate(item.page, item.subTab);
                  }}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-navy-900 text-brand-cyan shrink-0 shadow-xs">
                    {item.type === 'Notice' ? <Bell className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-cyan transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      <span className="font-semibold text-brand-cyan">{item.type}</span> • {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => {
                      setIsBookmarksOpen(false);
                      onNavigate(item.page, item.subTab);
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-cyan rounded-lg"
                    title="Open Resource"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    title="Remove from Bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 text-center">
          <p className="text-[11px] text-slate-400">
            Bookmarks stay preserved in local storage across browser sessions
          </p>
        </div>
      </div>
    </div>
  );
};
