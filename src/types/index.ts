export type UserRole = 'student' | 'faculty' | 'admin' | 'guest' | 'pending';

export const COLLEGE_DEPARTMENTS = [
  'Architecture',
  'Automation and Robotics',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Electronics & Communication Engineering',
  'Information & Communication Technology (ICT)',
  'Information Technology (IT)',
  'Instrumentation & Control Engineering',
  'Mechanical Engineering',
  'Mechanical CAD/CAM',
  'Plastic Engineering (Sandwich Pattern)',
] as const;

export type CollegeDepartment = (typeof COLLEGE_DEPARTMENTS)[number];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  // Student specific
  rollNumber?: string;
  prn?: string;
  semester?: number;
  academicYear?: string;
  division?: string;
  cgpa?: number;
  mentorName?: string;
  mentorEmail?: string;
  // Faculty specific
  designation?: string;
  cabin?: string;
  specialization?: string[];
  consultationHours?: string;
  // Admin specific
  adminLevel?: string;
}

export interface Notice {
  id: string;
  title: string;
  category: 'Academic' | 'Examination' | 'Placement' | 'Sports' | 'Events' | 'General';
  department: string; // 'All' or specific dept
  semester?: number | 'All';
  date: string;
  time: string;
  author: string;
  authorRole: string;
  isUrgent: boolean;
  content: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
  views: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: 'Technical' | 'Cultural' | 'Workshop' | 'Sports' | 'Seminar' | 'Competition';
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  bannerImage: string;
  registeredCount: number;
  maxCapacity: number;
  registrationOpen: boolean;
  registrationDeadline: string;
  tags: string[];
  contactPerson: string;
  contactEmail: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  email: string;
  phone: string;
  cabin: string;
  consultationHours: string;
  specialization: string[];
  subjectsTaught: string[];
  avatar: string;
  researchPapersCount: number;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  hodName: string;
  hodEmail: string;
  establishedYear: number;
  totalStudents: number;
  totalFaculty: number;
  description: string;
  vision: string;
  programsOffered: string[];
  labs: string[];
  bannerImage: string;
}

export interface CampusFacility {
  id: string;
  name: string;
  category: 'Academic' | 'Sports' | 'Recreation' | 'Health' | 'Canteen' | 'Admin';
  location: string;
  block: string;
  timings: string;
  description: string;
  features: string[];
  image: string;
  inCharge: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subjectCode: string;
  subjectName: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  facultyName: string;
  room: string;
  color: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
  minimumRequired: number; // 75%
  status: 'Safe' | 'Warning' | 'Critical';
}

export interface InternalMark {
  subjectCode: string;
  subjectName: string;
  internal1: number; // out of 30
  internal2: number; // out of 30
  quizAverage: number; // out of 10
  labAssignment: number; // out of 20
  attendanceMarks: number; // out of 10
  totalMarks: number; // out of 100
  grade: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  assignedDate: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  score?: string;
  instructions: string;
  submittedFile?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  type: 'Notes' | 'Syllabus' | 'Question Paper' | 'Lab Manual' | 'Reference';
  year?: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  fileFormat: string;
  downloadsCount: number;
  fileUrl: string;
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  shelfLocation: string;
  coverImage: string;
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  logo: string;
  role: string;
  packageLPA: string;
  eligibleBranches: string[];
  minCGPA: number;
  lastDateToApply: string;
  driveDate: string;
  location: string;
  status: 'Open' | 'Upcoming' | 'Closed';
  description: string;
}

export interface StudentClub {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Social' | 'Sports' | 'Entrepreneurship';
  leadName: string;
  membersCount: number;
  tagline: string;
  description: string;
  weeklyMeeting: string;
  instagram?: string;
  email: string;
  logo: string;
}

export interface AcademicHoliday {
  id: string;
  date: string;
  name: string;
  type: 'National Holiday' | 'College Holiday' | 'Semester Break' | 'Exam Period';
  description?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'notice' | 'event' | 'academic' | 'assignment' | 'alert';
  read: boolean;
  link?: string;
}

// ----------------- PHASE 6 & 7 EXPANDED MODELS -----------------

export interface FacultyAssignedClass {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  division: string;
  enrolledStudentsCount: number;
  room: string;
  schedule: string;
  averageAttendancePct: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface StudentRosterEntry {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  status: AttendanceStatus;
  currentAttendancePct?: number;
}

export interface AttendanceSession {
  id: string;
  facultyId?: string;
  facultyName: string;
  department?: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  slot: string;
  topic: string;
  semester?: number;
  division?: string;
  presentCount: number;
  totalCount: number;
  createdAt?: string;
}

export interface AttendanceRecordEntry {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  status: AttendanceStatus;
  createdAt?: string;
}

export interface StudentAttendanceSummary {
  hasData: boolean;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  percentage: number;
  subjects: SubjectAttendance[];
  dateWiseRecords: {
    id: string;
    date: string;
    subjectCode: string;
    subjectName: string;
    slot: string;
    status: AttendanceStatus;
    topic: string;
  }[];
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  category: 'Academic' | 'Facilities' | 'Hostel/Canteen' | 'Exam Cell' | 'General';
  message: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  createdAt: string;
}

export interface StudentFeeRecord {
  id: string;
  studentId: string;
  feeType: string;
  authority: 'GTU' | 'GPA';
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  receiptNumber?: string;
  paymentDate?: string;
}
