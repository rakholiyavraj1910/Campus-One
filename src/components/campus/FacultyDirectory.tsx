import React, { useState } from 'react';
import { FacultyMember } from '../../types';
import { INITIAL_FACULTY } from '../../lib/mockData';
import { getFacultyList } from '../../lib/storageService';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  BookOpen, 
  Award, 
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const FacultyDirectory: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(() => {
    try {
      const saved = localStorage.getItem('campusone_faculty_v1');
      return saved ? JSON.parse(saved) : INITIAL_FACULTY;
    } catch (e) {
      return INITIAL_FACULTY;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [meetingModalFac, setMeetingModalFac] = useState<FacultyMember | null>(null);
  const [meetingDate, setMeetingDate] = useState('2026-10-28');
  const [meetingTime, setMeetingTime] = useState('02:30 PM');
  const [meetingReason, setMeetingReason] = useState('Discussion on Capstone Project & Paper Review');
  const { addNotification } = useNotifications();

  const filteredFaculty = facultyList.filter(f => {
    if (deptFilter !== 'All' && !f.department.toLowerCase().includes(deptFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        f.cabin.toLowerCase().includes(q) ||
        f.specialization.some(s => s.toLowerCase().includes(q)) ||
        f.subjectsTaught.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingModalFac) return;

    addNotification(
      'Faculty Consultation Confirmed',
      `Meeting booked with ${meetingModalFac.name} on ${meetingDate} at ${meetingTime} (${meetingModalFac.cabin}).`,
      'academic'
    );
    setMeetingModalFac(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Academic Faculty Roster
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Faculty Directory & Mentorship
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect with professors, research advisors, and laboratory directors
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by faculty, subject, cabin..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Computer Science', 'Artificial Intelligence', 'Electronics', 'Mechanical'].map((d) => (
          <button
            key={d}
            onClick={() => setDeptFilter(d === 'All' ? 'All' : d)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              (deptFilter === 'All' && d === 'All') || deptFilter === d
                ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((fac) => (
          <div
            key={fac.id}
            className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Avatar and names */}
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={fac.avatar}
                  alt={fac.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan/30 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                    {fac.name}
                  </h3>
                  <p className="text-xs font-semibold text-brand-cyan mt-0.5">
                    {fac.designation}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {fac.department}
                  </p>
                </div>
              </div>

              {/* Qualifications & Research */}
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-navy-800 pt-3 text-slate-600 dark:text-slate-300">
                <p className="text-[11px] text-slate-500 italic">
                  {fac.qualification} ({fac.experienceYears}+ yrs exp)
                </p>

                {/* Specializations pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {fac.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Cabin & Consultation Hours */}
                <div className="space-y-1.5 pt-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span>Cabin: <strong className="text-slate-800 dark:text-slate-200">{fac.cabin}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{fac.consultationHours}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{fac.researchPapersCount} Scopus/IEEE Research Publications</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2">
              <a
                href={`mailto:${fac.email}`}
                className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-brand-cyan transition-colors"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>

              <button
                onClick={() => setMeetingModalFac(fac)}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Meeting Modal */}
      {meetingModalFac && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Schedule Faculty Office Hours</h3>
                  <p className="text-xs text-slate-400">{meetingModalFac.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMeetingModalFac(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Consultation Time Slot (Office Hours: {meetingModalFac.consultationHours})
                </label>
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  placeholder="e.g. 02:30 PM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agenda / Reason for Meeting
                </label>
                <textarea
                  rows={3}
                  value={meetingReason}
                  onChange={(e) => setMeetingReason(e.target.value)}
                  placeholder="e.g. Doubts regarding Raft consensus algorithm or Capstone topic"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMeetingModalFac(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold shadow-md"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
