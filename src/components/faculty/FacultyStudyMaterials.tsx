import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Folder, 
  Sparkles,
  Paperclip
} from 'lucide-react';
import { StudyMaterial, UserProfile, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  getStudyMaterials, 
  addStudyMaterial, 
  updateStudyMaterial, 
  deleteStudyMaterial, 
  uploadStudyMaterialFile 
} from '../../lib/storageService';
import { ConfirmationModal } from '../admin/ConfirmationModal';

interface FacultyStudyMaterialsProps {
  user: UserProfile;
  onRefreshAll?: () => void;
}

export const FacultyStudyMaterials: React.FC<FacultyStudyMaterialsProps> = ({
  user,
  onRefreshAll = () => {}
}) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  
  // Filters
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine' | 'dept'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [semFilter, setSemFilter] = useState<string>('All');

  // Modals & In-Flight States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formSubjectCode, setFormSubjectCode] = useState<string>('CE101');
  const [formSubjectName, setFormSubjectName] = useState<string>('Basics of Computer Systems');
  const [formDepartment, setFormDepartment] = useState<string>(user.department || 'Computer Engineering');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formType, setFormType] = useState<StudyMaterial['type']>('Notes');
  const [formYear, setFormYear] = useState<string>('2025-2026');

  const loadMaterials = async () => {
    try {
      const data = await getStudyMaterials();
      setMaterials(data || []);
    } catch (e: any) {
      console.error('Failed to load study materials:', e);
      setAlertNotice({ type: 'error', message: 'Failed to load materials: ' + (e?.message || 'Error') });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMaterials();
    onRefreshAll();
  };

  const filteredMaterials = materials.filter((m) => {
    if (scopeFilter === 'mine') {
      const isMine = (m.createdBy && m.createdBy === user.id) || 
                     (m.uploadedBy && m.uploadedBy.toLowerCase().includes(user.name.toLowerCase()));
      if (!isMine) return false;
    } else if (scopeFilter === 'dept') {
      if (m.department !== user.department && m.department !== 'All') return false;
    }

    if (typeFilter !== 'All' && m.type !== typeFilter) return false;
    if (semFilter !== 'All' && m.semester !== Number(semFilter)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match = m.title.toLowerCase().includes(q) ||
                    m.subjectCode.toLowerCase().includes(q) ||
                    m.subjectName.toLowerCase().includes(q) ||
                    (m.description && m.description.toLowerCase().includes(q)) ||
                    (m.uploadedBy && m.uploadedBy.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openUploadModal = () => {
    setEditingMaterial(null);
    setFormFile(null);
    setFormTitle('');
    setFormDescription('');
    setFormSubjectCode('CE101');
    setFormSubjectName('Basics of Computer Systems');
    setFormDepartment(user.department || 'Computer Engineering');
    setFormSemester(1);
    setFormType('Notes');
    setFormYear('2025-2026');
    setIsUploadModalOpen(true);
  };

  const openEditModal = (mat: StudyMaterial) => {
    setEditingMaterial(mat);
    setFormFile(null);
    setFormTitle(mat.title);
    setFormDescription(mat.description || '');
    setFormSubjectCode(mat.subjectCode);
    setFormSubjectName(mat.subjectName);
    setFormDepartment(mat.department);
    setFormSemester(mat.semester);
    setFormType(mat.type);
    setFormYear(mat.year || '2025-2026');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      if (!formTitle) {
        // Auto-fill title from filename
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormTitle(cleanTitle);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setAlertNotice({ type: 'error', message: 'Title is required.' });
      return;
    }

    if (!editingMaterial && !formFile) {
      setAlertNotice({ type: 'error', message: 'Please select an academic file to upload.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        // If user selected a replacement file, upload it
        let fileUrl = editingMaterial.fileUrl;
        let fileSize = editingMaterial.fileSize;
        let fileFormat = editingMaterial.fileFormat;
        let storagePath = editingMaterial.storagePath;

        if (formFile) {
          const uploaded = await uploadStudyMaterialFile(user.id, formFile, formSubjectCode.trim());
          fileUrl = uploaded.publicUrl;
          fileSize = uploaded.fileSize;
          fileFormat = uploaded.fileFormat;
          storagePath = uploaded.filePath;
        }

        const updated = await updateStudyMaterial({
          ...editingMaterial,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          subjectCode: formSubjectCode.trim(),
          subjectName: formSubjectName.trim(),
          department: formDepartment,
          semester: Number(formSemester),
          type: formType,
          year: formYear,
          fileUrl,
          fileSize,
          fileFormat,
          storagePath
        });

        setMaterials(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
        setAlertNotice({ type: 'success', message: `Study material "${formTitle}" updated successfully.` });
      } else {
        // Upload file to Supabase Storage
        if (!formFile) throw new Error('No file selected.');
        const uploaded = await uploadStudyMaterialFile(user.id, formFile, formSubjectCode.trim());

        const added = await addStudyMaterial({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          subjectCode: formSubjectCode.trim(),
          subjectName: formSubjectName.trim(),
          department: formDepartment,
          semester: Number(formSemester),
          type: formType,
          year: formYear,
          uploadedBy: `Prof. ${user.name}`,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: uploaded.fileSize,
          fileFormat: uploaded.fileFormat,
          fileUrl: uploaded.publicUrl,
          createdBy: user.id,
          storagePath: uploaded.filePath
        });

        setMaterials(prev => [added, ...prev]);
        setAlertNotice({ type: 'success', message: `Material "${formTitle}" uploaded to Supabase Storage and published.` });
      }

      setIsUploadModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      console.error('Failed to commit study material:', err);
      setAlertNotice({ type: 'error', message: err.message || 'Failed to upload study material.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMaterial) return;
    setIsDeleting(true);
    try {
      await deleteStudyMaterial(deletingMaterial.id);
      setMaterials(prev => prev.filter(m => m.id !== deletingMaterial.id));
      setDeletingMaterial(null);
      setAlertNotice({ type: 'success', message: 'Study material deleted successfully.' });
      onRefreshAll();
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Failed to delete study material.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {alertNotice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
          alertNotice.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold">
            {alertNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{alertNotice.message}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-xs hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials by title, subject code, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
              title="Refresh materials"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>

            <button
              onClick={openUploadModal}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">Scope:</span>

          <button
            onClick={() => setScopeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              scopeFilter === 'all'
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Materials ({materials.length})
          </button>

          <button
            onClick={() => setScopeFilter('mine')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              scopeFilter === 'mine'
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Uploaded by Me
          </button>

          <button
            onClick={() => setScopeFilter('dept')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              scopeFilter === 'dept'
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            My Department ({user.department || 'General'})
          </button>

          <div className="ml-auto flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All Types</option>
              <option value="Notes">Lecture Notes</option>
              <option value="Syllabus">Curriculum / Syllabus</option>
              <option value="Question Paper">PYQ Papers</option>
              <option value="Lab Manual">Lab Manual</option>
              <option value="Reference">Reference Text</option>
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
            <p className="text-xs">Loading study materials from cloud repository...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-1" />
            <p className="font-extrabold text-sm text-navy-950 dark:text-white">No materials found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No academic materials match the current filters. Click "Upload Material" to upload a PDF or notes file.
            </p>
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            const isMine = (mat.createdBy && mat.createdBy === user.id) || 
                           (mat.uploadedBy && mat.uploadedBy.toLowerCase().includes(user.name.toLowerCase()));

            return (
              <div
                key={mat.id}
                className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 transition-all flex flex-col justify-between space-y-4 hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      {mat.subjectCode}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {mat.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-navy-950 dark:text-white line-clamp-2">
                    {mat.title}
                  </h3>

                  {mat.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {mat.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p className="font-semibold text-slate-600 dark:text-slate-300 truncate">
                      {mat.subjectName}
                    </p>
                    <p>Sem {mat.semester} • {mat.department}</p>
                    <p>By {mat.uploadedBy} • {mat.uploadDate}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-slate-400">
                    <span>{mat.fileFormat} • {mat.fileSize}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 transition-colors"
                      title="Download Material"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {isMine && (
                      <>
                        <button
                          onClick={() => openEditModal(mat)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Edit Material"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingMaterial(mat)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 transition-colors"
                          title="Delete Material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD / EDIT STUDY MATERIAL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white">
                    {editingMaterial ? 'Edit Study Material' : 'Upload Academic Study Material'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uploaded directly to Supabase Storage and accessible to students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* File Selection Input */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="block font-bold text-slate-700 dark:text-slate-300">
                  {editingMaterial ? 'Replace File (Optional)' : 'Select Academic File *'}
                </span>

                <label className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 text-slate-500 hover:border-teal-500 hover:text-teal-400 transition-colors cursor-pointer text-center">
                  <Upload className="w-6 h-6 text-teal-500" />
                  <span className="font-semibold text-xs">
                    {formFile ? formFile.name : editingMaterial ? `Current: ${editingMaterial.fileFormat} (${editingMaterial.fileSize}) — Click to replace` : 'Click to select PDF, PPT, DOCX, or ZIP'}
                  </span>
                  {formFile && (
                    <span className="text-[10px] text-teal-400 font-bold">
                      {(formFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                  <input
                    type="file"
                    required={!editingMaterial}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Cloud Architecture Notes, Lab 4 Manual..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Topic Summary
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key concepts covered, syllabus topics, instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value)}
                    placeholder="e.g. CE101, IT402"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    {COLLEGE_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    <option value="Notes">Lecture Notes</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Question Paper">PYQ Paper</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Reference">Reference Text</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingMaterial ? 'Save Changes' : 'Upload & Publish'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMaterial && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Study Material"
          message={`Are you sure you want to delete "${deletingMaterial.title}"? This academic file will be removed from the database and Student Portal.`}
          confirmLabel="Yes, Delete Material"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingMaterial(null)}
        />
      )}
    </div>
  );
};
