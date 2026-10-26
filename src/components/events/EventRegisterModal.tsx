import React, { useState } from 'react';
import { EventItem } from '../../types';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Mail, 
  Sparkles, 
  QrCode,
  CheckCircle2,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { registerForEvent, isRegisteredForEvent } from '../../lib/storageService';

interface EventRegisterModalProps {
  event: EventItem | null;
  onClose: () => void;
  onRefreshEvents?: () => void;
}

export const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  event,
  onClose,
  onRefreshEvents
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [studentName, setStudentName] = useState(user.name);
  const [studentEmail, setStudentEmail] = useState(user.email);
  const [teamName, setTeamName] = useState('');
  const [dietary, setDietary] = useState('Standard Vegetarian');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!event) return null;

  const alreadyRegistered = isRegisteredForEvent(event.id);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await registerForEvent(event.id, studentEmail, studentName);
    if (res.success || alreadyRegistered) {
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      addNotification(
        'Event Entry Pass Ready',
        `Confirmed for ${event.title}. Entry pass generated for ${studentName}.`,
        'event'
      );
      if (onRefreshEvents) onRefreshEvents();
    } else {
      setErrorMessage(res.message);
      addNotification('Registration Notice', res.message, 'alert');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="relative h-44 bg-navy-950">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan text-navy-950">
              {event.category}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold mt-1 text-white leading-snug">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isSuccess && !alreadyRegistered ? (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-navy-950/60 rounded-2xl border border-slate-200/60 dark:border-navy-800">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{event.venue}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attendee Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              {event.category === 'Technical' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hackathon Team Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. CodeNovas"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-navy-950" />
                  <span>Confirm Registration</span>
                </button>
              </div>
            </form>
          ) : (
            /* Digital Entry Pass Layout */
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-extrabold text-sm">Official Event Registration Confirmed</span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-navy-800 text-left space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CampusOne Verified Pass</span>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">{event.title}</h4>
                    <p className="text-xs text-brand-cyan font-mono mt-0.5">Attendee: {studentName} ({studentEmail})</p>
                  </div>
                  <QrCode className="w-16 h-16 text-navy-900 dark:text-white shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-navy-800">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p className="col-span-2"><strong>Venue:</strong> {event.venue}</p>
                  <p className="col-span-2 text-emerald-500 font-semibold">Pass ID: #CAMPUS-EVT-{event.id.toUpperCase()}-PASS</p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket Pass</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
