import React, { useState, useEffect } from 'react';
import { DepartmentInfo, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  getDepartments, 
  getStudents, 
  getFacultyList, 
  updateDepartment 
} from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Building2, 
  Search, 
  Users, 
  BookOpen, 
  Mail, 
  Calendar, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  ChevronRight, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface ManageDepartmentsProps {
  onFilterStudents?: (dept: string) => void;
  onFilterFaculty?: (dept: string) => void;
  onFilterNotices?: (dept: string) => void;
}

export const ManageDepartments: React.FC<ManageDepartmentsProps> = ({
  onFilterStudents = () => {},
  onFilterFaculty = () => {},
  onFilterNotices = () => {}
}) => {
  const { addNotification } = useNotifications();
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [deptStats, setDeptStats] = useState<Record<string, { students: number; faculty: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  
  // Edit Modal State
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [hodName, setHodName] = useState<string>('');
  const [hodEmail, setHodEmail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vision, setVision] = useState<string>('');
  const [labsString, setLabsString] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, studentList, facultyList] = await Promise.all([
        getDepartments(),
        getStudents(),
        getFacultyList()
      ]);

      setDepartments(deptList);

      // Compute actual student and faculty counts per department from database records
      const counts: Record<string, { students: number; faculty: number }> = {};
      
      deptList.forEach(d => {
        counts[d.name] = { students: 0, faculty: 0 };
      });

      studentList.forEach(s => {
        if (s.department && counts[s.department]) {
          counts[s.department].students++;
        }
      });

      facultyList.forEach(f => {
        if (f.department && counts[f.department]) {
          counts[f.department].faculty++;
        }
      });

      setDeptStats(counts);
    } catch (e) {
      console.error('Failed to load department metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (d: DepartmentInfo) => {
    setEditingDept(d);
    setHodName(d.hodName || '');
    setHodEmail(d.hodEmail || '');
    setDescription(d.description || '');
    setVision(d.vision || '');
    setLabsString((d.labs || []).join(', '));
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    setIsSaving(true);
    try {
      const updatedItem: DepartmentInfo = {
        ...editingDept,
        hodName: hodName.trim(),
        hodEmail: hodEmail.trim(),
        description: description.trim(),
        vision: vision.trim(),
        labs: labsString.split(',').map(l => l.trim()).filter(Boolean)
      };

      await updateDepartment(updatedItem);
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? updatedItem : d));
      addNotification('Department Updated', `Updated governance records for ${updatedItem.name}.`, 'notice');
      setEditingDept(null);
    } catch (err: any) {
      addNotification('Update Failed', err.message || 'Could not update department.', 'alert');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = departments.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.hodName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Academic Departments Directory &amp; Governance
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/25">
              14 Official Programs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Government Polytechnic Ahmedabad — Departmental HODs, student allocations, and laboratory infrastructure
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department, code, HOD..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <button
            type="button"
            onClick={loadData}
            className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Reload counts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of 14 Departments */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
          {filtered.map(dept => {
            const stats = deptStats[dept.name] || { students: 0, faculty: 0 };

            return (
              <div
                key={dept.id || dept.code}
                className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-all group"
              >
                <div>
                  {/* Top Bar with Department Code badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                      {dept.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(dept)}
                      className="text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title="Edit department records"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {dept.description || 'Polytechnic diploma engineering curriculum and laboratories.'}
                  </p>

                  {/* HOD & Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400">Head of Dept:</span>
                      <span className="font-bold truncate max-w-[160px]">{dept.hodName}</span>
                    </div>
                    {dept.hodEmail && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] text-slate-400">Contact:</span>
                        <span className="font-mono text-[11px] text-brand-cyan truncate max-w-[160px]">{dept.hodEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Live Database Headcount Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                      <p className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Students</p>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {stats.students}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Faculty</p>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {stats.faculty}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Action Links */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onFilterStudents(dept.name)}
                    className="text-[11px] font-bold text-slate-500 hover:text-brand-cyan dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    Filter Students &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterFaculty(dept.name)}
                    className="text-[11px] font-bold text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Filter Faculty &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-navy-800 space-y-2">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-navy-700" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No departments match your query</h4>
          <p className="text-xs text-slate-400">Clear your search filter to display all 14 authorized programs.</p>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up">
            <button
              type="button"
              onClick={() => setEditingDept(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit Department Records
                </h3>
                <p className="text-xs text-slate-400">{editingDept.name} ({editingDept.code})</p>
              </div>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    required
                    value={hodName}
                    onChange={(e) => setHodName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    HOD Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={hodEmail}
                    onChange={(e) => setHodEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Overview &amp; Curriculum Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Vision Statement
                </label>
                <textarea
                  rows={2}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Laboratories &amp; Workshops (Comma Separated)
                </label>
                <input
                  type="text"
                  value={labsString}
                  onChange={(e) => setLabsString(e.target.value)}
                  placeholder="CAD Lab, Robotics Cell, IC Engines Lab"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-navy-950 cursor-pointer disabled:opacity-50 btn-tactile"
                >
                  {isSaving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
