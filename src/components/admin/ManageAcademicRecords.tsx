import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  BookOpen, 
  Calendar, 
  Users, 
  FileText, 
  RefreshCw, 
  Search, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { AttendanceSession, StudyMaterial, COLLEGE_DEPARTMENTS } from '../../types';
import { getAttendanceSessions, getStudyMaterials } from '../../lib/storageService';
import { ManageMaterials } from './ManageMaterials';

export const ManageAcademicRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'materials'>('attendance');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Filters
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const loadData = async () => {
    try {
      const [fetchedSessions, fetchedMaterials] = await Promise.all([
        getAttendanceSessions().catch(() => []),
        getStudyMaterials().catch(() => [])
      ]);
      setSessions(fetchedSessions || []);
      setMaterials(fetchedMaterials || []);
    } catch (e) {
      console.error('Failed to load academic records:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredSessions = sessions.filter(s => {
    if (deptFilter !== 'All' && s.department !== deptFilter) return false;
    if (semesterFilter !== 'All' && s.semester !== Number(semesterFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (s.subjectName && s.subjectName.toLowerCase().includes(q)) ||
                    (s.subjectCode && s.subjectCode.toLowerCase().includes(q)) ||
                    (s.facultyName && s.facultyName.toLowerCase().includes(q)) ||
                    (s.topic && s.topic.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-2 max-w-md">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-teal-500 text-navy-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance Telemetry</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'attendance' ? 'bg-navy-950/30 text-navy-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'materials'
                ? 'bg-teal-500 text-navy-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Materials &amp; Syllabus</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'materials' ? 'bg-navy-950/30 text-navy-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {materials.length}
            </span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center space-x-2 shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {activeTab === 'materials' ? (
        <ManageMaterials />
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by subject code, subject name, topic, or faculty..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white font-medium"
              >
                <option value="All">All 14 Departments</option>
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white font-medium"
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Classroom Attendance Sessions */}
          <div className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0c1220] border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Subject &amp; Code</th>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Class Target</th>
                    <th className="py-3 px-4">Date &amp; Slot</th>
                    <th className="py-3 px-4">Lecture Topic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#090d16]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-400" />
                        <span>Querying attendance telemetry from Supabase...</span>
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 space-y-2">
                        <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="font-extrabold text-sm text-slate-300">No Attendance Sessions Logged Yet</p>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          When faculty members log attendance roll marks through the Faculty Portal, genuine lecture records will appear here in real-time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-white block">{s.subjectName}</span>
                          <span className="font-mono text-[10px] text-teal-400 font-bold">{s.subjectCode}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {s.facultyName || 'Instructional Faculty'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-slate-300">Sem {s.semester} • Div {s.division}</span>
                          <span className="block text-[10px] text-slate-500 line-clamp-1">{s.department}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-slate-300">{s.date}</span>
                          <span className="block text-[10px] text-slate-500">{s.slot}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 line-clamp-2 max-w-xs">
                          {s.topic || 'Regular instructional lecture'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
