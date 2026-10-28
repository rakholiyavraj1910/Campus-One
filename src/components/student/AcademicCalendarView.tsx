import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { INITIAL_HOLIDAYS } from '../../lib/mockData';

export const AcademicCalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0 = Nov 2026, 1 = Dec 2026, 2 = Jan 2027

  const months = [
    { name: 'November 2026', days: 30, startDayOffset: 0 }, // starts Sunday
    { name: 'December 2026', days: 31, startDayOffset: 2 }, // starts Tuesday
    { name: 'January 2027', days: 31, startDayOffset: 5 }   // starts Friday
  ];

  const current = months[currentMonthIndex];

  // Specific highlighted dates for November 2026
  const keyEventsNov: Record<number, { title: string; type: string }> = {
    1: { title: 'Diwali Break Begins', type: 'holiday' },
    2: { title: 'Diwali Laxmi Pujan', type: 'holiday' },
    5: { title: 'AI & Quantum Summit', type: 'event' },
    10: { title: 'Mid-Sem Exams Begin', type: 'exam' },
    12: { title: 'Kubernetes Workshop', type: 'event' },
    18: { title: 'HackNova 2026 Kickoff', type: 'event' },
    20: { title: 'HackNova Grand Finale', type: 'event' },
    26: { title: 'Constitution Day', type: 'holiday' }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Institutional Almanac
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Academic Calendar & University Holidays
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official semester dates, holiday breaks, exam periods, and cultural fests
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 dark:bg-navy-800 p-1 rounded-xl flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-navy-900 text-brand-cyan shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-navy-900 text-brand-cyan shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {current.name}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
              Odd / Even Sem 2026
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
              disabled={currentMonthIndex === 0}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
              disabled={currentMonthIndex === months.length - 1}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <div>
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-100 dark:border-navy-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
              {/* Padding empty slots */}
              {Array.from({ length: current.startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[90px] rounded-xl sm:rounded-2xl bg-slate-50/40 dark:bg-navy-950/20" />
              ))}

              {/* Month days */}
              {Array.from({ length: current.days }).map((_, i) => {
                const dayNum = i + 1;
                const eventInfo = currentMonthIndex === 0 ? keyEventsNov[dayNum] : undefined;

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[56px] sm:min-h-[90px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                      eventInfo?.type === 'holiday'
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                        : eventInfo?.type === 'exam'
                        ? 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                        : eventInfo?.type === 'event'
                        ? 'border-purple-300 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20'
                        : 'border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] sm:text-xs font-bold ${eventInfo ? 'text-brand-cyan' : 'text-slate-700 dark:text-slate-300'}`}>
                        {dayNum}
                      </span>
                      {eventInfo && (
                        <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
                          eventInfo.type === 'holiday' ? 'bg-rose-500' : eventInfo.type === 'exam' ? 'bg-amber-500' : 'bg-purple-500'
                        }`} />
                      )}
                    </div>

                    {eventInfo && (
                      <div className="mt-0.5 sm:mt-1">
                        <p className={`text-[8px] sm:text-[10px] font-bold leading-tight line-clamp-2 ${
                          eventInfo.type === 'holiday'
                            ? 'text-rose-700 dark:text-rose-300'
                            : eventInfo.type === 'exam'
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-purple-700 dark:text-purple-300'
                        }`}>
                          {eventInfo.title}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Agenda list view */
          <div className="space-y-3">
            {INITIAL_HOLIDAYS.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/80 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-navy-900 text-brand-cyan font-bold flex flex-col items-center justify-center border border-slate-200 dark:border-navy-700 shrink-0">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Date</span>
                    <span className="text-sm font-extrabold">{h.date.split('-')[2]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{h.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{h.description}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  h.type === 'National Holiday'
                    ? 'bg-rose-500/20 text-rose-500'
                    : h.type === 'Exam Period'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-brand-cyan/20 text-brand-cyan'
                }`}>
                  {h.type}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>National & Festival Holidays</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Examinations & Assessments</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Hackathons, Fests & Seminars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
