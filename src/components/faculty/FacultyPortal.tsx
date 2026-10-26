import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  UserProfile,
  FacultyAssignedClass, 
  StudentRosterEntry, 
  AttendanceSession, 
  AttendanceStatus,
  AttendanceRecordEntry,
  AssignmentItem,
  Notice,
  StudyMaterial,
  COLLEGE_DEPARTMENTS
} from '../../types';
import { 
  getStudents,
  getAttendanceSessions, 
  saveAttendanceSession,
  getAttendanceRecordsForSession,
  updateAttendanceRecord,
  getAssignments,
  addNotice,
  getStudyMaterials,
  addStudyMaterial,
  saveStudentMarks
} from '../../lib/storageService';
import { StudentDirectory } from './StudentDirectory';
import { StudentProfileView } from './StudentProfileView';
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
  X,
  Award,
  UploadCloud,
  Check,
  Download,
  Search,
  Filter,
  RefreshCw,
  HelpCircle,
  XCircle,
  Eye,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { attendanceSessionSchema } from '../../lib/validationSchemas';

export const FacultyPortal: React.FC = () => {
  const { user, role, isFaculty, isAdmin } = useAuth();
  const { addNotification } = useNotifications();

  // Primary Tab Navigation
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'marks' | 'assignments' | 'materials' | 'announcements'>('directory');

  // Selected Student for Profile View
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // ----------------- ATTENDANCE STATE -----------------
  const [attendanceDept, setAttendanceDept] = useState<string>(user.department || 'Computer Engineering');
  const [attendanceSem, setAttendanceSem] = useState<number>(1);
  const [attendanceDiv, setAttendanceDiv] = useState<string>('A');
  const [subjectCode, setSubjectCode] = useState<string>('CE101');
  const [subjectName, setSubjectName] = useState<string>('Basics of Computer Systems');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceSlot, setAttendanceSlot] = useState<string>('09:00 AM - 10:00 AM');
  const [lectureTopic, setLectureTopic] = useState<string>('');
  
  // Roster loaded from Supabase
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [loadingRoster, setLoadingRoster] = useState<boolean>(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Past Sessions
  const [pastSessions, setPastSessions] = useState<AttendanceSession[]>([]);
  const [loadingPastSessions, setLoadingPastSessions] = useState<boolean>(false);
  const [selectedPastSession, setSelectedPastSession] = useState<AttendanceSession | null>(null);
  const [pastSessionRecords, setPastSessionRecords] = useState<AttendanceRecordEntry[]>([]);
  const [loadingSessionRecords, setLoadingSessionRecords] = useState<boolean>(false);

  // ----------------- MARKS EVALUATION STATE -----------------
  const [marksStudentId, setMarksStudentId] = useState<string>('');
  const [marksSubCode, setMarksSubCode] = useState<string>('CE101');
  const [marksSubName, setMarksSubName] = useState<string>('Basics of Computer Systems');
  const [marksCat1, setMarksCat1] = useState<number>(24);
  const [marksCat2, setMarksCat2] = useState<number>(25);
  const [marksQuiz, setMarksQuiz] = useState<number>(8);
  const [marksLab, setMarksLab] = useState<number>(18);
  const [marksGrade, setMarksGrade] = useState<string>('A');
  const [marksSaving, setMarksSaving] = useState<boolean>(false);
  const [marksSuccessMsg, setMarksSuccessMsg] = useState<string | null>(null);

  // ----------------- ANNOUNCEMENT STATE -----------------
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [isAnnounceUrgent, setIsAnnounceUrgent] = useState(false);

  // ----------------- ASSIGNMENTS & MATERIALS STATE -----------------
  const [courseAssignments, setCourseAssignments] = useState<AssignmentItem[]>([]);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDueDate, setNewAssignDueDate] = useState('');
  const [newAssignMarks, setNewAssignMarks] = useState(25);

  const [materialsList, setMaterialsList] = useState<StudyMaterial[]>([]);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatType, setNewMatType] = useState<'Notes' | 'Syllabus' | 'Question Paper' | 'Lab Manual' | 'Reference'>('Notes');

  // Load Enrolled Students for Selected Class
  const loadClassRoster = async () => {
    setLoadingRoster(true);
    try {
      const students = await getStudents({
        department: attendanceDept,
        semester: attendanceSem,
        division: attendanceDiv,
      });

      const mappedRoster: StudentRosterEntry[] = students.map((s) => ({
        id: s.id,
        rollNumber: s.rollNumber || 'N/A',
        name: s.name,
        email: s.email,
        status: 'present',
      }));

      setRoster(mappedRoster);
    } catch (e) {
      console.error('Error loading class roster:', e);
      setRoster([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Load Past Recorded Attendance Sessions
  const loadPastSessions = async () => {
    setLoadingPastSessions(true);
    try {
      const sessions = await getAttendanceSessions({
        department: attendanceDept,
      });
      setPastSessions(sessions);
    } catch (e) {
      console.error('Error loading past sessions:', e);
      setPastSessions([]);
    } finally {
      setLoadingPastSessions(false);
    }
  };

  useEffect(() => {
    loadClassRoster();
    loadPastSessions();
  }, [attendanceDept, attendanceSem, attendanceDiv]);

  useEffect(() => {
    getAssignments().then(setCourseAssignments);
    getStudyMaterials().then(setMaterialsList);
  }, []);

  // View past session details
  const handleSelectPastSession = async (session: AttendanceSession) => {
    setSelectedPastSession(session);
    setLoadingSessionRecords(true);
    try {
      const records = await getAttendanceRecordsForSession(session.id);
      setPastSessionRecords(records);
    } catch (e) {
      console.error('Error loading session records:', e);
    } finally {
      setLoadingSessionRecords(false);
    }
  };

  // Toggle student status in active roster
  const handleToggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const handleMarkAllAbsent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'absent' })));
  };

  // Save Attendance to Supabase
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceError(null);
    setSaveSuccessMsg(null);

    if (!lectureTopic.trim()) {
      setAttendanceError('Please specify the curriculum lecture topic covered in this session.');
      return;
    }

    if (roster.length === 0) {
      setAttendanceError('Cannot commit attendance for an empty class. Ensure enrolled students are present in this department and semester.');
      return;
    }

    setIsSavingAttendance(true);

    try {
      const savedSession = await saveAttendanceSession(
        {
          facultyId: user.id !== 'guest' ? user.id : undefined,
          facultyName: user.name,
          department: attendanceDept,
          subjectCode: subjectCode.trim(),
          subjectName: subjectName.trim(),
          date: attendanceDate,
          slot: attendanceSlot,
          topic: lectureTopic.trim(),
          semester: attendanceSem,
          division: attendanceDiv,
        },
        roster.map(r => ({
          studentId: r.id,
          studentName: r.name,
          rollNumber: r.rollNumber,
          status: r.status,
        }))
      );

      setIsSavingAttendance(false);
      setSaveSuccessMsg(`Attendance successfully committed for ${subjectCode} (${savedSession.presentCount}/${savedSession.totalCount} present).`);
      setLectureTopic('');
      loadPastSessions();

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 }
      });

      addNotification(
        'Attendance Committed',
        `Recorded session for ${subjectCode} in ${attendanceDept}: ${savedSession.presentCount}/${savedSession.totalCount} marked present.`,
        'academic'
      );
    } catch (err: any) {
      setIsSavingAttendance(false);
      setAttendanceError(err.message || 'Failed to save attendance session to database.');
    }
  };

  // Update a past attendance record
  const handleEditPastRecordStatus = async (recordId: string, newStatus: AttendanceStatus) => {
    try {
      await updateAttendanceRecord(recordId, newStatus, user.name);
      setPastSessionRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
      loadPastSessions();
      addNotification('Record Updated', `Student attendance status updated to ${newStatus}.`, 'academic');
    } catch (e: any) {
      addNotification('Update Failed', e.message, 'alert');
    }
  };

  // Submit Student Marks
  const handleSaveMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarksSuccessMsg(null);
    if (!marksStudentId) {
      addNotification('Grading Required', 'Please select a student from the roster to enter marks.', 'alert');
      return;
    }

    const total = Number(marksCat1) + Number(marksCat2) + Number(marksQuiz) + Number(marksLab);
    setMarksSaving(true);
    try {
      await saveStudentMarks(
        marksStudentId,
        marksSubCode,
        marksSubName,
        {
          internal1: marksCat1,
          internal2: marksCat2,
          quizAverage: marksQuiz,
          labAssignment: marksLab,
          attendanceMarks: 10,
          totalMarks: total,
          grade: marksGrade,
        },
        user.name
      );
      setMarksSaving(false);
      setMarksSuccessMsg(`Marks committed successfully for student. Total score: ${total}/100 (Grade: ${marksGrade}).`);
      addNotification('Marks Recorded', `Assessment marks committed (${total}/100, Grade: ${marksGrade}).`, 'academic');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (e: any) {
      setMarksSaving(false);
      addNotification('Marks Error', e.message || 'Failed to commit marks.', 'alert');
    }
  };

  // Broadcast Course Notice
  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    try {
      await addNotice({
        title: `[${subjectCode}] ${announceTitle}`,
        category: 'Academic',
        department: attendanceDept,
        semester: attendanceSem,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: user.name,
        authorRole: user.designation || 'Course Faculty',
        isUrgent: isAnnounceUrgent,
        content: announceContent,
      });

      addNotification(
        'Course Announcement Published',
        `Broadcasted official circular to ${attendanceDept} semester ${attendanceSem} students.`,
        isAnnounceUrgent ? 'alert' : 'notice'
      );

      setAnnounceTitle('');
      setAnnounceContent('');
      setIsAnnounceUrgent(false);
    } catch (e: any) {
      addNotification('Broadcast Error', e.message || 'Failed to broadcast announcement.', 'alert');
    }
  };

  // Upload Study Material
  const handleUploadMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;

    try {
      const added = await addStudyMaterial({
        title: newMatTitle.trim(),
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        department: attendanceDept,
        semester: attendanceSem,
        type: newMatType,
        year: '2025-2026',
        uploadedBy: user.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: '1.8 MB',
        fileFormat: 'PDF',
        fileUrl: '#'
      });

      setMaterialsList(prev => [added, ...prev]);
      addNotification('Study Material Uploaded', `Published "${newMatTitle}" for ${attendanceDept}.`, 'academic');
      setNewMatTitle('');
    } catch (err: any) {
      addNotification('Upload Error', err.message || 'Failed to upload study material.', 'alert');
    }
  };

  // Security Gate
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
          You are currently viewing CampusOne under the <strong className="text-slate-800 dark:text-white capitalize">{role}</strong> role. The faculty operations suite requires an authorized faculty or institutional administrator account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Institutional Faculty Suite
            </span>
            <span className="text-xs text-slate-300 font-medium">Government Polytechnic Ahmedabad</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Faculty Teaching &amp; Student Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome, <strong className="text-white">{user.name}</strong> ({user.designation || 'Lecturer / Faculty'}). Search enrolled student directories, log verified class attendance, and manage academic performance.
          </p>
        </div>

        <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-xs shrink-0 space-y-1">
          <p className="text-slate-400">Department</p>
          <p className="font-bold text-white text-sm truncate max-w-[200px]">{user.department || 'Computer Engineering'}</p>
          <p className="text-brand-cyan text-[11px] font-mono">Role: {role.toUpperCase()}</p>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'directory', label: 'Student Directory', icon: Users },
          { id: 'attendance', label: 'Record Attendance', icon: CheckCircle2 },
          { id: 'marks', label: 'Marks Evaluation', icon: Award },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'materials', label: 'Study Materials', icon: UploadCloud },
          { id: 'announcements', label: 'Course Circulars', icon: Send },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                if (t.id === 'directory') setSelectedStudent(null);
              }}
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

      {/* 3. TAB: STUDENT DIRECTORY (Requirement 2 & 3) */}
      {activeTab === 'directory' && (
        <div>
          {selectedStudent ? (
            <StudentProfileView
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            <StudentDirectory
              onSelectStudent={(st) => setSelectedStudent(st)}
              defaultDepartment={user.department || 'All'}
            />
          )}
        </div>
      )}

      {/* 4. TAB: RECORD ATTENDANCE (Requirement 4) */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Session Setup Header */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Supabase Attendance Engine
                </span>
                <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
                  Class Attendance Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select department, semester, class division, and subject to record verified student attendance.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={roster.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  disabled={roster.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 disabled:opacity-40 transition-colors"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {attendanceError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{attendanceError}</span>
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Class Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Department */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">College Department</label>
                <select
                  value={attendanceDept}
                  onChange={(e) => setAttendanceDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium truncate"
                >
                  {COLLEGE_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester & Division */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <select
                    value={attendanceSem}
                    onChange={(e) => setAttendanceSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                      <option key={sem} value={sem}>Sem {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Division</label>
                  <select
                    value={attendanceDiv}
                    onChange={(e) => setAttendanceDiv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="A">Div A</option>
                    <option value="B">Div B</option>
                    <option value="C">Div C</option>
                  </select>
                </div>
              </div>

              {/* Subject Code & Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code &amp; Title</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CE301"
                    className="col-span-1 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono uppercase font-bold"
                  />
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Database Systems"
                    className="col-span-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Date & Slot */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={attendanceSlot}
                    onChange={(e) => setAttendanceSlot(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs truncate"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 - 11:00 AM</option>
                    <option value="11:15 AM - 12:15 PM">11:15 - 12:15 PM</option>
                    <option value="01:15 PM - 02:15 PM">01:15 - 02:15 PM</option>
                    <option value="02:15 PM - 03:15 PM">02:15 - 03:15 PM</option>
                    <option value="03:30 PM - 04:30 PM">03:30 - 04:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lecture Topic (Required) */}
            <div className="text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Curriculum Topic / Syllabus Sub-unit <span className="text-brand-cyan">*</span>
              </label>
              <input
                type="text"
                value={lectureTopic}
                onChange={(e) => setLectureTopic(e.target.value)}
                placeholder="e.g. Relational Normalization (3NF & BCNF) with Practical Database Examples"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-cyan/40"
              />
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-navy-900 dark:text-white">
                  Enrolled Students in {attendanceDept} (Sem {attendanceSem} • {attendanceDiv})
                </span>
                <span className="text-slate-400 ml-2">({roster.length} registered)</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-bold">
                <span className="text-emerald-500">Present: {roster.filter(s => s.status === 'present').length}</span>
                <span className="text-rose-500">Absent: {roster.filter(s => s.status === 'absent').length}</span>
                <span className="text-amber-500">Leave: {roster.filter(s => s.status === 'leave').length}</span>
                <span className="text-blue-500">Late: {roster.filter(s => s.status === 'late').length}</span>
              </div>
            </div>

            {loadingRoster ? (
              <div className="p-10 text-center text-xs text-slate-400 animate-pulse">
                Querying enrolled students from Supabase profiles...
              </div>
            ) : roster.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-navy-900 dark:text-white">
                  No Enrolled Students Found for This Selection
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No students in the database are currently assigned to <strong>{attendanceDept}</strong> (Semester {attendanceSem}, Division {attendanceDiv}). Select a different department or semester.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Roll No</th>
                        <th className="py-3 px-3">Student Name</th>
                        <th className="py-3 px-3">Institutional Email</th>
                        <th className="py-3 px-4 text-right">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                      {roster.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-brand-cyan">
                            {student.rollNumber || 'N/A'}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {student.name}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {student.email}
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
                                onClick={() => handleToggleStatus(student.id, 'absent')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                  student.status === 'absent'
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-rose-600'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'late')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                  student.status === 'late'
                                    ? 'bg-blue-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-blue-600'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.id, 'leave')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                  student.status === 'leave'
                                    ? 'bg-amber-500 text-navy-950 shadow-xs'
                                    : 'text-slate-500 hover:text-amber-600'
                                }`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Commit Bar */}
                <div className="p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    Signing ledger as: <strong className="text-slate-700 dark:text-slate-200">{user.name}</strong>. Data persists to Supabase attendance tables.
                  </span>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSavingAttendance || roster.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingAttendance ? 'Committing to Database...' : 'Save & Commit Attendance Session'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Past Recorded Attendance History */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-navy-900 dark:text-white uppercase tracking-wider">
                  Attendance Session History &amp; Audit Log
                </h4>
                <p className="text-xs text-slate-400">
                  Previously committed attendance sheets for {attendanceDept}
                </p>
              </div>
              <button
                onClick={loadPastSessions}
                className="text-xs text-brand-cyan font-bold hover:underline"
              >
                Refresh Log
              </button>
            </div>

            {loadingPastSessions ? (
              <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                Loading session history...
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl">
                <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Past Sessions Recorded Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Sessions saved above will automatically appear in this historical ledger.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pastSessions.map((ses) => (
                  <div
                    key={ses.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-brand-cyan">{ses.subjectCode}</span>
                        <span>•</span>
                        <strong className="text-slate-900 dark:text-white">{ses.subjectName}</strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold">
                          Sem {ses.semester} • Div {ses.division}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">Topic: {ses.topic}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ses.date} ({ses.slot}) • Recorded by: {ses.facultyName}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-500">
                          {ses.presentCount} / {ses.totalCount} Present
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ses.totalCount > 0 ? Math.round((ses.presentCount / ses.totalCount) * 100) : 0}% Attendance
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectPastSession(ses)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 font-bold text-[11px] text-slate-700 dark:text-slate-200 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect &amp; Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal / Panel for Inspecting and Editing a Past Session */}
          {selectedPastSession && (
            <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-700 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                  <div>
                    <h3 className="font-black text-base text-navy-900 dark:text-white">
                      Inspect &amp; Correct Attendance Records
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedPastSession.subjectCode} • {selectedPastSession.date} ({selectedPastSession.slot})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPastSession(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {loadingSessionRecords ? (
                    <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                      Loading session records from database...
                    </div>
                  ) : pastSessionRecords.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No individual student records found for this session.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-navy-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-2">Roll</th>
                          <th className="py-2">Student Name</th>
                          <th className="py-2 text-right">Status Modification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                        {pastSessionRecords.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 font-mono font-bold text-brand-cyan">{r.rollNumber || 'N/A'}</td>
                            <td className="py-2 font-bold text-slate-900 dark:text-white">{r.studentName}</td>
                            <td className="py-2 text-right">
                              <select
                                value={r.status}
                                onChange={(e) => handleEditPastRecordStatus(r.id, e.target.value as AttendanceStatus)}
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-300 dark:border-navy-700 font-bold text-[11px]"
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="leave">Leave</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-navy-800 pt-3 flex justify-between items-center text-xs text-slate-400">
                  <span>Modifications are verified and logged with faculty identity.</span>
                  <button
                    onClick={() => setSelectedPastSession(null)}
                    className="px-4 py-2 rounded-xl bg-navy-900 dark:bg-slate-800 text-white font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: MARKS & EVALUATION */}
      {activeTab === 'marks' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Gradebook Evaluation
            </span>
            <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
              Internal Marks &amp; Continuous Evaluation Entry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit continuous assessment tests (CAT), quiz evaluations, and lab scores directly into Supabase marks table.
            </p>
          </div>

          {marksSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{marksSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveMarksSubmit} className="space-y-4 max-w-2xl text-xs">
            {/* Student Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
              <select
                value={marksStudentId}
                onChange={(e) => setMarksStudentId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="">-- Choose Student from Enrolled Roster ({roster.length} available) --</option>
                {roster.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={marksSubCode}
                  onChange={(e) => setMarksSubCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Title</label>
                <input
                  type="text"
                  value={marksSubName}
                  onChange={(e) => setMarksSubName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Test 1 (/30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={marksCat1}
                  onChange={(e) => setMarksCat1(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Test 2 (/30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={marksCat2}
                  onChange={(e) => setMarksCat2(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quiz Avg (/10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={marksQuiz}
                  onChange={(e) => setMarksQuiz(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lab Eval (/20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={marksLab}
                  onChange={(e) => setMarksLab(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Calculated Grade & Total */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800">
              <div>
                <p className="text-slate-400 text-[11px]">Total Scaled Marks</p>
                <p className="text-xl font-black text-navy-900 dark:text-white">
                  {Number(marksCat1) + Number(marksCat2) + Number(marksQuiz) + Number(marksLab)} / 90
                </p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Letter Grade</label>
                <select
                  value={marksGrade}
                  onChange={(e) => setMarksGrade(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 font-bold text-brand-cyan"
                >
                  <option value="A+">A+ (Outstanding)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B+">B+ (Very Good)</option>
                  <option value="B">B (Good)</option>
                  <option value="C">C (Pass)</option>
                  <option value="F">F (Remedial)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={marksSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{marksSaving ? 'Saving to Database...' : 'Commit Marks to Gradebook'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. TAB: COURSE ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                Coursework
              </span>
              <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
                Coursework &amp; Assignments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish lab assignments and problem sheets for enrolled students.
              </p>
            </div>
          </div>

          {courseAssignments.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-navy-800 rounded-3xl space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">No Active Course Assignments</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No assignments have been published for this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseAssignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{asg.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {asg.subjectCode} • Due: {asg.dueDate} • {asg.instructions}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB: STUDY MATERIALS */}
      {activeTab === 'materials' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30">
                Academic Repository
              </span>
              <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
                Upload Notes &amp; Course Materials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share syllabus notes, question banks, and laboratory manuals with students.
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUploadMaterialSubmit} className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800 space-y-3 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
              <input
                type="text"
                value={newMatTitle}
                onChange={(e) => setNewMatTitle(e.target.value)}
                placeholder="e.g. Unit 3 - Operating System Process Scheduling Notes"
                required
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Material Type</label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                >
                  <option value="Notes">Lecture Notes</option>
                  <option value="Syllabus">Official Syllabus</option>
                  <option value="Question Paper">Previous Question Paper</option>
                  <option value="Lab Manual">Laboratory Manual</option>
                  <option value="Reference">Reference Material</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Publish Material to Student Hub</span>
            </button>
          </form>

          {/* Published Materials List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Published Course Documents ({materialsList.length})
            </h4>
            {materialsList.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-slate-400">
                No materials published yet. Use the form above to add lecture notes.
              </div>
            ) : (
              <div className="space-y-2">
                {materialsList.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{m.title}</p>
                      <p className="text-[11px] text-slate-400">{m.subjectCode} • {m.type} • Uploaded by {m.uploadedBy}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-500 font-bold">
                      {m.fileFormat}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
              Departmental Broadcast
            </span>
            <h3 className="text-xl font-black text-navy-900 dark:text-white mt-1">
              Broadcast Course Notice to Students
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish circulars that appear directly on student noticeboards for {attendanceDept}.
            </p>
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
              <input
                type="text"
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="e.g. Extra Practical Lab Scheduled for Friday"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
              <textarea
                rows={4}
                value={announceContent}
                onChange={(e) => setAnnounceContent(e.target.value)}
                placeholder="Detailed instructions for students..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgent-notice"
                checked={isAnnounceUrgent}
                onChange={(e) => setIsAnnounceUrgent(e.target.checked)}
                className="rounded text-brand-cyan"
              />
              <label htmlFor="urgent-notice" className="font-semibold text-slate-700 dark:text-slate-300">
                Mark as High Priority Circular
              </label>
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
