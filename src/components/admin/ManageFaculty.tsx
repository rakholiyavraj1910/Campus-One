import React, { useState } from 'react';
import { FacultyMember } from '../../types';
import { INITIAL_FACULTY } from '../../lib/mockData';
import { getFacultyList, addFacultyMember, updateFacultyMember, deleteFacultyMember } from '../../lib/storageService';
import { Users, Plus, Trash2, Edit3, X, Mail, Phone, MapPin, Award } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const ManageFaculty: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_faculty_v1');
      return saved ? JSON.parse(saved) : INITIAL_FACULTY;
    } catch (e) {
      return INITIAL_FACULTY;
    }
  });

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingFac, setEditingFac] = useState<FacultyMember | null>(null);
  const { addNotification } = useNotifications();

  // Form states
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [qualification, setQualification] = useState('Ph.D. (IIT Bombay)');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [cabin, setCabin] = useState('Tech Tower, Room 305');
  const [consultationHours, setConsultationHours] = useState('Mon & Wed: 02:00 PM - 04:00 PM');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  const openCreate = () => {
    setName('');
    setDesignation('Assistant Professor');
    setDepartment('Computer Science & Engineering');
    setQualification('Ph.D. in Computer Science');
    setEmail('faculty@campusone.edu');
    setCabin('Tech Tower, Room 305');
    setConsultationHours('Tue & Thu: 02:00 PM - 04:00 PM');
    setEditingFac(null);
    setModalMode('create');
  };

  const openEdit = (f: FacultyMember) => {
    setEditingFac(f);
    setName(f.name);
    setDesignation(f.designation);
    setDepartment(f.department);
    setQualification(f.qualification);
    setEmail(f.email);
    setPhone(f.phone);
    setCabin(f.cabin);
    setConsultationHours(f.consultationHours);
    setAvatar(f.avatar);
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const created = await addFacultyMember({
        name,
        designation,
        department,
        qualification,
        experienceYears: 10,
        email,
        phone,
        cabin,
        consultationHours,
        specialization: ['Computing', 'Algorithms'],
        subjectsTaught: ['CS601', 'CS602'],
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        researchPapersCount: 15,
      });
      setFacultyList(await getFacultyList());
      addNotification('Faculty Profile Added', `Added ${name} to ${department}.`, 'alert');
    } else if (modalMode === 'edit' && editingFac) {
      await updateFacultyMember({
        ...editingFac,
        name,
        designation,
        department,
        qualification,
        email,
        phone,
        cabin,
        consultationHours,
        avatar,
      });
      setFacultyList(await getFacultyList());
      addNotification('Faculty Profile Updated', `Updated profile for ${name}.`, 'notice');
    }

    setModalMode(null);
  };

  const handleDelete = async (id: string, facName: string) => {
    if (confirm(`Remove faculty member ${facName}?`)) {
      await deleteFacultyMember(id);
      setFacultyList(await getFacultyList());
      addNotification('Faculty Removed', `Removed ${facName} from directory.`, 'alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Manage Faculty & Academic Directory
          </h3>
          <p className="text-xs text-slate-400">Update designations, cabins, consultation hours, and emails</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Cabin</th>
                <th className="py-3 px-3">Email & Phone</th>
                <th className="py-3 px-3">Office Hours</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {facultyList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{f.name}</p>
                        <p className="text-[11px] text-brand-cyan">{f.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">{f.department}</td>
                  <td className="py-3.5 px-3 font-medium">{f.cabin}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-mono text-[11px]">{f.email}</p>
                    <p className="text-[10px] text-slate-400">{f.phone}</p>
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-500">{f.consultationHours}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEdit(f)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-800"
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

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-navy-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Add Faculty Member' : 'Edit Faculty Member'}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Radhika Sen"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & Data Science">AI & DS</option>
                    <option value="Electronics & Telecommunications">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cabin Location</label>
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="Tech Tower, Room 402"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Hours</label>
                <input
                  type="text"
                  value={consultationHours}
                  onChange={(e) => setConsultationHours(e.target.value)}
                  placeholder="Tue & Thu: 02:00 PM - 04:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold shadow-md"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
