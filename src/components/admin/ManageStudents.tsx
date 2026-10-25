import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { Users, Shield, Edit3, Check, Search, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const DEFAULT_STUDENTS: UserProfile[] = [
  {
    id: 'st-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campusone.edu',
    role: 'student',
    rollNumber: '21CS104',
    prn: '2021016400987654',
    department: 'Computer Science & Engineering',
    semester: 6,
    division: 'Div A',
    cgpa: 8.92,
  },
  {
    id: 'st-2',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@campusone.edu',
    role: 'student',
    rollNumber: '21CS105',
    prn: '2021016400987655',
    department: 'Computer Science & Engineering',
    semester: 6,
    division: 'Div A',
    cgpa: 9.25,
  },
  {
    id: 'st-3',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@campusone.edu',
    role: 'student',
    rollNumber: '21AI042',
    prn: '2021016400987680',
    department: 'Artificial Intelligence & Data Science',
    semester: 6,
    division: 'Div B',
    cgpa: 8.45,
  },
  {
    id: 'st-4',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@campusone.edu',
    role: 'student',
    rollNumber: '21EC019',
    prn: '2021016400987712',
    department: 'Electronics & Telecommunications',
    semester: 6,
    division: 'Div A',
    cgpa: 8.12,
  }
];

export const ManageStudents: React.FC = () => {
  const { addNotification } = useNotifications();

  const [students, setStudents] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_students_directory');
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: UserProfile[] = data.map((d: any) => ({
            id: d.id,
            name: d.name || d.full_name || 'Enrolled Student',
            email: d.email,
            role: d.role as UserRole,
            rollNumber: d.roll_number || 'N/A',
            prn: d.prn || 'N/A',
            department: d.department || 'Computer Science & Engineering',
            semester: d.semester || 6,
            division: d.division || 'Div A',
            cgpa: d.cgpa ? Number(d.cgpa) : 8.5,
          }));
          setStudents(mapped);
          localStorage.setItem('campusone_students_directory', JSON.stringify(mapped));
        }
      });
    }
  }, []);

  const [search, setSearch] = useState('');

  const toggleStudentRole = async (id: string, currentRole: UserRole) => {
    const nextRole: UserRole = currentRole === 'student' ? 'faculty' : 'student';
    const updated = students.map(s => s.id === id ? { ...s, role: nextRole } : s);
    setStudents(updated);
    localStorage.setItem('campusone_students_directory', JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && !id.startsWith('st-')) {
      try {
        await supabase.from('profiles').update({ role: nextRole }).eq('id', id);
      } catch (err: any) {
        console.warn('Failed to sync role change to Supabase profiles:', err);
      }
    }

    addNotification('Access Level Modified', `Role changed for student ID ${id} to ${nextRole.toUpperCase()}`, 'alert');
  };

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.rollNumber && s.rollNumber.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Student Enrollment Directory & Access Control
          </h3>
          <p className="text-xs text-slate-400">View enrolled students, PRN codes, and assign portal privileges</p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or roll no..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student Name & Roll</th>
                <th className="py-3 px-3">PRN Code</th>
                <th className="py-3 px-3">Department & Division</th>
                <th className="py-3 px-3">CGPA</th>
                <th className="py-3 px-3">Portal Role</th>
                <th className="py-3 px-3 text-right">Access Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                    <p className="font-mono text-[11px] text-brand-cyan">{s.rollNumber} • {s.email}</p>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {s.prn}
                  </td>
                  <td className="py-3.5 px-3">
                    <p>{s.department}</p>
                    <p className="text-[10px] text-slate-400">Sem {s.semester} • {s.division}</p>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-emerald-500">
                    {s.cgpa} / 10
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => toggleStudentRole(s.id, s.role)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:text-brand-cyan text-[11px] font-bold"
                    >
                      Toggle Privileges
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
