import React, { useState } from 'react';
import { EventItem } from '../../types';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  Check, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { isRegisteredForEvent } from '../../lib/storageService';
import { EventRegisterModal } from './EventRegisterModal';

interface EventsListProps {
  events: EventItem[];
  onRefreshEvents?: () => void;
}

export const EventsList: React.FC<EventsListProps> = ({ events, onRefreshEvents }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  const categories = ['All', 'Technical', 'Seminar', 'Workshop', 'Cultural', 'Sports'];

  const filteredEvents = events.filter(e => {
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            University Student Council
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Campus Events, Fests & Technical Symposiums
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register for national hackathons, cultural pro-nights, hands-on workshops & sports meets
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, workshops, fests..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs max-w-full scrollbar-none momentum-scroll">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              categoryFilter === c
                ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-6">
        {filteredEvents.map((evt) => {
          const registered = isRegisteredForEvent(evt.id);
          const percentCapacity = Math.min(100, Math.round((evt.registeredCount / evt.maxCapacity) * 100));

          return (
            <div
              key={evt.id}
              className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-navy-950">
                  <img
                    src={evt.bannerImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan text-navy-950 shadow-sm">
                    {evt.category}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{evt.date}</span>
                    </span>
                    <span className="text-[11px] opacity-80">{evt.time}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {evt.title}
                  </h3>

                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {evt.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{evt.registeredCount} confirmed attendees</span>
                      <span>{evt.maxCapacity} cap</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                      <div className="h-full rounded-full bg-brand-cyan" style={{ width: `${percentCapacity}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedEventModal(evt)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    registered
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-sm'
                  }`}
                >
                  {registered ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Entry Pass Confirmed (View Pass)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-navy-950" />
                      <span>Register for Event</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {selectedEventModal && (
        <EventRegisterModal
          event={selectedEventModal}
          onClose={() => setSelectedEventModal(null)}
          onRefreshEvents={onRefreshEvents}
        />
      )}
    </div>
  );
};
