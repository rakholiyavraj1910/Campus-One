import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Upload, 
  Paperclip, 
  Clock, 
  Calendar, 
  FileText, 
  RefreshCw,
  Eye,
  Send,
  Save,
  Sparkles
} from 'lucide-react';
import { Notice, UserProfile, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  getNotices, 
  addNotice, 
  updateNotice, 
  deleteNotice, 
  uploadNoticeAttachment 
} from '../../lib/storageService';
import { ConfirmationModal } from '../admin/ConfirmationModal';

interface FacultyNoticesProps {
  user: UserProfile;
  onRefreshAll?: () => void;
}

export const FacultyNotices: React.FC<FacultyNoticesProps> = ({
  user,
  onRefreshAll = () => {}
}) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'dept' | 'urgent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingAttachment, setUploadingAttachment] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<Notice['category']>('Academic');
  const [formDepartment, setFormDepartment] = useState<string>(user.department || 'Computer Engineering');
  const [formSemester, setFormSemester] = useState<string>('All');
  const [formAudience, setFormAudience] = useState<'All' | 'Students' | 'Faculty' | 'Department'>('All');
  const [formContent, setFormContent] = useState<string>('');
  const [formIsUrgent, setFormIsUrgent] = useState<boolean>(false);
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formAttachmentSize, setFormAttachmentSize] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');

  const loadAllNotices = async () => {
    try {
      const data = await getNotices();
      setNotices(data || []);
    } catch (e: any) {
      console.error('Failed to load notices:', e);
      setAlertNotice({ type: 'error', message: 'Failed to load notices: ' + (e?.message || 'Error') });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllNotices();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllNotices();
    onRefreshAll();
  };

  // Filtered Notices
  const filteredNotices = notices.filter((n) => {
    if (filterType === 'mine') {
      const isMine = (n.createdBy && n.createdBy === user.id) || 
                     (n.author && n.author.toLowerCase() === user.name.toLowerCase());
      if (!isMine) return false;
    } else if (filterType === 'dept') {
      if (n.department !== user.department && n.department !== 'All') return false;
    } else if (filterType === 'urgent') {
      if (!n.isUrgent) return false;
    }

    if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match = n.title.toLowerCase().includes(q) ||
                    n.content.toLowerCase().includes(q) ||
                    (n.author && n.author.toLowerCase().includes(q)) ||
                    (n.department && n.department.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormCategory('Academic');
    setFormDepartment(user.department || 'Computer Engineering');
    setFormSemester('All');
    setFormAudience('All');
    setFormContent('');
    setFormIsUrgent(false);
    setFormAttachmentName('');
    setFormAttachmentSize('');
    setFormAttachmentUrl('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormCategory(notice.category);
    setFormDepartment(notice.department || user.department || 'All');
    setFormSemester(String(notice.semester || 'All'));
    setFormAudience(notice.targetAudience || 'All');
    setFormContent(notice.content);
    setFormIsUrgent(Boolean(notice.isUrgent));
    setFormAttachmentName(notice.attachmentName || '');
    setFormAttachmentSize(notice.attachmentSize || '');
    setFormAttachmentUrl(notice.attachmentUrl || '');
    setIsCreateModalOpen(true);
  };

  // Real Attachment File Upload to Supabase Storage
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    try {
      const uploaded = await uploadNoticeAttachment(user.id, file);
      setFormAttachmentName(uploaded.fileName);
      setFormAttachmentSize(uploaded.fileSize);
      setFormAttachmentUrl(uploaded.publicUrl);
      setAlertNotice({ type: 'success', message: `Attachment "${file.name}" uploaded successfully.` });
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Attachment upload failed.' });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSaveNotice = async (statusToSave: 'Published' | 'Draft') => {
    if (!formTitle.trim()) {
      setAlertNotice({ type: 'error', message: 'Notice title is required.' });
      return;
    }
    if (!formContent.trim()) {
      setAlertNotice({ type: 'error', message: 'Notice content cannot be empty.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNotice) {
        // Update existing notice
        const updated = await updateNotice({
          ...editingNotice,
          title: formTitle.trim(),
          category: formCategory,
          department: formDepartment,
          semester: formSemester === 'All' ? 'All' : Number(formSemester),
          content: formContent.trim(),
          isUrgent: formIsUrgent,
          attachmentName: formAttachmentName || undefined,
          attachmentSize: formAttachmentSize || undefined,
          attachmentUrl: formAttachmentUrl || undefined,
          status: statusToSave,
          targetAudience: formAudience
        });

        setNotices(prev => prev.map(n => n.id === updated.id ? { ...n, ...updated } : n));
        setAlertNotice({ type: 'success', message: `Notice "${formTitle}" updated successfully.` });
      } else {
        // Create new notice
        const added = await addNotice({
          title: formTitle.trim(),
          category: formCategory,
          department: formDepartment,
          semester: formSemester === 'All' ? 'All' : Number(formSemester),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: `Prof. ${user.name}`,
          authorRole: user.designation || 'Faculty Member',
          isUrgent: formIsUrgent,
          content: formContent.trim(),
          attachmentName: formAttachmentName || undefined,
          attachmentSize: formAttachmentSize || undefined,
          attachmentUrl: formAttachmentUrl || undefined,
          createdBy: user.id,
          status: statusToSave,
          targetAudience: formAudience
        });

        setNotices(prev => [added, ...prev]);
        setAlertNotice({
          type: 'success',
          message: statusToSave === 'Published' 
            ? `Notice "${formTitle}" published successfully. It is now live in the Student Portal.`
            : `Notice "${formTitle}" saved as draft.`
        });
      }

      setIsCreateModalOpen(false);
      onRefreshAll();
    } catch (err: any) {
      console.error('Failed to save notice:', err);
      setAlertNotice({ type: 'error', message: err.message || 'Failed to persist notice to database.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingNotice) return;
    setIsDeleting(true);
    try {
      await deleteNotice(deletingNotice.id);
      setNotices(prev => prev.filter(n => n.id !== deletingNotice.id));
      setDeletingNotice(null);
      setAlertNotice({ type: 'success', message: 'Notice deleted from database.' });
      onRefreshAll();
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Failed to delete notice.' });
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
              placeholder="Search circulars by title, author, or content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
              title="Refresh notices"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">Filter:</span>
          
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterType === 'all' 
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Notices ({notices.length})
          </button>

          <button
            onClick={() => setFilterType('mine')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterType === 'mine' 
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            My Published Notices
          </button>

          <button
            onClick={() => setFilterType('dept')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterType === 'dept' 
                ? 'bg-navy-900 text-white dark:bg-teal-500 dark:text-navy-950'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            My Department ({user.department || 'General'})
          </button>

          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
              filterType === 'urgent' 
                ? 'bg-rose-500 text-white'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300'
            }`}
          >
            Urgent Alerts
          </button>

          <div className="ml-auto flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Examination">Examination</option>
              <option value="Administrative">Administrative</option>
              <option value="Event">Event</option>
              <option value="Placement">Placement</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
            <p className="text-xs">Loading institutional circulars...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700 mb-1" />
            <p className="font-extrabold text-sm text-navy-950 dark:text-white">No notices found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No circulars match the selected filter. Click "Publish Notice" to broadcast a new announcement.
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isMine = (notice.createdBy && notice.createdBy === user.id) || 
                           (notice.author && notice.author.toLowerCase() === user.name.toLowerCase());
            const isDraft = notice.status === 'Draft';

            return (
              <div
                key={notice.id}
                className={`p-5 rounded-3xl bg-white dark:bg-navy-900 border transition-all ${
                  notice.isUrgent 
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : 'border-slate-200/80 dark:border-navy-800'
                } hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                        Urgent
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                      {notice.category}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Dept: {notice.department}
                    </span>

                    {notice.semester && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Sem: {notice.semester}
                      </span>
                    )}

                    {isDraft ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Draft
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Published
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-navy-950 dark:text-white">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
                    <span>By: <strong className="text-slate-600 dark:text-slate-300">{notice.author}</strong></span>
                    <span>• {notice.date} at {notice.time}</span>
                    <span>• {notice.views} views</span>
                    {notice.attachmentName && (
                      <a
                        href={notice.attachmentUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{notice.attachmentName} ({notice.attachmentSize || 'PDF'})</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Faculty Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {isMine && (
                    <>
                      <button
                        onClick={() => openEditModal(notice)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Edit Notice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingNotice(notice)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT NOTICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-navy-950 dark:text-white">
                    {editingNotice ? 'Edit Circular Notice' : 'Publish New Department Notice'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved directly to PostgreSQL and live for targeted students
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Mid-Semester Exam Schedule, Project Submission Deadline..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Event">Event</option>
                    <option value="Placement">Placement</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    <option value={user.department || 'Computer Engineering'}>
                      My Department ({user.department || 'Computer Engineering'})
                    </option>
                    <option value="All">All 14 Engineering Departments</option>
                    {COLLEGE_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    <option value="All">All Semesters (1 to 8)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white font-medium"
                  >
                    <option value="All">All (Students &amp; Faculty)</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Content &amp; Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Type the full announcement or circular text..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Attachment File Upload to Supabase Storage */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    File Attachment (Supabase Storage)
                  </span>
                  {uploadingAttachment && (
                    <span className="text-[11px] text-teal-400 font-bold flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Uploading file...</span>
                    </span>
                  )}
                </div>

                {formAttachmentName ? (
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-teal-300">
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="w-4 h-4 shrink-0" />
                      <span className="font-bold truncate">{formAttachmentName}</span>
                      <span className="text-[10px] opacity-75">({formAttachmentSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentName('');
                        setFormAttachmentSize('');
                        setFormAttachmentUrl('');
                      }}
                      className="p-1 hover:text-white"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-3 flex items-center justify-center space-x-2 text-slate-500 hover:border-teal-500 hover:text-teal-400 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Attach document (PDF, DOCX, IMG)</span>
                    <input
                      type="file"
                      onChange={handleAttachmentUpload}
                      disabled={uploadingAttachment}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Urgent Priority Checkbox */}
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsUrgent}
                  onChange={(e) => setFormIsUrgent(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Mark as High-Priority Urgent Notice (Highlights banner in Student Portal)
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || uploadingAttachment}
                  onClick={() => handleSaveNotice('Draft')}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || uploadingAttachment}
                  onClick={() => handleSaveNotice('Published')}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-navy-950 font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingNotice && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Notice Circular"
          message={`Are you sure you want to delete "${deletingNotice.title}"? This notice will be permanently removed from the Supabase database.`}
          confirmLabel="Yes, Delete Notice"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingNotice(null)}
        />
      )}
    </div>
  );
};
