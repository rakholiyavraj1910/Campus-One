import { 
  Notice, 
  EventItem, 
  FacultyMember, 
  StudyMaterial, 
  AssignmentItem,
  TimetableSlot,
  SubjectAttendance,
  AppNotification,
  FacultyAssignedClass,
  StudentRosterEntry,
  AttendanceSession,
  AttendanceStatus,
  AttendanceRecordEntry,
  StudentAttendanceSummary,
  AuditLog,
  FeedbackItem,
  DepartmentInfo,
  UserProfile,
  UserRole
} from '../types';
import { 
  INITIAL_NOTICES, 
  INITIAL_EVENTS, 
  INITIAL_FACULTY, 
  INITIAL_STUDY_MATERIALS, 
  INITIAL_ASSIGNMENTS,
  STUDENT_TIMETABLE,
  STUDENT_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
  FACULTY_ASSIGNED_CLASSES,
  INITIAL_STUDENT_ROSTER,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEEDBACK,
  INITIAL_DEPARTMENTS
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  NOTICES: 'campusone_notices_v1',
  EVENTS: 'campusone_events_v1',
  FACULTY: 'campusone_faculty_v1',
  MATERIALS: 'campusone_materials_v1',
  ASSIGNMENTS: 'campusone_assignments_v1',
  TIMETABLE: 'campusone_timetable_v1',
  ATTENDANCE: 'campusone_attendance_v1',
  BOOKMARKS: 'campusone_bookmarks_v1',
  NOTIFICATIONS: 'campusone_notifications_v1',
  REGISTERED_EVENTS: 'campusone_registered_events_v1',
  FACULTY_CLASSES: 'campusone_faculty_classes_v1',
  STUDENT_ROSTER: 'campusone_student_roster_v1',
  ATTENDANCE_SESSIONS: 'campusone_attendance_sessions_v1',
  AUDIT_LOGS: 'campusone_audit_logs_v1',
  FEEDBACK: 'campusone_feedback_v1',
  DEPARTMENTS: 'campusone_departments_v1',
};

// Safe LocalStorage helpers for Demo Mode
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading key ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

/**
 * Security Gate: Verify current session has content management permission.
 * Prevents guest users from executing administrative mutations.
 */
export const assertCanMutateContent = (): void => {
  const activeRole = localStorage.getItem('campusone_active_role');
  if (!activeRole || activeRole === 'guest') {
    throw new Error('Access Denied: Guest accounts do not possess administrative write privileges. Please sign in with an authorized Administrator or Faculty account.');
  }
};

// ----------------- DB MAPPERS -----------------
const mapNoticeFromDb = (row: any): Notice => ({
  id: row.id,
  title: row.title,
  category: row.category,
  department: row.department || 'All',
  semester: row.semester || 'All',
  date: row.date,
  time: row.time || '10:00 AM',
  author: row.author,
  authorRole: row.author_role || 'Admin',
  isUrgent: Boolean(row.is_urgent),
  content: row.content,
  attachmentName: row.attachment_name || undefined,
  attachmentSize: row.attachment_size || undefined,
  attachmentUrl: row.attachment_url || undefined,
  views: row.views || 0,
});

const mapEventFromDb = (row: any): EventItem => ({
  id: row.id,
  title: row.title,
  category: row.category,
  date: row.date,
  endDate: row.end_date || undefined,
  time: row.time,
  venue: row.venue,
  organizer: row.organizer,
  description: row.description,
  bannerImage: row.banner_image,
  registeredCount: row.registered_count || 0,
  maxCapacity: row.max_capacity || 300,
  registrationOpen: Boolean(row.registration_open),
  registrationDeadline: row.registration_deadline || row.date,
  tags: row.tags || [],
  contactPerson: row.contact_person || 'Event Coordinator',
  contactEmail: row.contact_email || 'events@campusone.edu',
});

const mapFacultyFromDb = (row: any): FacultyMember => ({
  id: row.id,
  name: row.name,
  designation: row.designation,
  department: row.department,
  qualification: row.qualification || 'M.Tech / Ph.D.',
  experienceYears: row.experience_years || 5,
  email: row.email,
  phone: row.phone || '',
  cabin: row.cabin || '',
  consultationHours: row.consultation_hours || 'Mon-Fri 2:00 PM - 4:00 PM',
  specialization: row.specialization || [],
  subjectsTaught: row.subjects_taught || [],
  avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  researchPapersCount: row.research_papers_count || 0,
});

const mapStudyMaterialFromDb = (row: any): StudyMaterial => ({
  id: row.id,
  title: row.title,
  subjectCode: row.subject_code,
  subjectName: row.subject_name,
  department: row.department,
  semester: row.semester,
  type: row.type || 'Notes',
  year: row.year || '2025-2026',
  uploadedBy: row.uploaded_by,
  uploadDate: row.upload_date,
  fileSize: row.file_size || '2.0 MB',
  fileFormat: row.file_format || 'PDF',
  downloadsCount: row.downloads_count || 0,
  fileUrl: row.file_url || '#',
});

