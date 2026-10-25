import React, { useState } from 'react';
import { EventItem } from '../../types';
import { Calendar, Plus, Trash2, Edit3, Users, MapPin, X, Sparkles } from 'lucide-react';
import { addEvent, updateEvent, deleteEvent } from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';

interface ManageEventsProps {
  events: EventItem[];
  onRefreshEvents: () => void;
}

export const ManageEvents: React.FC<ManageEventsProps> = ({ events, onRefreshEvents }) => {
  const { addNotification } = useNotifications();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Technical');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('10:00 AM - 04:00 PM');
  const [venue, setVenue] = useState('Steve Jobs Auditorium');
  const [organizer, setOrganizer] = useState('GDSC Chapter & Dept of CSE');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80');
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [tags, setTags] = useState('Tech, AI, Coding');

  const openCreateModal = () => {
    setTitle('');
    setCategory('Technical');
    setDate('2026-11-20');
    setTime('10:00 AM - 04:00 PM');
    setVenue('Steve Jobs Auditorium');
    setOrganizer('GDSC & CSE Dept');
    setDescription('');
    setMaxCapacity(300);
    setTags('Tech, AI, Coding');
    setEditingEvent(null);
    setModalMode('create');
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setCategory(evt.category);
    setDate(evt.date);
    setTime(evt.time);
    setVenue(evt.venue);
    setOrganizer(evt.organizer);
    setDescription(evt.description);
    setBannerImage(evt.bannerImage);
    setMaxCapacity(evt.maxCapacity);
    setTags(evt.tags.join(', '));
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

      if (modalMode === 'create') {
        await addEvent({
          title,
          category,
          date,
          time,
          venue,
          organizer,
          description,
          bannerImage: bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
          maxCapacity: Number(maxCapacity),
          registrationOpen: true,
          registrationDeadline: date,
          tags: tagList,
          contactPerson: 'Event Coordinator',
          contactEmail: 'events@campusone.edu',
        });
        addNotification('New Event Created', `Event "${title}" opened for registrations.`, 'event');
      } else if (modalMode === 'edit' && editingEvent) {
        await updateEvent({
          ...editingEvent,
          title,
          category,
          date,
          time,
          venue,
          organizer,
          description,
          bannerImage,
          maxCapacity: Number(maxCapacity),
          tags: tagList,
        });
        addNotification('Event Updated', `Event "${title}" was updated.`, 'event');
      }

      setModalMode(null);
      onRefreshEvents();
    } catch (err: any) {
      addNotification('Error Saving Event', err.message || 'Failed to save event.', 'alert');
    }
  };

  const handleDelete = async (id: string, eventTitle: string) => {
    if (confirm(`Delete event "${eventTitle}"?`)) {
      try {
        await deleteEvent(id);
        addNotification('Event Removed', `Deleted event: ${eventTitle}`, 'alert');
        onRefreshEvents();
      } catch (err: any) {
        addNotification('Error Deleting Event', err.message || 'Failed to delete event.', 'alert');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Manage Campus Events & Symposiums
          </h3>
          <p className="text-xs text-slate-400">Configure schedules, venues, and registration caps</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Venue</th>
                <th className="py-3 px-3">Registrations</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {evt.title}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {evt.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    {evt.date}
                  </td>
                  <td className="py-3.5 px-3 truncate max-w-xs">
                    {evt.venue}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-brand-cyan">{evt.registeredCount}</span> / {evt.maxCapacity}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditModal(evt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-cyan" />
                <span>{modalMode === 'create' ? 'Host New Campus Event' : 'Edit Event'}</span>
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. National Hackathon 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Competition">Competition</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Steve Jobs Auditorium"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, prize pools, themes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold shadow-md"
                >
                  {modalMode === 'create' ? 'Publish Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
