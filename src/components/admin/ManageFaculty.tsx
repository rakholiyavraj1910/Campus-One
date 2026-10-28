import React, { useState, useEffect } from 'react';
import { FacultyMember, COLLEGE_DEPARTMENTS } from '../../types';
import { 
  getFacultyList, 
  addFacultyMember, 
  updateFacultyMember, 
  deleteFacultyMember 
} from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { ConfirmationModal } from './ConfirmationModal';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Search, 
  RefreshCw, 
  Eye, 
  BookOpen, 
  Clock, 
  Check, 
  FileText
} from 'lucide-react';

const DESIGNATIONS = [
  'Professor & HOD',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Adjunct Faculty',
  'Lecturer',
  'Workshop Superintendent'
];

interface ManageFacultyProps {
  initialDepartmentFilter?: string;
}

export const ManageFaculty: React.FC<ManageFacultyProps> = ({
  initialDepartmentFilter = 'All'
}) => {
  const { addNotification } = useNotifications();
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>(initialDepartmentFilter);
  const [designationFilter, setDesignationFilter] = useState<string>('All');

  // Modals
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<FacultyMember | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<FacultyMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Assistant Professor');
  const [department, setDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);
  const [qualification, setQualification] = useState<string>('M.Tech / Ph.D.');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [cabin, setCabin] = useState<string>('Block A, Room 302');
  const [consultationHours, setConsultationHours] = useState<string>('Mon & Wed: 02:00 PM - 04:00 PM');
  const [specializationStr, setSpecializationStr] = useState<string>('Distributed Systems, Artificial Intelligence');
  const [subjectsStr, setSubjectsStr] = useState<string>('CS301, CS302');
  const [avatar, setAvatar] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const data = await getFacultyList();
      setFacultyList(data);
    } catch (e) {
      console.error('Failed to load faculty:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const openCreate = () => {
    setName('');
    setDesignation('Assistant Professor');
    setDepartment(COLLEGE_DEPARTMENTS[0]);
    setQualification('M.Tech (Engineering)');
    setExperienceYears(6);
    setEmail('faculty@gpahmedabad.ac.in');
    setPhone('+91 98000 12345');
    setCabin('Academic Block, Suite 201');
    setConsultationHours('Tue & Thu: 02:00 PM - 04:00 PM');
    setSpecializationStr('Engineering Systems, CAD/CAM');
    setSubjectsStr('ENG101, ENG102');
    setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');
    setEditingFaculty(null);
    setModalMode('create');
  };

  const openEdit = (f: FacultyMember) => {
    setEditingFaculty(f);
    setName(f.name);
    setDesignation(f.designation);
    setDepartment(f.department);
    setQualification(f.qualification);
    setExperienceYears(f.experienceYears || 5);
    setEmail(f.email);
    setPhone(f.phone || '');
    setCabin(f.cabin || '');
    setConsultationHours(f.consultationHours || '');
    setSpecializationStr((f.specialization || []).join(', '));
    setSubjectsStr((f.subjectsTaught || []).join(', '));
    setAvatar(f.avatar || '');
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const specialization = specializationStr.split(',').map(s => s.trim()).filter(Boolean);
      const subjectsTaught = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

      if (modalMode === 'create') {
        const created = await addFacultyMember({
          name: name.trim(),
          designation,
          department,
          qualification: qualification.trim(),
          experienceYears,
          email: email.trim(),
          phone: phone.trim(),
          cabin: cabin.trim(),
          consultationHours: consultationHours.trim(),
          specialization,
          subjectsTaught,
          avatar: avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          researchPapersCount: 5,
        });

        setFacultyList(prev => [created, ...prev]);
        addNotification('Faculty Profile Registered', `Added ${created.name} to ${department}.`, 'notice');
      } else if (modalMode === 'edit' && editingFaculty) {
        const updated = await updateFacultyMember({
          ...editingFaculty,
          name: name.trim(),
          designation,
          department,
          qualification: qualification.trim(),
          experienceYears,
          email: email.trim(),
          phone: phone.trim(),
          cabin: cabin.trim(),
          consultationHours: consultationHours.trim(),
          specialization,
          subjectsTaught,
          avatar: avatar.trim(),
        });

        setFacultyList(prev => prev.map(f => f.id === updated.id ? updated : f));
        if (viewingFaculty?.id === updated.id) setViewingFaculty(updated);
        addNotification('Faculty Profile Saved', `Updated records for ${updated.name}.`, 'notice');
      }

      setModalMode(null);
    } catch (err: any) {
      addNotification('Save Failed', err.message || 'Could not save faculty profile.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    setIsSubmitting(true);

    try {
      await deleteFacultyMember(deletingFaculty.id);
      setFacultyList(prev => prev.filter(f => f.id !== deletingFaculty.id));
      addNotification('Faculty Profile Decommissioned', `Removed ${deletingFaculty.name}.`, 'notice');
      setDeletingFaculty(null);
    } catch (err: any) {
      addNotification('Deletion Failed', err.message || 'Could not delete faculty record.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = facultyList.filter(f => {
    if (deptFilter !== 'All' && f.department !== deptFilter) return false;
    if (designationFilter !== 'All' && f.designation !== designationFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Instructional Faculty Roster &amp; Academic Directory
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
              {facultyList.length} Active Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified academic profiles, research credentials, and office hours across all 14 departments
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchFaculty}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm btn-tactile cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-navy-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty name, email, designation..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {COLLEGE_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Designations</option>
            {DESIGNATIONS.map(des => (
              <option key={des} value={des}>{des}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Faculty Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
          {filtered.map(fac => (
            <div
              key={fac.id}
              className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-navy-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      src={fac.avatar}
                      name={fac.name}
                      role="faculty"
                      size="md"
                      ring={false}
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                        {fac.name}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {fac.designation}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-navy-700 mt-1 inline-block">
                        {fac.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{fac.email}</span>
                  </div>
                  {fac.cabin && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.cabin}</span>
                    </div>
                  )}
                  {fac.qualification && (
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.qualification}</span>
                    </div>
                  )}
                </div>

                {fac.specialization && fac.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-3">
                    {fac.specialization.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[150px]">
                        {s}
                      </span>
                    ))}
                    {fac.specialization.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-bold self-center">
                        +{fac.specialization.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setViewingFaculty(fac)}
                  className="text-slate-500 hover:text-brand-cyan text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(fac)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Edit profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingFaculty(fac)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-500 cursor-pointer"
                    title="Decommission profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-navy-800 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-navy-700" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No faculty records match criteria</h4>
          <p className="text-xs text-slate-400">Click &ldquo;Add Faculty&rdquo; to register new professors or instructors.</p>
        </div>
      )}

      {/* Faculty Dossier Modal */}
      {viewingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up">
            <button
              type="button"
              onClick={() => setViewingFaculty(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <UserAvatar
                src={viewingFaculty.avatar}
                name={viewingFaculty.name}
                role="faculty"
                size="lg"
                ring
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {viewingFaculty.name}
                </h3>
                <p className="text-xs text-emerald-500 font-bold">{viewingFaculty.designation}</p>
                <p className="text-xs text-slate-400">{viewingFaculty.department}</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Official Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate">{viewingFaculty.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone Contact:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{viewingFaculty.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cabin / Office:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingFaculty.cabin || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Consultation Hours:</span>
                <span className="text-slate-800 dark:text-slate-200 truncate">{viewingFaculty.consultationHours || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Qualifications:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingFaculty.qualification}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Teaching Experience:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingFaculty.experienceYears} Years</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-5">
              <button
                type="button"
                onClick={() => { setViewingFaculty(null); openEdit(viewingFaculty); }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs cursor-pointer btn-tactile"
              >
                Edit Faculty Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              {modalMode === 'create' ? 'Register Instructional Faculty Profile' : 'Edit Faculty Record'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (with Honorific)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajeshwar Rao"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {COLLEGE_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {DESIGNATIONS.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@gpahmedabad.ac.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qualifications &amp; Degrees
                  </label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="Ph.D. in Computer Engineering"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Office / Cabin Location
                  </label>
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="Block B, Room 402"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Consultation Hours
                  </label>
                  <input
                    type="text"
                    value={consultationHours}
                    onChange={(e) => setConsultationHours(e.target.value)}
                    placeholder="Mon & Wed: 02:00 PM - 04:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Research Specializations (Comma Separated)
                </label>
                <input
                  type="text"
                  value={specializationStr}
                  onChange={(e) => setSpecializationStr(e.target.value)}
                  placeholder="Artificial Intelligence, Distributed Systems"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-navy-950 cursor-pointer disabled:opacity-50 btn-tactile"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Register Faculty' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(deletingFaculty)}
        title="Decommission Faculty Profile"
        message={`Are you sure you want to remove ${deletingFaculty?.name} (${deletingFaculty?.department}) from the active institutional roster? This action is recorded in security audit logs.`}
        confirmLabel="Decommission"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFaculty(null)}
      />

    </div>
  );
};
