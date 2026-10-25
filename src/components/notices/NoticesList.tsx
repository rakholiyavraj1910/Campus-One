import React, { useState } from 'react';
import { Notice } from '../../types';
import { 
  Bell, 
  Search, 
  Filter, 
  AlertCircle, 
  Download, 
  Calendar, 
  Building, 
  Eye, 
  Bookmark, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { incrementNoticeViews } from '../../lib/storageService';

interface NoticesListProps {
  notices: Notice[];
  onOpenNotice: (notice: Notice) => void;
}

export const NoticesList: React.FC<NoticesListProps> = ({ notices, onOpenNotice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'urgent' | 'views'>('latest');
  const { toggleBookmark, isBookmarked } = useNotifications();

  const categories = ['All', 'Academic', 'Examination', 'Placement', 'Events', 'Sports', 'General'];

  const filteredNotices = notices.filter(n => {
    if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;
    if (deptFilter !== 'All' && n.department !== 'All' && !n.department.includes(deptFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'urgent') {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
    }
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Official College Communications
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Notice Board & Circulars
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time announcements from the Principal, Dean, Exam Controller & Placements
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars, exams, keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 font-bold text-slate-800 dark:text-white focus:outline-none"
          >
            <option value="latest">Latest Published</option>
            <option value="urgent">Urgent First</option>
            <option value="views">Most Read</option>
          </select>
        </div>
      </div>

      {/* Notices Grid / Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-brand-cyan" />
            <p className="text-sm font-semibold">No circulars match your search filter</p>
          </div>
        ) : (
          filteredNotices.map((n) => {
            const bookmarked = isBookmarked(n.id);

            return (
              <div
                key={n.id}
                onClick={() => {
                  incrementNoticeViews(n.id);
                  onOpenNotice(n);
                }}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-card-hover group ${
                  n.isUrgent
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200/80 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-brand-cyan/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      {n.isUrgent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500 text-white flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>Urgent</span>
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        {n.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {n.date}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(n.id);
                      }}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan transition-colors ${
                        bookmarked ? 'text-brand-cyan' : ''
                      }`}
                      title="Bookmark notice"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors leading-snug">
                    {n.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {n.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span>Issued: <strong className="text-slate-800 dark:text-slate-200">{n.author}</strong></span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>{n.views}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {n.attachmentName && (
                      <span className="text-brand-cyan font-bold flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{n.attachmentSize}</span>
                      </span>
                    )}
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-cyan">
                      Read &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
