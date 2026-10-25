import React, { useState } from 'react';
import { StudyMaterial } from '../../types';
import { INITIAL_STUDY_MATERIALS } from '../../lib/mockData';
import { getStudyMaterials, incrementMaterialDownload } from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FileText, 
  Download, 
  Search, 
  Bookmark, 
  Calendar, 
  User, 
  BookOpen, 
  Sparkles,
  Filter
} from 'lucide-react';

export const StudyMaterialsHub: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_materials_v1');
      return saved ? JSON.parse(saved) : INITIAL_STUDY_MATERIALS;
    } catch (e) {
      return INITIAL_STUDY_MATERIALS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [semFilter, setSemFilter] = useState<string>('All');
  const { toggleBookmark, isBookmarked, addNotification } = useNotifications();

  const filtered = materials.filter(m => {
    if (typeFilter !== 'All' && m.type !== typeFilter) return false;
    if (semFilter !== 'All' && m.semester.toString() !== semFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subjectCode.toLowerCase().includes(q) ||
        m.subjectName.toLowerCase().includes(q) ||
        m.uploadedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownload = (id: string, title: string) => {
    incrementMaterialDownload(id);
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m));
    addNotification('File Download Initiated', `Downloaded: ${title}`, 'notice');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Digital Academic Repository
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Notes, Syllabus & Previous Question Papers (PYQs)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified study resources uploaded by faculty and departmental toppers
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, PYQs, subjects..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Type Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {['All', 'Notes', 'Question Paper', 'Syllabus', 'Lab Manual', 'Reference'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {t === 'Question Paper' ? 'PYQs' : t}
            </button>
          ))}
        </div>

        {/* Semester Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-400 font-semibold mr-1">Semester:</span>
          {['All', '5', '6', '7'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSemFilter(sem)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                semFilter === sem
                  ? 'bg-brand-cyan text-navy-950'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sem === 'All' ? 'All' : `Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-brand-cyan" />
            <p className="text-sm font-semibold">No materials match your query</p>
          </div>
        ) : (
          filtered.map((mat) => {
            const bookmarked = isBookmarked(mat.id);

            return (
              <div
                key={mat.id}
                className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                      {mat.type}
                    </span>
                    <button
                      onClick={() => toggleBookmark(mat.id)}
                      className={`p-1 text-slate-400 hover:text-brand-cyan transition-colors ${
                        bookmarked ? 'text-brand-cyan' : ''
                      }`}
                      title="Bookmark material"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-baseline space-x-1.5 mb-1 text-xs">
                    <span className="font-mono font-bold text-slate-400">{mat.subjectCode}</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">{mat.subjectName}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {mat.title}
                  </h3>

                  <div className="space-y-1.5 mt-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-navy-800">
                    <div className="flex items-center justify-between">
                      <span>Uploaded by:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{mat.uploadedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Format & Size:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {mat.fileFormat} • {mat.fileSize}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Downloads:</span>
                      <span className="text-brand-cyan font-bold">{mat.downloadsCount} times</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800">
                  <button
                    onClick={() => handleDownload(mat.id, mat.title)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-cyan hover:text-navy-950 dark:bg-navy-800 dark:hover:bg-brand-cyan dark:text-white dark:hover:text-navy-950 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {mat.fileFormat}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
