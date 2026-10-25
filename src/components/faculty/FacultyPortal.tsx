import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FacultyAssignedClass, 
  StudentRosterEntry, 
  AttendanceSession, 
  AssignmentItem,
  Notice 
} from '../../types';
import { 
  getFacultyAssignedClasses, 
  getStudentRoster, 
  getAttendanceSessions, 
  saveAttendanceSession,
  getAssignments,
  addNotice
} from '../../lib/storageService';
import { 
  User, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  FileText, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Send,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { attendanceSessionSchema } from '../../lib/validationSchemas';

export const FacultyPortal: React.FC = () => {
  const { user, role, isFaculty, isAdmin } = useAuth();
  const { addNotification } = useNotifications();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'assignments' | 'announcements' | 'schedule'>('overview');

  // Faculty Assigned Classes
  const assignedClasses = getFacultyAssignedClasses();
  const [selectedClass, setSelectedClass] = useState<FacultyAssignedClass>(assignedClasses[0]);

  // Attendance Entry States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSlot, setAttendanceSlot] = useState('09:00 AM - 10:00 AM');
  const [lectureTopic, setLectureTopic] = useState('Chandy-Lamport Distributed Snapshot Algorithm');
  const [roster, setRoster] = useState<StudentRosterEntry[]>(() => getStudentRoster());
  const [pastSessions, setPastSessions] = useState<AttendanceSession[]>(() => getAttendanceSessions());
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [isAnnounceUrgent, setIsAnnounceUrgent] = useState(false);

  // Authorization Guard: If current active role is NOT faculty or admin
  if (!isFaculty && !isAdmin) {
    return (
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-8 border border-slate-200/80 dark:border-navy-800 text-center space-y-4 max-w-xl mx-auto my-12 shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto font-bold">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Faculty Portal Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You are currently viewing CampusOne under the <strong className="text-slate-800 dark:text-white capitalize">{role}</strong> role. The faculty operations suite requires authorized professor or departmental faculty credentials.
        </p>
        <p className="text-[11px] text-brand-cyan">
          Tip: Use the Interactive Demo Mode banner at the top of the screen to switch to <strong>Faculty (Dr. Radhika Sen)</strong> to test attendance logging, grading, and class rosters.
        </p>
      </div>
    );
  }

  // Toggle student attendance status
  const handleToggleStatus = (studentId: string, newStatus: 'present' | 'absent' | 'late') => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceError(null);

    const validation = attendanceSessionSchema.safeParse({
      subjectCode: selectedClass.subjectCode,
      date: attendanceDate,
      slot: attendanceSlot,
      topic: lectureTopic,
    });

    if (!validation.success) {
      setAttendanceError(validation.error.issues[0]?.message || 'Please check session inputs.');
      return;
    }

    const presentCount = roster.filter(s => s.status === 'present' || s.status === 'late').length;

    const session = saveAttendanceSession(
      {
        facultyName: user.name,
        subjectCode: selectedClass.subjectCode,
        subjectName: selectedClass.subjectName,
        date: attendanceDate,
        slot: attendanceSlot,
        topic: lectureTopic,
        presentCount,
        totalCount: roster.length,
      },
      roster
    );

    setPastSessions(getAttendanceSessions());

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });

    addNotification(
      'Attendance Committed',
      `Session recorded for ${selectedClass.subjectCode}: ${presentCount}/${roster.length} students marked present.`,
      'academic'
    );
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    await addNotice({
      title: `[${selectedClass.subjectCode}] ${announceTitle}`,
      category: 'Academic',
      department: selectedClass.subjectName,
      semester: selectedClass.semester,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: user.name,
      authorRole: 'Course Faculty',
      isUrgent: isAnnounceUrgent,
      content: announceContent,
    });

    addNotification(
      'Course Announcement Broadcasted',
      `Published announcement to ${selectedClass.subjectCode} enrolled students.`,
      isAnnounceUrgent ? 'alert' : 'notice'
    );

    setAnnounceTitle('');
    setAnnounceContent('');
    setIsAnnounceUrgent(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Authorized Faculty Management Suite
            </span>
            <span className="text-xs text-slate-300">Department of Computer Science</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Faculty Teaching & Attendance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Welcome, <strong className="text-white">{user.name}</strong> ({user.designation || 'Associate Professor'}). Manage assigned courses, record class attendance, verify assignments, and mentor students.
          </p>
        </div>

        <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-xs shrink-0 space-y-1">
          <p className="text-slate-400">Assigned Modules:</p>
          <p className="font-bold text-white text-sm">{assignedClasses.length} Courses Active</p>
          <p className="text-brand-cyan text-[11px] font-mono">Cabin: {user.cabin || 'Tech Tower 402'}</p>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Assigned Classes & Overview', icon: BookOpen },
          { id: 'attendance', label: 'Take & Record Attendance', icon: CheckCircle2 },
          { id: 'announcements', label: 'Class Announcements', icon: Send },
          { id: 'schedule', label: 'Teaching Schedule', icon: Calendar },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB: OVERVIEW & ASSIGNED CLASSES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled Scholars</span>
              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">112 Students</p>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center mt-0.5">
                <Users className="w-3 h-3 mr-1" /> Across 3 courses
              </span>
            </div>

            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class Average Attendance</span>
              <p className="text-2xl font-extrabold text-brand-cyan mt-1">91.2%</p>
              <span className="text-[10px] text-brand-cyan font-semibold flex items-center mt-0.5">
                <TrendingUp className="w-3 h-3 mr-1" /> Satisfactory compliance
              </span>
            </div>

            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Next Lecture Slot</span>
              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">09:00 AM</p>
              <span className="text-[10px] text-slate-400 font-medium">CS601 (Tech Tower LH-302)</span>
            </div>
          </div>

          {/* Assigned Classes Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Authorized Course Modules & Class Sections
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-brand-cyan">
                        {cls.subjectCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                        Sem {cls.semester} • {cls.division}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {cls.subjectName}
                    </h4>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Enrolled Students:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{cls.enrolledStudentsCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Room Location:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{cls.room}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Attendance:</span>
                        <strong className="text-emerald-500">{cls.averageAttendancePct}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setActiveTab('attendance');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Take Attendance Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: ATTENDANCE ENTRY (Phase 6 Core Requirement) */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  Live Attendance Register
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  Record Class Attendance Session
                </h3>
              </div>

              <button
                onClick={handleMarkAllPresent}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start sm:self-auto"
              >
                Mark All as Present
              </button>
            </div>

            {attendanceError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{attendanceError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={selectedClass.subjectCode}
                  onChange={(e) => {
                    const found = assignedClasses.find(c => c.subjectCode === e.target.value);
                    if (found) setSelectedClass(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-semibold"
                >
                  {assignedClasses.map(c => (
                    <option key={c.subjectCode} value={c.subjectCode}>
                      {c.subjectCode} - {c.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Session Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class Time Slot</label>
                <input
                  type="text"
                  value={attendanceSlot}
                  onChange={(e) => setAttendanceSlot(e.target.value)}
                  placeholder="09:00 AM - 10:00 AM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Curriculum Topic Covered</label>
                <input
                  type="text"
                  value={lectureTopic}
                  onChange={(e) => setLectureTopic(e.target.value)}
                  placeholder="e.g. Distributed Consensus"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Student Roster Register */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Class Section: {selectedClass.subjectName} ({selectedClass.division})
              </span>
              <span className="text-slate-400">
                Present: <strong className="text-emerald-500">{roster.filter(s => s.status === 'present').length}</strong> | 
                Absent: <strong className="text-rose-500">{roster.filter(s => s.status === 'absent').length}</strong> | 
                Late: <strong className="text-amber-500">{roster.filter(s => s.status === 'late').length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Overall Aggregate</th>
                    <th className="py-3 px-4 text-right">Attendance Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {roster.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-cyan">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {student.email}
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={student.currentAttendancePct < 75 ? 'text-rose-500' : 'text-emerald-500'}>
                          {student.currentAttendancePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, 'present')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              student.status === 'present'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'text-slate-500 hover:text-emerald-600'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, 'late')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              student.status === 'late'
                                ? 'bg-amber-500 text-navy-950 shadow-xs'
                                : 'text-slate-500 hover:text-amber-600'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, 'absent')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                              student.status === 'absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'text-slate-500 hover:text-rose-600'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Authorized entry by {user.name}. Modifications are recorded in audit logs.
              </span>
              <button
                onClick={handleSaveAttendance}
                className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Commit Attendance Session</span>
              </button>
            </div>
          </div>

          {/* Recent Recorded Sessions */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Recently Recorded Attendance Sessions (Audit Tracked)
            </h4>

            <div className="space-y-2">
              {pastSessions.map((ses) => (
                <div
                  key={ses.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-brand-cyan font-mono">{ses.subjectCode}</span>
                    <span className="mx-1">•</span>
                    <strong className="text-slate-900 dark:text-white">{ses.topic}</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ses.date} ({ses.slot})</p>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-bold text-emerald-500">
                      {ses.presentCount} / {ses.totalCount} present
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: BROADCAST COURSE ANNOUNCEMENT */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Targeted Class Communication
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Broadcast Announcement to Enrolled Students
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publishes immediate notice visible on enrolled students' dashboards and notice board
            </p>
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
              <select
                value={selectedClass.subjectCode}
                onChange={(e) => {
                  const found = assignedClasses.find(c => c.subjectCode === e.target.value);
                  if (found) setSelectedClass(found);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-bold"
              >
                {assignedClasses.map(c => (
                  <option key={c.subjectCode} value={c.subjectCode}>
                    {c.subjectCode} - {c.subjectName} (Sem {c.semester} {c.division})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Headline / Subject</label>
              <input
                type="text"
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="e.g. Lab Session venue changed to Tech Tower 404"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="facultyUrgent"
                checked={isAnnounceUrgent}
                onChange={(e) => setIsAnnounceUrgent(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded"
              />
              <label htmlFor="facultyUrgent" className="font-bold text-rose-500 cursor-pointer">
                Mark as urgent circular
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Message</label>
              <textarea
                rows={4}
                value={announceContent}
                onChange={(e) => setAnnounceContent(e.target.value)}
                placeholder="Detailed instructions for students..."
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. TAB: TEACHING SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Weekly Faculty Lecture Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500 text-white">Monday</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">CS601 Distributed Systems</h4>
              <p className="text-xs text-slate-500">09:00 AM - 10:00 AM • Tech Tower LH-302</p>
              <p className="text-xs text-slate-500">11:15 AM - 01:15 PM • AI Lab 404 (NVIDIA)</p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-brand-cyan/10 border border-cyan-200/60 dark:border-cyan-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-cyan text-navy-950">Tuesday</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">CS601 Distributed Systems</h4>
              <p className="text-xs text-slate-500">10:00 AM - 11:00 AM • Tech Tower LH-302</p>
              <p className="text-xs text-brand-cyan font-semibold">Office Hours: 02:00 PM - 04:00 PM</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500 text-white">Wednesday</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">CS608 Capstone Project</h4>
              <p className="text-xs text-slate-500">02:00 PM - 04:00 PM • Project Hub</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