const mapFeedbackFromDb = (row: any): FeedbackItem => ({
  id: row.id,
  userName: row.user_name,
  userEmail: row.user_email,
  category: row.category,
  message: row.message,
  status: row.status,
  createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
});

const mapAuditLogFromDb = (row: any): AuditLog => ({
  id: row.id,
  actorName: row.actor_name,
  actorRole: row.actor_role,
  action: row.action,
  targetType: row.target_type,
  targetId: row.target_id || undefined,
  details: row.details || '',
  timestamp: row.timestamp ? row.timestamp.replace('T', ' ').slice(0, 19) : '',
});

const mapDepartmentFromDb = (row: any): DepartmentInfo => ({
  id: row.id,
  name: row.name,
  code: row.code,
  hodName: row.hod_name || '',
  hodEmail: row.hod_email || '',
  establishedYear: row.established_year || 2000,
  totalStudents: row.total_students || 300,
  totalFaculty: row.total_faculty || 20,
  description: row.description || '',
  vision: row.vision || '',
  programsOffered: row.programs_offered || [],
  labs: row.labs || [],
  bannerImage: row.banner_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
});

export const mapProfileFromDb = (row: any): UserProfile => ({
  id: row.id,
  name: row.name || 'CampusOne User',
  email: row.email,
  role: row.admin_level === 'pending_faculty' ? 'pending' : ((row.role as UserRole) || 'student'),
  avatar: row.avatar_url || undefined,
  phone: row.phone || undefined,
  department: row.department || undefined,
  rollNumber: row.roll_number || undefined,
  prn: row.prn || undefined,
  semester: row.semester ? Number(row.semester) : undefined,
  academicYear: row.academic_year || undefined,
  division: row.division || undefined,
  cgpa: row.cgpa ? Number(row.cgpa) : undefined,
  mentorName: row.mentor_name || undefined,
  mentorEmail: row.mentor_email || undefined,
  designation: row.designation || undefined,
  cabin: row.cabin || undefined,
  specialization: row.specialization || undefined,
  consultationHours: row.consultation_hours || undefined,
  adminLevel: row.admin_level || undefined,
});

// ----------------- NOTICES CRUD -----------------
export const getNotices = async (): Promise<Notice[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        return data.map(mapNoticeFromDb);
      }

      if (error) {
        console.warn(`[CampusOne Supabase Notice Fetch] Status ${error.code}: ${error.message}.`);
      }
      return [];
    } catch (e) {
      console.warn('[CampusOne Supabase Notice Fetch Failure]:', e);
      return [];
    }
  }

  return [];
};

export const addNotice = async (notice: Omit<Notice, 'id' | 'views'>): Promise<Notice> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: notice.title,
      category: notice.category,
      department: notice.department,
      semester: String(notice.semester || 'All'),
      date: notice.date,
      time: notice.time,
      author: notice.author,
      author_role: notice.authorRole,
      is_urgent: notice.isUrgent,
      content: notice.content,
      attachment_name: notice.attachmentName || null,
      attachment_size: notice.attachmentSize || null,
      attachment_url: notice.attachmentUrl || null,
      views: 0,
    };

    const { data, error } = await supabase
      .from('notices')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase addNotice error:', error);
      if (error.code === 'PGRST205') {
        throw new Error(`Cloud database table 'notices' does not exist yet. Please run supabase/schema.sql in the Supabase SQL Editor.`);
      }
      throw new Error(`Failed to create notice in cloud database: ${error.message} (Code: ${error.code})`);
    }

    return mapNoticeFromDb(data);
  }

  // Demo Mode
  const newNotice: Notice = {
    ...notice,
    id: 'not-' + Date.now(),
    views: 1,
  };
  const list = loadFromStorage<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  const updated = [newNotice, ...list];
  saveToStorage(STORAGE_KEYS.NOTICES, updated);
  return newNotice;
};

export const updateNotice = async (updatedItem: Notice): Promise<Notice> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: updatedItem.title,
      category: updatedItem.category,
      department: updatedItem.department,
      semester: String(updatedItem.semester || 'All'),
      is_urgent: updatedItem.isUrgent,
      content: updatedItem.content,
      attachment_name: updatedItem.attachmentName || null,
      attachment_size: updatedItem.attachmentSize || null,
    };

    const { error } = await supabase
      .from('notices')
      .update(payload)
      .eq('id', updatedItem.id);

    if (error) {
      console.error('Supabase updateNotice error:', error);
      if (error.code === 'PGRST205') {
        throw new Error(`Cloud database table 'notices' does not exist yet. Run supabase/schema.sql.`);
      }
      throw new Error(`Failed to update notice: ${error.message}`);
    }

    return updatedItem;
  }

  // Demo Mode
  const list = loadFromStorage<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  const updated = list.map(item => item.id === updatedItem.id ? updatedItem : item);
  saveToStorage(STORAGE_KEYS.NOTICES, updated);
  return updatedItem;
};

