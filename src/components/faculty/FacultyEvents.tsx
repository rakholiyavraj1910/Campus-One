import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Tag,
  Mail,
  User as UserIcon,
  X,
  Sparkles,
  CalendarDays,
  Building2,
  RefreshCw
} from 'lucide-react';
import { EventItem, UserProfile, COLLEGE_DEPARTMENTS } from '../../types';
import { getEvents, addEvent, updateEvent, deleteEvent } from '../../lib/storageService';
import { ConfirmationModal } from '../admin/ConfirmationModal';
import { useNotifications } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

interface FacultyEventsProps {
  user: UserProfile;
}

const EVENT_CATEGORIES: EventItem['category'][] = [
  'Technical',
  'Workshop',
  'Seminar',
  'Cultural',
  'Sports',
  'Competition'
];

const DEFAULT_BANNER_OPTIONS = [
  { label: 'Technical Workshop', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Seminar / Conference', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Coding / Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Campus Culture / Talk', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
];

export const FacultyEvents: React.FC<FacultyEventsProps> = ({ user }) => {
  const { addNotification } = useNotifications();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'dept' | 'mine'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventItem['category']>('Workshop');
  const [formDepartment, setFormDepartment] = useState<string>(user.department || 'Computer Engineering');
  const [formAudience, setFormAudience] = useState<string>('Students');
  const [formDate, setFormDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formTime, setFormTime] = useState<string>('10:00 AM - 01:00 PM');
  const [formVenue, setFormVenue] = useState<string>('');
  const [formOrganizer, setFormOrganizer] = useState<string>(user.name);
  const [formContactPerson, setFormContactPerson] = useState<string>(user.name);
  const [formContactEmail, setFormContactEmail] = useState<string>(user.email);
  const [formCapacity, setFormCapacity] = useState<number>(60);
  const [formRegistrationOpen, setFormRegistrationOpen] = useState<boolean>(true);
  const [formDeadline, setFormDeadline] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('Workshop, Hands-on');
  const [formBannerUrl, setFormBannerUrl] = useState<string>(DEFAULT_BANNER_OPTIONS[0].url);
  const [formDescription, setFormDescription] = useState<string>('');

  const loadAllEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Error loading events:', err);
      addNotification('Events Load Error', 'Could not retrieve events from database.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setErrorMessage(null);
    setFormTitle('');
    setFormCategory('Workshop');
    setFormDepartment(user.department || 'Computer Engineering');
    setFormAudience('Students');
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setFormDate(dateStr);
    setFormEndDate('');
    setFormTime('10:00 AM - 01:00 PM');
    setFormVenue('Main Seminar Hall, Block A');
    setFormOrganizer(`${user.name} (${user.department || 'Faculty'})`);
    setFormContactPerson(user.name);
    setFormContactEmail(user.email);
    setFormCapacity(60);
    setFormRegistrationOpen(true);
    setFormDeadline(dateStr);
    setFormTags('Workshop, Department');
    setFormBannerUrl(DEFAULT_BANNER_OPTIONS[0].url);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setErrorMessage(null);
    setFormTitle(event.title);
    setFormCategory(event.category);
    setFormDepartment(event.department || user.department || 'All');
    setFormAudience(event.targetAudience || 'All');
    setFormDate(event.date);
    setFormEndDate(event.endDate || '');
    setFormTime(event.time);
    setFormVenue(event.venue);
    setFormOrganizer(event.organizer);
    setFormContactPerson(event.contactPerson || user.name);
    setFormContactEmail(event.contactEmail || user.email);
    setFormCapacity(event.maxCapacity || 50);
    setFormRegistrationOpen(event.registrationOpen);
    setFormDeadline(event.registrationDeadline || event.date);
    setFormTags(event.tags ? event.tags.join(', ') : '');
    setFormBannerUrl(event.bannerImage || DEFAULT_BANNER_OPTIONS[0].url);
    setFormDescription(event.description);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formTitle.trim()) {
      setErrorMessage('Event title is required.');
      return;
    }
    if (!formDate) {
      setErrorMessage('Event start date is required.');
      return;
    }
    if (!formVenue.trim()) {
      setErrorMessage('Event venue/location is required.');
      return;
    }
    if (!formDescription.trim()) {
      setErrorMessage('Please provide an event description.');
      return;
    }

    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        const updated: EventItem = {
          ...editingEvent,
          title: formTitle.trim(),
          category: formCategory,
          department: formDepartment,
          targetAudience: formAudience,
          date: formDate,
          endDate: formEndDate ? formEndDate : undefined,
          time: formTime.trim(),
          venue: formVenue.trim(),
          organizer: formOrganizer.trim(),
          contactPerson: formContactPerson.trim(),
          contactEmail: formContactEmail.trim(),
          maxCapacity: Number(formCapacity) || 50,
          registrationOpen: formRegistrationOpen,
          registrationDeadline: formDeadline || formDate,
          tags: parsedTags,
          bannerImage: formBannerUrl,
          description: formDescription.trim(),
        };

        const res = await updateEvent(updated);
        setEvents(prev => prev.map(ev => ev.id === res.id ? res : ev));
        addNotification('Event Updated', `Updated "${res.title}" successfully.`, 'academic');
      } else {
        const newEventPayload = {
          title: formTitle.trim(),
          category: formCategory,
          department: formDepartment,
          targetAudience: formAudience,
          date: formDate,
          endDate: formEndDate ? formEndDate : undefined,
          time: formTime.trim(),
          venue: formVenue.trim(),
          organizer: formOrganizer.trim(),
          contactPerson: formContactPerson.trim(),
          contactEmail: formContactEmail.trim(),
          maxCapacity: Number(formCapacity) || 50,
          registrationOpen: formRegistrationOpen,
          registrationDeadline: formDeadline || formDate,
          tags: parsedTags,
          bannerImage: formBannerUrl,
          description: formDescription.trim(),
          createdBy: user.id !== 'guest' ? user.id : undefined,
        };

        const res = await addEvent(newEventPayload);
        setEvents(prev => [res, ...prev]);
        addNotification('Event Published', `Created new ${formCategory}: "${res.title}".`, 'academic');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error('Error saving event:', err);
      setErrorMessage(err.message || 'Failed to save event to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      await deleteEvent(deletingEvent.id);
      setEvents(prev => prev.filter(ev => ev.id !== deletingEvent.id));
      addNotification('Event Removed', `Deleted "${deletingEvent.title}".`, 'notice');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      addNotification('Delete Failed', err.message || 'Failed to delete event.', 'alert');
    } finally {
      setDeletingEvent(null);
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        (ev.organizer && ev.organizer.toLowerCase().includes(q)) ||
        (ev.tags && ev.tags.some(t => t.toLowerCase().includes(q)))
      );

      // Category
      const matchesCategory = categoryFilter === 'All' || ev.category === categoryFilter;

      // Scope
      let matchesScope = true;
      if (scopeFilter === 'dept') {
        matchesScope = !ev.department || ev.department === 'All' || ev.department === user.department;
      } else if (scopeFilter === 'mine') {
        matchesScope = ev.createdBy === user.id || ev.contactEmail === user.email;
      }

      return matchesSearch && matchesCategory && matchesScope;
    });
  }, [events, searchQuery, categoryFilter, scopeFilter, user]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Department Academic Events &amp; Workshops
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Department Seminars &amp; Lectures
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize guest lectures, technical workshops, and departmental events with direct Supabase persistence.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={loadAllEvents}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
            title="Refresh events list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event / Workshop</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-slate-200/80 dark:border-navy-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, venue, organizer..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto scrollbar-none">
          {/* Scope Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${scopeFilter === 'all' ? 'bg-white dark:bg-navy-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setScopeFilter('dept')}
              className={`px-3 py-1 rounded-lg transition-colors ${scopeFilter === 'dept' ? 'bg-white dark:bg-navy-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              My Dept
            </button>
            <button
              onClick={() => setScopeFilter('mine')}
              className={`px-3 py-1 rounded-lg transition-colors ${scopeFilter === 'mine' ? 'bg-white dark:bg-navy-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Created by Me
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none shrink-0"
          >
            <option value="All">All Categories</option>
            {EVENT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200 dark:border-navy-800 space-y-4">
              <div className="h-40 bg-slate-200 dark:bg-navy-800 rounded-2xl w-full" />
              <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-navy-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-navy-800 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Events Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'All' || scopeFilter !== 'all'
              ? 'No events match the selected criteria. Try adjusting your filters or search terms.'
              : 'No departmental academic events have been scheduled yet.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const isOwner = ev.createdBy === user.id || ev.contactEmail === user.email || user.role === 'admin';
            const capacityRatio = ev.maxCapacity > 0 ? (ev.registeredCount / ev.maxCapacity) * 100 : 0;

            return (
              <div 
                key={ev.id}
                className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-navy-950">
                  <img 
                    src={ev.bannerImage || DEFAULT_BANNER_OPTIONS[0].url} 
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 dark:bg-navy-900/90 text-indigo-700 dark:text-indigo-400 shadow-xs backdrop-blur-xs">
                    {ev.category}
                  </span>

                  {/* Registration Status */}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ev.registrationOpen
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-rose-500 text-white shadow-xs'
                  }`}>
                    {ev.registrationOpen ? 'Registration Open' : 'Closed'}
                  </span>

                  {/* Title overlay in banner bottom */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] font-medium text-slate-300 flex items-center space-x-1 mb-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{ev.department || 'All Departments'}</span>
                    </p>
                    <h3 className="text-sm font-extrabold line-clamp-1 text-white">
                      {ev.title}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {ev.description}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{ev.date}</span>
                        {ev.endDate && <span>to {ev.endDate}</span>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{ev.time}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>

                      {ev.contactPerson && (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{ev.contactPerson} ({ev.contactEmail})</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {ev.tags && ev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {ev.tags.map((tg, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Attendance / Capacity</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {ev.registeredCount || 0} / {ev.maxCapacity} seats
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          capacityRatio >= 90 ? 'bg-rose-500' : capacityRatio >= 60 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, capacityRatio))}%` }}
                      />
                    </div>

                    {/* Owner Management Controls */}
                    {isOwner && (
                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          onClick={() => openEditModal(ev)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingEvent(ev)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel / Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-navy-700 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingEvent ? 'Edit Academic Event' : 'Schedule Department Event / Workshop'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in the event parameters. Saved directly to Supabase.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Hands-on Docker & Kubernetes Workshop"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventItem['category'])}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  >
                    {EVENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="All">All Departments (Institutional)</option>
                    {COLLEGE_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, End Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Time Slot *
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="10:00 AM - 01:00 PM"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Venue & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Venue / Hall *
                  </label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="Auditorium Block A or Lab 202"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Max Registration Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(parseInt(e.target.value) || 60)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Organizer & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Organizer / Committee
                  </label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    placeholder="e.g. Dept Tech Committee"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Registration Open & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={formRegistrationOpen}
                    onChange={(e) => setFormRegistrationOpen(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Registration Currently Open</span>
                </label>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Tags & Banner Preset */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Banner Image Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEFAULT_BANNER_OPTIONS.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormBannerUrl(opt.url)}
                      className={`relative h-16 rounded-xl overflow-hidden border-2 text-left transition-all ${
                        formBannerUrl === opt.url
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 flex items-end p-1 text-[9px] font-bold text-white">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Event Description &amp; Syllabus/Schedule *
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the seminar, syllabus covered, pre-requisites, and faculty instructor info..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{editingEvent ? 'Update Event' : 'Publish Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deletingEvent && (
        <ConfirmationModal
          isOpen={true}
          title="Cancel / Delete Event"
          message={`Are you sure you want to remove "${deletingEvent.title}"? This event and its registration roster will be deleted from the database.`}
          confirmLabel="Yes, Delete Event"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEvent(null)}
        />
      )}
    </div>
  );
};
