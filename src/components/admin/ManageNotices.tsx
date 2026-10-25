import React, { useState } from 'react';
import { Notice } from '../../types';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  X,
  Sparkles
} from 'lucide-react';
import { addNotice, updateNotice, deleteNotice } from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface ManageNoticesProps {
  notices: Notice[];
  onRefreshNotices: () => void;
}

export const ManageNotices: React.FC<ManageNoticesProps> = ({ notices, onRefreshNotices }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Notice['category']>('Academic');
  const [department, setDepartment] = useState('All');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentSize, setAttachmentSize] = useState('1.2 MB');

  const openCreateModal = () => {
    setTitle('');
    setCategory('Academic');
    setDepartment('All');
    setContent('');
    setIsUrgent(false);
    setAttachmentName('');
    setEditingNotice(null);
    setModalMode('create');
  };

  const openEditModal = (n: Notice) => {
    setEditingNotice(n);
    setTitle(n.title);
    setCategory(n.category);
    setDepartment(n.department);
    setContent(n.content);
    setIsUrgent(n.isUrgent);
    setAttachmentName(n.attachmentName || '');
    setAttachmentSize(n.attachmentSize || '1.0 MB');
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      await addNotice({
        title,
        category,
        department,
        semester: 'All',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: user.name,
        authorRole: user.role === 'admin' ? 'Dean Admin' : 'Faculty In-Charge',
        isUrgent,
        content,
        attachmentName: attachmentName ? attachmentName : undefined,
        attachmentSize: attachmentName ? attachmentSize : undefined,
      });

      addNotification(
        'New Circular Published',
        `Notice "${title}" was published to all campus portals.`,
        isUrgent ? 'alert' : 'notice'
      );
    } else if (modalMode === 'edit' && editingNotice) {
      await updateNotice({
        ...editingNotice,
        title,
        category,
        department,
        isUrgent,
        content,
        attachmentName: attachmentName ? attachmentName : undefined,
        attachmentSize: attachmentName ? attachmentSize : undefined,
      });

      addNotification('Notice Updated', `Changes to "${title}" were saved.`, 'notice');
    }

    setModalMode(null);
    onRefreshNotices();
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (confirm(`Are you sure you want to delete notice "${noticeTitle}"?`)) {
      await deleteNotice(id);
      addNotification('Notice Removed', `Notice "${noticeTitle}" was removed.`, 'alert');
      onRefreshNotices();
    }
  };

  const filtered = notices.filter(n => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.author.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active notices by keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Notice</span>
        </button>
      </div>

      {/* Notices Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Author</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center space-x-2">
                      {n.isUrgent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500 text-white shrink-0">
                          Urgent
                        </span>
                      )}
                      <p className="font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                    </div>
                    {n.attachmentName && (
                      <span className="text-[10px] text-brand-cyan font-mono mt-0.5 block">
                        📎 {n.attachmentName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {n.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-400">
                    {n.department}
                  </td>
                  <td className="py-3.5 px-3 font-medium">
                    {n.author}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                    {n.date}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditModal(n)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800"
                        title="Edit Notice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-brand-cyan" />
                <span>{modalMode === 'create' ? 'Draft & Publish Notice' : 'Edit Notice'}</span>
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Headline / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Final Year Capstone Viva Examination"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notice Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Placement">Placement</option>
                    <option value="Events">Events</option>
                    <option value="Sports">Sports</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & Data Science">AI & DS</option>
                    <option value="Electronics & Telecommunications">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <label htmlFor="urgentNotice" className="font-bold text-rose-500 cursor-pointer">
                  Mark as High Priority / Urgent Announcement (Alerts banner on homepage)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Announcement Content
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed circular text for students and faculty..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Attachment File Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="e.g. Schedule_Nov2026.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={attachmentSize}
                    onChange={(e) => setAttachmentSize(e.target.value)}
                    placeholder="e.g. 1.2 MB"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold shadow-md"
                >
                  {modalMode === 'create' ? 'Publish Circular' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