export const deleteNotice = async (id: string): Promise<boolean> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteNotice error:', error);
      if (error.code === 'PGRST205') {
        throw new Error(`Cloud database table 'notices' does not exist yet. Run supabase/schema.sql.`);
      }
      throw new Error(`Failed to delete notice: ${error.message}`);
    }

    return true;
  }

  // Demo Mode
  const list = loadFromStorage<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  const updated = list.filter(item => item.id !== id);
  saveToStorage(STORAGE_KEYS.NOTICES, updated);
  return true;
};

export const incrementNoticeViews = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc('increment_notice_views', { notice_id: id });
    } catch {
      // Non-blocking view increment
    }
  } else {
    const list = loadFromStorage<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
    const updated = list.map(n => n.id === id ? { ...n, views: (n.views || 0) + 1 } : n);
    saveToStorage(STORAGE_KEYS.NOTICES, updated);
  }
};

// ----------------- EVENTS CRUD -----------------
export const getEvents = async (): Promise<EventItem[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        return data.map(mapEventFromDb);
      }

      if (error) {
        console.warn(`[CampusOne Supabase Event Fetch] Status ${error.code}: ${error.message}.`);
      }
      return [];
    } catch (e) {
      console.warn('[CampusOne Supabase Event Fetch Failure]:', e);
      return [];
    }
  }

  return [];
};

export const addEvent = async (event: Omit<EventItem, 'id' | 'registeredCount'>): Promise<EventItem> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: event.title,
      category: event.category,
      date: event.date,
      end_date: event.endDate || null,
      time: event.time,
      venue: event.venue,
      organizer: event.organizer,
      description: event.description,
      banner_image: event.bannerImage,
      registered_count: 0,
      max_capacity: event.maxCapacity,
      registration_open: event.registrationOpen,
      registration_deadline: event.registrationDeadline || event.date,
      tags: event.tags,
      contact_person: event.contactPerson,
      contact_email: event.contactEmail,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase addEvent error:', error);
      if (error.code === 'PGRST205') {
        throw new Error(`Cloud database table 'events' does not exist yet. Please run supabase/schema.sql in the Supabase SQL Editor.`);
      }
      throw new Error(`Failed to create event in database: ${error.message}`);
    }

    return mapEventFromDb(data);
  }

  // Demo Mode
  const newEvent: EventItem = {
    ...event,
    id: 'evt-' + Date.now(),
    registeredCount: 0,
  };
  const list = loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const updated = [newEvent, ...list];
  saveToStorage(STORAGE_KEYS.EVENTS, updated);
  return newEvent;
};

export const updateEvent = async (event: EventItem): Promise<EventItem> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: event.title,
      category: event.category,
      date: event.date,
      end_date: event.endDate || null,
      time: event.time,
      venue: event.venue,
      organizer: event.organizer,
      description: event.description,
      banner_image: event.bannerImage,
      max_capacity: event.maxCapacity,
      registration_open: event.registrationOpen,
      tags: event.tags,
    };

    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', event.id);

    if (error) {
      console.error('Supabase updateEvent error:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return event;
  }

  const list = loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const updated = list.map(e => e.id === event.id ? event : e);
  saveToStorage(STORAGE_KEYS.EVENTS, updated);
  return event;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteEvent error:', error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }

    return true;
  }

  const list = loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  saveToStorage(STORAGE_KEYS.EVENTS, list.filter(e => e.id !== id));
  return true;
};

