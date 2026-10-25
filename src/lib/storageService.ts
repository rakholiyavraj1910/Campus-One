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
  AuditLog,
  FeedbackItem
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
  INITIAL_FEEDBACK
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
        console.warn(`[CampusOne Supabase Notice Fetch] Status ${error.code}: ${error.message}. Using demo fallback.`);
      }
    } catch (e) {
      console.warn('[CampusOne Supabase Notice Fetch Failure]:', e);
    }
  }

  // Fallback to local demo records
  return loadFromStorage<Notice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
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
        console.warn(`[CampusOne Supabase Event Fetch] Status ${error.code}: ${error.message}. Using demo fallback.`);
      }
    } catch (e) {
      console.warn('[CampusOne Supabase Event Fetch Failure]:', e);
    }
  }

  return loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
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
        console.warn(`[CampusOne Supabase Faculty Fetch] Status ${error.code}: ${error.message}. Using demo fallback.`);
      }
    } catch (e) {
      console.warn('[CampusOne Supabase Faculty Fetch Failure]:', e);
    }
  }

  return loadFromStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
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
        console.warn(`[CampusOne Supabase Materials Fetch] Status ${error.code}: ${error.message}. Using demo fallback.`);
      }
    } catch (e) {
      console.warn('[CampusOne Supabase Materials Fetch Failure]:', e);
    }
  }

  return loadFromStorage<StudyMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_STUDY_MATERIALS);
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

// ----------------- ASSIGNMENTS -----------------
export const getAssignments = (): AssignmentItem[] => {
  return loadFromStorage<AssignmentItem[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
};

export const submitAssignmentSolution = (id: string, fileName: string): AssignmentItem | null => {
  const list = loadFromStorage<AssignmentItem[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
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
  return loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, STUDENT_TIMETABLE);
};

export const getAttendanceRecords = (): SubjectAttendance[] => {
  return loadFromStorage<SubjectAttendance[]>(STORAGE_KEYS.ATTENDANCE, STUDENT_ATTENDANCE);
};

export const updateSubjectAttendance = (subjectCode: string, deltaAttended: number, deltaTotal: number): SubjectAttendance[] => {
  const list = loadFromStorage<SubjectAttendance[]>(STORAGE_KEYS.ATTENDANCE, STUDENT_ATTENDANCE);
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
  return loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, ['not-1', 'mat-1']);
};

export const toggleBookmark = (id: string): boolean => {
  const list = loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, ['not-1', 'mat-1']);
  const exists = list.includes(id);
  const updated = exists ? list.filter(item => item !== id) : [...list, id];
  saveToStorage(STORAGE_KEYS.BOOKMARKS, updated);
  return !exists;
};

export const isBookmarked = (id: string): boolean => {
  const list = loadFromStorage<string[]>(STORAGE_KEYS.BOOKMARKS, ['not-1', 'mat-1']);
  return list.includes(id);
};

// ----------------- NOTIFICATIONS -----------------
export const getNotifications = (): AppNotification[] => {
  return loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
};

export const markNotificationRead = (id: string): AppNotification[] => {
  const list = loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

export const markAllNotificationsRead = (): AppNotification[] => {
  const list = loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = list.map(n => ({ ...n, read: true }));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  return updated;
};

// ----------------- FACULTY & ATTENDANCE SESSIONS -----------------
export const getFacultyAssignedClasses = (): FacultyAssignedClass[] => {
  return loadFromStorage<FacultyAssignedClass[]>(STORAGE_KEYS.FACULTY_CLASSES, FACULTY_ASSIGNED_CLASSES);
};

export const getStudentRoster = (subjectCode?: string): StudentRosterEntry[] => {
  return loadFromStorage<StudentRosterEntry[]>(STORAGE_KEYS.STUDENT_ROSTER, INITIAL_STUDENT_ROSTER);
};

export const getAttendanceSessions = (): AttendanceSession[] => {
  return loadFromStorage<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, INITIAL_ATTENDANCE_SESSIONS);
};

export const saveAttendanceSession = async (
  sessionData: Omit<AttendanceSession, 'id'>,
  roster: StudentRosterEntry[]
): Promise<AttendanceSession> => {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      faculty_name: sessionData.facultyName,
      subject_code: sessionData.subjectCode,
      subject_name: sessionData.subjectName,
      date: sessionData.date,
      slot: sessionData.slot,
      topic: sessionData.topic,
      semester: 6,
      division: 'A',
      present_count: sessionData.presentCount,
      total_count: sessionData.totalCount,
    };

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase saveAttendanceSession error:', error);
      throw new Error(`Failed to save attendance session to database: ${error.message}`);
    }

    // Write audit log
    await addAuditLog(
      sessionData.facultyName,
      'faculty',
      'RECORD_ATTENDANCE',
      'attendance_sessions',
      data.id,
      `Marked attendance for ${sessionData.subjectCode}: ${sessionData.presentCount}/${sessionData.totalCount} present. Topic: "${sessionData.topic}"`
    );

    return {
      ...sessionData,
      id: data.id,
    };
  }

  // Demo Mode
  const newSession: AttendanceSession = {
    ...sessionData,
    id: 'ses-' + Date.now(),
  };

  const sessions = loadFromStorage<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE_SESSIONS, INITIAL_ATTENDANCE_SESSIONS);
  saveToStorage(STORAGE_KEYS.ATTENDANCE_SESSIONS, [newSession, ...sessions]);
  saveToStorage(STORAGE_KEYS.STUDENT_ROSTER, roster);

  addAuditLog(
    sessionData.facultyName,
    'faculty',
    'RECORD_ATTENDANCE',
    'attendance_sessions',
    newSession.id,
    `Marked attendance for ${sessionData.subjectCode}: ${sessionData.presentCount}/${sessionData.totalCount} present. Topic: "${sessionData.topic}"`
  );

  return newSession;
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
