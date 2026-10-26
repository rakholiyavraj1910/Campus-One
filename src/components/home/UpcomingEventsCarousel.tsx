import React from 'react';
import { EventItem } from '../../types';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isRegisteredForEvent, registerForEvent } from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface UpcomingEventsCarouselProps {
  events: EventItem[];
  onNavigate: (page: string, subTab?: string) => void;
  onRefreshEvents?: () => void;
}

export const UpcomingEventsCarousel: React.FC<UpcomingEventsCarouselProps> = ({
  events,
  onNavigate,
  onRefreshEvents
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleQuickRegister = async (e: React.MouseEvent, evt: EventItem) => {
    e.stopPropagation();
    const result = await registerForEvent(evt.id, user.email, user.name);
    if (result.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      addNotification('Event Pass Generated', `You are confirmed for ${evt.title}! Entry pass ready.`, 'event');
      if (onRefreshEvents) onRefreshEvents();
    } else {
      addNotification('Event Registration', result.message, 'alert');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-navy-900 dark:text-white flex items-center space-x-2">
            <span>Featured Events & Competitions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Registrations Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hackathons, guest seminars, workshops & cultural fest
          </p>
        </div>

        <button
          onClick={() => onNavigate('events')}
          className="text-xs font-bold text-brand-cyan hover:underline flex items-center space-x-1"
        >
          <span>Explore All Events</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.slice(0, 4).map((evt) => {
          const registered = isRegisteredForEvent(evt.id);
          const percentCapacity = Math.min(100, Math.round((evt.registeredCount / evt.maxCapacity) * 100));

          return (
            <div
              key={evt.id}
              onClick={() => onNavigate('events')}
              className="group bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Image Banner */}
              <div className="relative h-40 overflow-hidden bg-navy-950">
                <img
                  src={evt.bannerImage}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan text-navy-950 shadow-sm">
                  {evt.category}
                </span>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                    <span className="font-semibold text-[11px]">{evt.date}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{evt.time.split('-')[0]}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors line-clamp-2 leading-snug">
                    {evt.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Capacity Progress */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-brand-cyan" />
                      <span>{evt.registeredCount} registered</span>
                    </span>
                    <span>{evt.maxCapacity} cap</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-brand-cyan transition-all"
                      style={{ width: `${percentCapacity}%` }}
                    />
                  </div>
                </div>

                {/* Quick Register Action */}
                <button
                  onClick={(e) => handleQuickRegister(e, evt)}
                  disabled={registered}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    registered
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-100 hover:bg-brand-cyan hover:text-navy-950 dark:bg-navy-800 dark:hover:bg-brand-cyan dark:text-white dark:hover:text-navy-950 text-slate-800'
                  }`}
                >
                  {registered ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pass Confirmed</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-cyan group-hover:text-navy-950" />
                      <span>Instant Registration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