export const registerForEvent = async (
  eventId: string, 
  studentEmail: string,
  studentName: string = 'Campus Student'
): Promise<{ success: boolean; message: string }> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const passCode = 'PASS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from('event_registrations').insert([{
        event_id: eventId,
        user_email: studentEmail,
        user_name: studentName,
        pass_code: passCode,
      }]);

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'You have already registered for this event!' };
        }
        return { success: false, message: error.message };
      }

      return { success: true, message: `Registration confirmed! Pass: ${passCode}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Registration failed.' };
    }
  }

  // Demo Mode
  const registered = loadFromStorage<string[]>(STORAGE_KEYS.REGISTERED_EVENTS, []);
  if (registered.includes(eventId)) {
    return { success: false, message: 'You have already registered for this event!' };
  }
  registered.push(eventId);
  saveToStorage(STORAGE_KEYS.REGISTERED_EVENTS, registered);

  const events = loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  const updatedEvents = events.map(e => {
    if (e.id === eventId) {
      return { ...e, registeredCount: e.registeredCount + 1 };
    }
    return e;
  });
  saveToStorage(STORAGE_KEYS.EVENTS, updatedEvents);

  return { success: true, message: 'Registration confirmed! Event entry pass generated.' };
};

export const isRegisteredForEvent = (eventId: string): boolean => {
  const registered = loadFromStorage<string[]>(STORAGE_KEYS.REGISTERED_EVENTS, []);
  return registered.includes(eventId);
};

// ----------------- FACULTY CRUD -----------------
export const getFacultyList = async (): Promise<FacultyMember[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('faculty_directory')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        return data.map(mapFacultyFromDb);
      }

      if (error) {
        console.warn(`[CampusOne Supabase Faculty Fetch] Status ${error.code}: ${error.message}.`);
      }
      return [];
    } catch (e) {
      console.warn('[CampusOne Supabase Faculty Fetch Failure]:', e);
      return [];
    }
  }

  return [];
};

export const addFacultyMember = async (fac: Omit<FacultyMember, 'id'>): Promise<FacultyMember> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      name: fac.name,
      designation: fac.designation,
      department: fac.department,
      qualification: fac.qualification,
      experience_years: fac.experienceYears,
      email: fac.email,
      phone: fac.phone,
      cabin: fac.cabin,
      consultation_hours: fac.consultationHours,
      specialization: fac.specialization,
      subjects_taught: fac.subjectsTaught,
      avatar: fac.avatar,
      research_papers_count: fac.researchPapersCount,
    };

    const { data, error } = await supabase
      .from('faculty_directory')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase addFacultyMember error:', error);
      if (error.code === 'PGRST205') {
        throw new Error(`Cloud database table 'faculty_directory' does not exist yet. Please run supabase/schema.sql.`);
      }
      throw new Error(`Failed to add faculty member: ${error.message}`);
    }

    return mapFacultyFromDb(data);
  }

  // Demo Mode
  const newFac: FacultyMember = {
    ...fac,
    id: 'fac-' + Date.now(),
  };
  const list = loadFromStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  const updated = [newFac, ...list];
  saveToStorage(STORAGE_KEYS.FACULTY, updated);
  return newFac;
};

export const updateFacultyMember = async (fac: FacultyMember): Promise<FacultyMember> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      name: fac.name,
      designation: fac.designation,
      department: fac.department,
      qualification: fac.qualification,
      experience_years: fac.experienceYears,
      email: fac.email,
      phone: fac.phone,
      cabin: fac.cabin,
      consultation_hours: fac.consultationHours,
      specialization: fac.specialization,
      subjects_taught: fac.subjectsTaught,
      avatar: fac.avatar,
      research_papers_count: fac.researchPapersCount,
    };

    const { error } = await supabase
      .from('faculty_directory')
      .update(payload)
      .eq('id', fac.id);

    if (error) {
      console.error('Supabase updateFacultyMember error:', error);
      throw new Error(`Failed to update faculty member: ${error.message}`);
    }

    return fac;
  }

  const list = loadFromStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  const updated = list.map(f => f.id === fac.id ? fac : f);
  saveToStorage(STORAGE_KEYS.FACULTY, updated);
  return fac;
};

export const deleteFacultyMember = async (id: string): Promise<boolean> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('faculty_directory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteFacultyMember error:', error);
      throw new Error(`Failed to remove faculty member: ${error.message}`);
    }

    return true;
  }

  const list = loadFromStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  saveToStorage(STORAGE_KEYS.FACULTY, list.filter(f => f.id !== id));
  return true;
};

// ----------------- STUDY MATERIALS CRUD -----------------
export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(mapStudyMaterialFromDb);
      }

      if (error) {
        console.warn(`[CampusOne Supabase Materials Fetch] Status ${error.code}: ${error.message}.`);
      }
      return [];
    } catch (e) {
      console.warn('[CampusOne Supabase Materials Fetch Failure]:', e);
      return [];
    }
  }

  return [];
};

export const addStudyMaterial = async (mat: Omit<StudyMaterial, 'id' | 'downloadsCount'>): Promise<StudyMaterial> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const payload = {
      title: mat.title,
      subject_code: mat.subjectCode,
      subject_name: mat.subjectName,
      department: mat.department,
      semester: mat.semester,
      type: mat.type,
      year: mat.year || '2025-2026',
      uploaded_by: mat.uploadedBy,
      upload_date: mat.uploadDate,
      file_size: mat.fileSize,
      file_format: mat.fileFormat,
      downloads_count: 0,
      file_url: mat.fileUrl,
    };

    const { data, error } = await supabase
      .from('study_materials')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase addStudyMaterial error:', error);
      throw new Error(`Failed to upload study material: ${error.message}`);
    }

    return mapStudyMaterialFromDb(data);
  }

  const newMat: StudyMaterial = {
    ...mat,
    id: 'mat-' + Date.now(),
    downloadsCount: 0,
  };
  const list = loadFromStorage<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_STUDY_MATERIALS);
  const updated = [newMat, ...list];
  saveToStorage(STORAGE_KEYS.MATERIALS, updated);
  return newMat;
};

export const deleteStudyMaterial = async (id: string): Promise<boolean> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteStudyMaterial error:', error);
      throw new Error(`Failed to delete study material: ${error.message}`);
    }

    return true;
  }

  const list = loadFromStorage<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_STUDY_MATERIALS);
  saveToStorage(STORAGE_KEYS.MATERIALS, list.filter(m => m.id !== id));
  return true;
};

export const incrementMaterialDownload = (id: string): void => {
  const list = loadFromStorage<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_STUDY_MATERIALS);
  const updated = list.map(m => m.id === id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m);
  saveToStorage(STORAGE_KEYS.MATERIALS, updated);
};

// ----------------- REAL STUDENT DIRECTORY & PROFILES -----------------
export const getStudents = async (filters?: {
  department?: string;
  semester?: number | string;
  division?: string;
  search?: string;
}): Promise<UserProfile[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (filters?.department && filters.department !== 'All') {
        query = query.eq('department', filters.department);
      }
      if (filters?.semester && filters.semester !== 'All') {
        query = query.eq('semester', Number(filters.semester));
      }
      if (filters?.division && filters.division !== 'All') {
        query = query.eq('division', filters.division);
      }
      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        query = query.or(`name.ilike.${s},email.ilike.${s},roll_number.ilike.${s},prn.ilike.${s}`);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) {
        console.warn('Error fetching students from Supabase:', error.message);
        return [];
      }
      return (data || []).map(mapProfileFromDb);
    } catch (e) {
      console.error('Exception fetching students:', e);
      return [];
    }
  }
  return [];
};

export const getStudentById = async (studentId: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();
      if (error || !data) return null;
      return mapProfileFromDb(data);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// ----------------- REAL STUDENT ATTENDANCE CALCULATION -----------------
export const getStudentAttendanceSummary = async (studentId: string): Promise<StudentAttendanceSummary> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          status,
          created_at,
          session_id,
          attendance_sessions (
            id,
            subject_code,
            subject_name,
            faculty_name,
            date,
            slot,
            topic,
            semester,
            division
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error || !records || records.length === 0) {
        return {
          hasData: false,
          totalClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          percentage: 0,
          subjects: [],
          dateWiseRecords: [],
        };
      }

      const subjectMap = new Map<string, {
        subjectCode: string;
        subjectName: string;
        facultyName: string;
        attended: number;
        total: number;
      }>();

      const dateWiseRecords: StudentAttendanceSummary['dateWiseRecords'] = [];
      let totalConducted = 0;
      let totalAttended = 0;

      for (const r of records) {
        const session = Array.isArray(r.attendance_sessions) ? r.attendance_sessions[0] : (r.attendance_sessions as any);
        const subCode = session?.subject_code || 'GEN';
        const subName = session?.subject_name || 'General Course';
        const facName = session?.faculty_name || 'Department Faculty';
        const isAttended = r.status === 'present' || r.status === 'late';

        totalConducted++;
        if (isAttended) totalAttended++;

        if (!subjectMap.has(subCode)) {
          subjectMap.set(subCode, {
            subjectCode: subCode,
            subjectName: subName,
            facultyName: facName,
            attended: 0,
            total: 0,
          });
        }
        const s = subjectMap.get(subCode)!;
        s.total++;
        if (isAttended) s.attended++;

        dateWiseRecords.push({
          id: r.id,
          date: session?.date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          subjectCode: subCode,
          subjectName: subName,
          slot: session?.slot || 'Morning Slot',
          status: r.status as AttendanceStatus,
          topic: session?.topic || 'Curriculum Lecture',
        });
      }

      const subjects: SubjectAttendance[] = Array.from(subjectMap.values()).map(s => {
        const pct = s.total > 0 ? Number(((s.attended / s.total) * 100).toFixed(1)) : 0;
        let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
        if (pct < 70) status = 'Critical';
        else if (pct < 75) status = 'Warning';

        return {
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          facultyName: s.facultyName,
          attendedClasses: s.attended,
          totalClasses: s.total,
          percentage: pct,
          minimumRequired: 75,
          status,
        };
      });

      const overallPercentage = totalConducted > 0 
        ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) 
        : 0;

      return {
        hasData: true,
        totalClasses: totalConducted,
        attendedClasses: totalAttended,
        missedClasses: totalConducted - totalAttended,
        percentage: overallPercentage,
        subjects,
        dateWiseRecords,
      };
    } catch (e) {
      console.error('Error fetching student attendance summary:', e);
    }
  }

  return {
    hasData: false,
    totalClasses: 0,
    attendedClasses: 0,
    missedClasses: 0,
    percentage: 0,
    subjects: [],
    dateWiseRecords: [],
  };
};

// ----------------- REAL ATTENDANCE RECORDING & SESSIONS -----------------
export const saveAttendanceSession = async (
  sessionData: {
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
    presentCount?: number;
    totalCount?: number;
  },
  records: {
    studentId: string;
    studentName: string;
    rollNumber?: string;
    status: AttendanceStatus;
  }[]
): Promise<AttendanceSession> => {
  if (isSupabaseConfigured && supabase) {
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const totalCount = records.length;

    // 1. Insert session record
    const payload = {
      faculty_id: sessionData.facultyId || null,
      faculty_name: sessionData.facultyName,
      department: sessionData.department || 'Computer Engineering',
      subject_code: sessionData.subjectCode,
      subject_name: sessionData.subjectName,
      date: sessionData.date,
      slot: sessionData.slot,
      topic: sessionData.topic,
      semester: sessionData.semester || 1,
      division: sessionData.division || 'A',
      present_count: presentCount,
      total_count: totalCount,
    };

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('attendance_sessions')
      .insert([payload])
      .select()
      .single();

    if (sessionErr) {
      console.error('Supabase saveAttendanceSession error:', sessionErr);
      throw new Error(`Failed to save attendance session: ${sessionErr.message}`);
    }

    // 2. Insert/upsert individual student records
    if (records.length > 0) {
      const recordPayloads = records.map(r => ({
        session_id: sessionRow.id,
        student_id: r.studentId,
        student_name: r.studentName,
        roll_number: r.rollNumber || null,
        status: r.status,
      }));

      const { error: recordsErr } = await supabase
        .from('attendance_records')
        .upsert(recordPayloads, { onConflict: 'session_id,student_id' });

      if (recordsErr) {
        console.error('Supabase attendance_records upsert error:', recordsErr);
        await supabase.from('attendance_sessions').delete().eq('id', sessionRow.id);
        throw new Error(`Failed to save student attendance records: ${recordsErr.message}`);
      }
    }

    // 3. Log audit event
    await addAuditLog(
      sessionData.facultyName,
      'faculty',
      'RECORD_ATTENDANCE',
      'attendance_sessions',
      sessionRow.id,
      `Recorded attendance for ${sessionData.subjectCode} (${sessionData.department}): ${presentCount}/${totalCount} students present. Topic: "${sessionData.topic}"`
    );

    return {
      id: sessionRow.id,
      facultyId: sessionRow.faculty_id,
      facultyName: sessionRow.faculty_name,
      department: sessionRow.department,
      subjectCode: sessionRow.subject_code,
      subjectName: sessionRow.subject_name,
      date: sessionRow.date,
      slot: sessionRow.slot,
      topic: sessionRow.topic,
      semester: sessionRow.semester,
      division: sessionRow.division,
      presentCount,
      totalCount,
      createdAt: sessionRow.created_at,
    };
  }

  throw new Error('Supabase cloud backend must be configured to persist real institutional attendance.');
};

export const getAttendanceSessions = async (filters?: {
  subjectCode?: string;
  semester?: number;
  division?: string;
  department?: string;
  date?: string;
}): Promise<AttendanceSession[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('attendance_sessions')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.department && filters.department !== 'All') {
        query = query.eq('department', filters.department);
      }
      if (filters?.subjectCode && filters.subjectCode !== 'All') {
        query = query.eq('subject_code', filters.subjectCode);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.division && filters.division !== 'All') {
        query = query.eq('division', filters.division);
      }
      if (filters?.date) {
        query = query.eq('date', filters.date);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        facultyId: d.faculty_id,
        facultyName: d.faculty_name,
        department: d.department,
        subjectCode: d.subject_code,
        subjectName: d.subject_name,
        date: d.date,
        slot: d.slot,
        topic: d.topic,
        semester: d.semester,
        division: d.division,
        presentCount: d.present_count || 0,
        totalCount: d.total_count || 0,
        createdAt: d.created_at,
      }));
    } catch (e) {
      console.error('Error fetching attendance sessions:', e);
      return [];
    }
  }
  return [];
};

export const getAttendanceRecordsForSession = async (sessionId: string): Promise<AttendanceRecordEntry[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', sessionId)
        .order('student_name', { ascending: true });

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        sessionId: d.session_id,
        studentId: d.student_id,
        studentName: d.student_name || 'Student',
        rollNumber: d.roll_number || '',
        status: d.status as AttendanceStatus,
        createdAt: d.created_at,
      }));
    } catch (e) {
      console.error('Error fetching session attendance records:', e);
      return [];
    }
  }
  return [];
};

export const updateAttendanceRecord = async (
  recordId: string,
  newStatus: AttendanceStatus,
  actorName: string
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { data: prevRecord, error: getErr } = await supabase
      .from('attendance_records')
      .select('session_id, student_name, roll_number, status')
      .eq('id', recordId)
      .single();

    if (getErr || !prevRecord) throw new Error('Attendance record not found.');

    const { error } = await supabase
      .from('attendance_records')
      .update({ status: newStatus })
      .eq('id', recordId);

    if (error) throw new Error(`Failed to update attendance status: ${error.message}`);

    const { data: records } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('session_id', prevRecord.session_id);

    if (records) {
      const presentCount = records.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      await supabase
        .from('attendance_sessions')
        .update({ present_count: presentCount })
        .eq('id', prevRecord.session_id);
    }

    await addAuditLog(
      actorName,
      'faculty',
      'EDIT_ATTENDANCE_RECORD',
      'attendance_records',
      recordId,
      `Updated attendance for ${prevRecord.student_name} from ${prevRecord.status} to ${newStatus}`
    );
  }
};

// ----------------- REAL MARKS & ACADEMIC EVALUATION -----------------
export const getStudentMarks = async (studentId: string): Promise<any[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('marks')
        .select('*')
        .eq('student_id', studentId)
        .order('subject_code', { ascending: true });

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        studentId: d.student_id,
        subjectCode: d.subject_code,
        subjectName: d.subject_name,
        internal1: Number(d.internal1 || 0),
        internal2: Number(d.internal2 || 0),
        quizAverage: Number(d.quiz_avg || 0),
        labAssignment: Number(d.lab_assignment || 0),
        attendanceMarks: Number(d.attendance_marks || 0),
        totalMarks: Number(d.total_marks || 0),
        grade: d.grade || 'N/A',
      }));
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const saveStudentMarks = async (
  studentId: string,
  subjectCode: string,
  subjectName: string,
  marks: {
    internal1?: number;
    internal2?: number;
    quizAverage?: number;
    labAssignment?: number;
    attendanceMarks?: number;
    totalMarks?: number;
    grade?: string;
  },
  actorName: string
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      student_id: studentId,
      subject_code: subjectCode,
      subject_name: subjectName,
      internal1: marks.internal1 || 0,
      internal2: marks.internal2 || 0,
      quiz_avg: marks.quizAverage || 0,
      lab_assignment: marks.labAssignment || 0,
      attendance_marks: marks.attendanceMarks || 0,
      total_marks: marks.totalMarks || 0,
      grade: marks.grade || 'A',
    };

    const { error } = await supabase
      .from('marks')
      .upsert([payload]);

    if (error) throw new Error(`Failed to save marks: ${error.message}`);

    await addAuditLog(
      actorName,
      'faculty',
      'UPDATE_MARKS',
      'marks',
      studentId,
      `Updated marks for ${subjectCode}: Total ${marks.totalMarks}/100, Grade ${marks.grade}`
    );
  }
};

// ----------------- FACULTY ACCESS REQUESTS & APPROVALS -----------------
export const getPendingFacultyRequests = async (): Promise<UserProfile[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('admin_level.eq.pending_faculty,role.eq.pending')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(mapProfileFromDb);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const approveFacultyRequest = async (profileId: string, actorName: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'faculty', admin_level: null })
      .eq('id', profileId);

    if (error) throw new Error(`Failed to approve faculty request: ${error.message}`);

    await addAuditLog(
      actorName,
      'admin',
      'APPROVE_FACULTY_REQUEST',
      'profiles',
      profileId,
      `Approved faculty access request. Account role upgraded to faculty.`
    );
  }
};

export const rejectFacultyRequest = async (profileId: string, actorName: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ admin_level: 'rejected' })
      .eq('id', profileId);

    if (error) throw new Error(`Failed to reject faculty request: ${error.message}`);

    await addAuditLog(
      actorName,
      'admin',
      'REJECT_FACULTY_REQUEST',
      'profiles',
      profileId,
      `Rejected faculty access request.`
    );
  }
};

// ----------------- ASSIGNMENTS -----------------
export const getAssignments = async (): Promise<AssignmentItem[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          subjectCode: d.subject_code,
          subjectName: d.subject_name,
          assignedDate: d.assigned_date,
          dueDate: d.due_date,
          status: 'Pending',
          instructions: d.instructions || '',
          score: undefined,
        }));
      }
    } catch (e) {
      return [];
    }
  }
  return [];
};

export const submitAssignmentSolution = (id: string, fileName: string): AssignmentItem | null => {
  const list = loadFromStorage<AssignmentItem[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  let updatedItem: AssignmentItem | null = null;
  const updated = list.map(a => {
    if (a.id === id) {
      updatedItem = {
        ...a,
        status: 'Submitted',
        score: 'Under Review',
        submittedFile: fileName,
      };
      return updatedItem;
    }
    return a;
  });
  saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updated);
  return updatedItem;
};

// ----------------- TIMETABLE & ATTENDANCE -----------------
export const getTimetable = (): TimetableSlot[] => {
  return loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
};

export const getAttendanceRecords = (): SubjectAttendance[] => {
  return loadFromStorage<SubjectAttendance[]>(STORAGE_KEYS.ATTENDANCE, []);
};

export const updateSubjectAttendance = (subjectCode: string, deltaAttended: number, deltaTotal: number): SubjectAttendance[] => {
  const list = loadFromStorage<SubjectAttendance[]>(STORAGE_KEYS.ATTENDANCE, []);
  const updated = list.map(item => {
    if (item.subjectCode === subjectCode) {
      const newAttended = Math.max(0, item.attendedClasses + deltaAttended);
      const newTotal = Math.max(newAttended, item.totalClasses + deltaTotal);
      const percentage = Number(((newAttended / (newTotal || 1)) * 100).toFixed(1));
      let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
      if (percentage < 70) status = 'Critical';
      else if (percentage < 75) status = 'Warning';

      return {
        ...item,
        attendedClasses: newAttended,
        totalClasses: newTotal,
        percentage,
        status,
      };
    }
    return item;
  });
  saveToStorage(STORAGE_KEYS.ATTENDANCE, updated);
  return updated;
};

// ----------------- BOOKMARKS -----------------
export const getBookmarks = (): string[] => {
  return loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []);
};

export const toggleBookmark = (id: string): boolean => {
  const list = loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []);
  const exists = list.includes(id);
  const updated = exists ? list.filter(item => item !== id) : [...list, id];
  saveToStorage(STORAGE_KEYS.BOOKMARKS, updated);
  return !exists;
};

export const isBookmarked = (id: string): boolean => {
  const list = loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, []);
  return list.includes(id);
};

// ----------------- NOTIFICATIONS -----------------
export const getNotifications = (): AppNotification[] => {
  return loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
};

export const markNotificationRead = (id: string): AppNotification[] => {
  const list = loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

export const markAllNotificationsRead = (): AppNotification[] => {
  const list = loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const updated = list.map(n => ({ ...n, read: true }));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

// ----------------- FACULTY CLASS HELPERS -----------------
export const getFacultyAssignedClasses = (): FacultyAssignedClass[] => {
  return loadFromStorage<FacultyAssignedClass[]>(STORAGE_KEYS.FACULTY_CLASSES, []);
};

export const getStudentRoster = (subjectCode?: string): StudentRosterEntry[] => {
  const roster = loadFromStorage<StudentRosterEntry[]>(STORAGE_KEYS.STUDENT_ROSTER, []);
  return roster;
};

// ----------------- AUDIT LOGS -----------------
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase getAuditLogs error:', error);
      throw new Error(`Failed to load audit logs: ${error.message}`);
    }

    if (data) {
      return data.map(mapAuditLogFromDb);
    }
  }

  return loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
};

export const addAuditLog = async (
  actorName: string,
  actorRole: string,
  action: string,
  targetType: string,
  targetId: string,
  details: string
): Promise<AuditLog> => {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      actor_name: actorName,
      actor_role: actorRole,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Failed to persist audit log to Supabase:', error.message);
    } else if (data) {
      return mapAuditLogFromDb(data);
    }
  }

  // Demo Mode
  const newLog: AuditLog = {
    id: 'log-' + Date.now(),
    actorName,
    actorRole,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  const logs = loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const updated = [newLog, ...logs];
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
  return newLog;
};

// ----------------- FEEDBACK & GRIEVANCES -----------------
export const getFeedbackList = async (): Promise<FeedbackItem[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getFeedbackList error:', error);
      throw new Error(`Failed to load institutional grievances: ${error.message}`);
    }

    if (data) {
      return data.map(mapFeedbackFromDb);
    }
  }

  return loadFromStorage<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
};

export const submitFeedback = async (
  userName: string,
  userEmail: string,
  category: FeedbackItem['category'],
  message: string
): Promise<FeedbackItem> => {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      user_name: userName,
      user_email: userEmail,
      category,
      message,
      status: 'Pending',
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase submitFeedback error:', error);
      throw new Error(`Failed to submit grievance to college cell: ${error.message}`);
    }

    await addAuditLog(
      userName,
      'student',
      'SUBMIT_FEEDBACK',
      'feedback',
      data.id,
      `New feedback submitted under ${category}`
    );

    return mapFeedbackFromDb(data);
  }

  // Demo Mode
  const newFb: FeedbackItem = {
    id: 'fb-' + Date.now(),
    userName,
    userEmail,
    category,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
  };

  const list = loadFromStorage<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
  saveToStorage(STORAGE_KEYS.FEEDBACK, [newFb, ...list]);

  addAuditLog(
    userName,
    'student',
    'SUBMIT_FEEDBACK',
    'feedback',
    newFb.id,
    `New feedback logged under ${category}`
  );

  return newFb;
};

export const updateFeedbackStatus = async (
  id: string, 
  newStatus: FeedbackItem['status']
): Promise<FeedbackItem[]> => {
  assertCanMutateContent();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('feedback')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Supabase updateFeedbackStatus error:', error);
      throw new Error(`Failed to update grievance status: ${error.message}`);
    }

    return getFeedbackList();
  }

  // Demo Mode
  const list = loadFromStorage<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
  const updated = list.map(item => item.id === id ? { ...item, status: newStatus } : item);
  saveToStorage(STORAGE_KEYS.FEEDBACK, updated);
  return updated;
};

// ----------------- DEPARTMENTS -----------------
export const getDepartments = async (): Promise<DepartmentInfo[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(mapDepartmentFromDb);
      }

      if (error) {
        console.warn(`[CampusOne Supabase Departments Fetch] Status ${error.code}: ${error.message}. Using demo fallback.`);
      }
    } catch (e) {
      console.warn('[CampusOne Supabase Departments Fetch Failure]:', e);
    }
  }

  return loadFromStorage<DepartmentInfo[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
};

// ----------------- SYSTEM RESET & EXPORT -----------------
export const resetToInitialDemoData = (): void => {
  assertCanMutateContent();
  saveToStorage(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  saveToStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  saveToStorage(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  saveToStorage(STORAGE_KEYS.MATERIALS, INITIAL_STUDY_MATERIALS);
  saveToStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  saveToStorage(STORAGE_KEYS.TIMETABLE, STUDENT_TIMETABLE);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, STUDENT_ATTENDANCE);
  saveToStorage(STORAGE_KEYS.BOOKMARKS, ['not-1', 'mat-1']);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  saveToStorage(STORAGE_KEYS.REGISTERED_EVENTS, []);
  saveToStorage(STORAGE_KEYS.FACULTY_CLASSES, FACULTY_ASSIGNED_CLASSES);
  saveToStorage(STORAGE_KEYS.STUDENT_ROSTER, INITIAL_STUDENT_ROSTER);
  saveToStorage(STORAGE_KEYS.ATTENDANCE_SESSIONS, INITIAL_ATTENDANCE_SESSIONS);
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  saveToStorage(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
};
