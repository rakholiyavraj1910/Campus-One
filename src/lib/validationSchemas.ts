import { z } from 'zod';

export const noticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(150, 'Title is too long'),
  category: z.enum(['Academic', 'Examination', 'Placement', 'Sports', 'Events', 'General']),
  department: z.string().min(1, 'Please specify target department'),
  content: z.string().min(10, 'Notice content must contain at least 10 characters'),
  isUrgent: z.boolean().default(false),
  attachmentName: z.string().optional(),
  attachmentSize: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(5, 'Event title must be at least 5 characters long'),
  category: z.enum(['Technical', 'Cultural', 'Workshop', 'Sports', 'Seminar', 'Competition']),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().min(1, 'Event timing is required'),
  venue: z.string().min(3, 'Venue is required'),
  organizer: z.string().min(3, 'Organizer name is required'),
  description: z.string().min(15, 'Description should provide at least 15 characters'),
  maxCapacity: z.number().int().positive('Max capacity must be greater than zero'),
});

export const facultySchema = z.object({
  name: z.string().min(3, 'Faculty name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().min(2, 'Department is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  email: z.string().email('Please enter a valid academic email address'),
  cabin: z.string().min(2, 'Cabin number / room is required'),
  consultationHours: z.string().min(5, 'Consultation hours are required'),
});

export const studyMaterialSchema = z.object({
  title: z.string().min(5, 'Material title must be at least 5 characters long'),
  subjectCode: z.string().min(2, 'Subject code is required'),
  subjectName: z.string().min(3, 'Subject name is required'),
  department: z.string().min(2, 'Department is required'),
  semester: z.number().min(1).max(8),
  type: z.enum(['Notes', 'Syllabus', 'Question Paper', 'Lab Manual', 'Reference']),
  fileFormat: z.string().default('PDF'),
});

export const feedbackSchema = z.object({
  userName: z.string().min(2, 'Your name is required'),
  userEmail: z.string().email('Valid institutional email is required'),
  category: z.enum(['Academic', 'Facilities', 'Hostel/Canteen', 'Exam Cell', 'General']),
  message: z.string().min(15, 'Feedback message must be at least 15 characters long'),
});

export const attendanceSessionSchema = z.object({
  subjectCode: z.string().min(2, 'Subject code is required'),
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Slot time is required'),
  topic: z.string().min(3, 'Lecture topic is required'),
});
