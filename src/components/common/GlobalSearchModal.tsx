import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Search, 
  X, 
  Bell, 
  Calendar, 
  User, 
  BookOpen, 
  Building2, 
  FileText, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { 
  INITIAL_NOTICES, 
  INITIAL_EVENTS, 
  INITIAL_FACULTY, 
  INITIAL_STUDY_MATERIALS, 
  INITIAL_FACILITIES,
  INITIAL_DEPARTMENTS 
} from '../../lib/mockData';

interface GlobalSearchModalProps {
  onNavigate: (page: string, subTab?: string, itemId?: string) => void;
}

type SearchCategory = 'all' | 'notices' | 'faculty' | 'events' | 'materials' | 'facilities';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'notices' | 'faculty' | 'events' | 'materials' | 'facilities';
  icon: any;
  targetPage: string;
  targetSubTab?: string;
  badge?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isSearchOpen, setIsSearchOpen } = useNotifications();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Aggregate searchable items
  const allItems: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    // Notices
    INITIAL_NOTICES.forEach(n => {
      list.push({
        id: n.id,
        title: n.title,
        subtitle: `${n.category} • ${n.date} • ${n.author}`,
        category: 'notices',
        icon: Bell,
        targetPage: 'notices',
        badge: n.isUrgent ? 'Urgent' : n.category
      });
    });

    // Faculty
    INITIAL_FACULTY.forEach(f => {
      list.push({
        id: f.id,
        title: f.name,
        subtitle: `${f.designation} • ${f.department} • Cabin: ${f.cabin}`,
        category: 'faculty',
        icon: User,
        targetPage: 'campus',
        targetSubTab: 'faculty',
        badge: f.department.split(' ')[0]
      });
    });

    // Events
    INITIAL_EVENTS.forEach(e => {
      list.push({
        id: e.id,
        title: e.title,
        subtitle: `${e.category} • ${e.date} • Venue: ${e.venue}`,
        category: 'events',
        icon: Calendar,
        targetPage: 'events',
        badge: e.category
      });
    });

    // Study Materials
    INITIAL_STUDY_MATERIALS.forEach(m => {
      list.push({
        id: m.id,
        title: m.title,
        subtitle: `${m.subjectCode} - ${m.subjectName} • ${m.type} (${m.fileFormat})`,
        category: 'materials',
        icon: FileText,
        targetPage: 'student',
        targetSubTab: 'materials',
        badge: m.type
      });
    });

    // Facilities
    INITIAL_FACILITIES.forEach(fac => {
      list.push({
        id: fac.id,
        title: fac.name,
        subtitle: `${fac.location} • Timings: ${fac.timings}`,
        category: 'facilities',
        icon: Building2,
        targetPage: 'campus',
        targetSubTab: 'facilities',
        badge: fac.category
      });
    });

    return list;
  }, []);

  const filteredResults = useMemo(() => {
    return allItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [allItems, selectedCategory, query]);

  // Keyboard navigation within list
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSearchOpen, filteredResults, selectedIndex]);

  const handleSelect = (item: SearchResultItem) => {
    setIsSearchOpen(false);
    onNavigate(item.targetPage, item.targetSubTab, item.id);
  };

  if (!isSearchOpen) return null;

  const quickPills = [
    { label: 'Mid-Sem Exams', q: 'exam' },
    { label: 'Google Drive', q: 'Google' },
    { label: 'Dr. Radhika Sen', q: 'Radhika' },
    { label: 'Central Library', q: 'Library' },
    { label: 'HackNova', q: 'Hackathon' },
    { label: 'Cloud Notes', q: 'Cloud' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-sm p-4 sm:p-6 md:p-20 flex justify-center items-start animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-navy-800">
          <Search className="w-5 h-5 text-brand-cyan shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search campus notices, faculty, courses, events, library, facilities..."
            className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="ml-2 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-navy-700"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-navy-950/50 border-b border-slate-100 dark:border-navy-800 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center">
            <Sparkles className="w-3 h-3 text-brand-cyan mr-1" /> Quick:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              onClick={() => setQuery(pill.q)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:border-brand-cyan hover:text-brand-cyan whitespace-nowrap transition-colors"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 flex items-center space-x-1.5 border-b border-slate-100 dark:border-navy-800 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'notices', label: 'Notices' },
            { id: 'faculty', label: 'Faculty' },
            { id: 'events', label: 'Events' },
            { id: 'materials', label: 'Study Notes & PYQs' },
            { id: 'facilities', label: 'Facilities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as SearchCategory);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-brand-cyan text-navy-950 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-navy-800/50">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30 text-brand-cyan" />
              <p className="text-sm font-medium">No campus records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "Radhika", "Placement", "Exam", or "Library"</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-brand-cyan/10 border-l-4 border-brand-cyan pl-4' 
                      : 'hover:bg-slate-50 dark:hover:bg-navy-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-brand-cyan text-navy-950 font-bold shadow-sm' 
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                            item.badge === 'Urgent'
                              ? 'bg-rose-500/20 text-rose-500'
                              : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-brand-cyan translate-x-1' : 'text-slate-300 dark:text-slate-600'
                  }`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950/80 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span><kbd className="font-mono bg-white dark:bg-navy-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white dark:bg-navy-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700">Enter</kbd> Select</span>
            <span><kbd className="font-mono bg-white dark:bg-navy-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700">ESC</kbd> Close</span>
          </div>
          <span className="text-brand-cyan font-medium">
            {filteredResults.length} records indexed
          </span>
        </div>
      </div>
    </div>
  );
};
