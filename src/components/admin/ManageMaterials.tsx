import React, { useState } from 'react';
import { StudyMaterial } from '../../types';
import { INITIAL_STUDY_MATERIALS } from '../../lib/mockData';
import { getStudyMaterials, addStudyMaterial, deleteStudyMaterial } from '../../lib/storageService';
import { FileText, Plus, Trash2, X, Download, Upload } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const ManageMaterials: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_materials_v1');
      return saved ? JSON.parse(saved) : INITIAL_STUDY_MATERIALS;
    } catch (e) {
      return INITIAL_STUDY_MATERIALS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS601');
  const [subjectName, setSubjectName] = useState('Distributed Systems');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(6);
  const [type, setType] = useState<StudyMaterial['type']>('Notes');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [fileSize, setFileSize] = useState('2.4 MB');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    await addStudyMaterial({
      title,
      subjectCode,
      subjectName,
      department,
      semester: Number(semester),
      type,
      year: '2026',
      uploadedBy: user.name,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize,
      fileFormat,
      fileUrl: '#',
    });

    setMaterials(await getStudyMaterials());
    setIsModalOpen(false);
    addNotification('Study Document Uploaded', `Uploaded: ${title}`, 'notice');
  };

  const handleDelete = async (id: string, matTitle: string) => {
    if (confirm(`Delete document "${matTitle}"?`)) {
      await deleteStudyMaterial(id);
      setMaterials(await getStudyMaterials());
      addNotification('Document Deleted', `Removed ${matTitle}`, 'alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Repository Document & Note Management
          </h3>
          <p className="text-xs text-slate-400">Upload syllabus revisions, question papers, and lab manuals</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Title & Subject</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Sem & Dept</th>
                <th className="py-3 px-3">Format / Size</th>
                <th className="py-3 px-3">Downloads</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{m.title}</p>
                    <p className="text-[11px] font-mono text-brand-cyan">{m.subjectCode} • {m.subjectName}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {m.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[11px]">
                    Sem {m.semester} ({m.department.split(' ')[0]})
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {m.fileFormat} • {m.fileSize}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {m.downloadsCount}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id, m.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-navy-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-brand-cyan" />
                <span>Upload Study Resource</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Unit 1-4 Complete Notes"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    <option value="Notes">Notes</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Question Paper">Question Paper</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">File Format</label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="ZIP">ZIP</option>
                    <option value="DOCX">DOCX</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold shadow-md"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
