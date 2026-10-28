import React, { useState } from 'react';
import { STUDENT_TIMETABLE } from '../../lib/mockData';
import { Clock, MapPin, User, Calendar, Printer, Filter, BookOpen } from 'lucide-react';

export const TimetableSchedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<'All' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [selectedType, setSelectedType] = useState<string>('All');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredSlots = STUDENT_TIMETABLE.filter(s => {
    if (selectedDay !== 'All' && s.day !== selectedDay) return false;
    if (selectedType !== 'All' && s.type !== selectedType) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Even Semester 2026
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Official Class Timetable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            B.Tech Computer Science & Engineering • Semester 6 • Division A
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-brand-cyan" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Days */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs max-w-full scrollbar-none momentum-scroll">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedDay === 'All'
                ? 'bg-brand-cyan text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            All Week
          </button>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDay === d
                  ? 'bg-brand-cyan text-navy-950 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-1 text-xs overflow-x-auto pb-1">
          {['All', 'Lecture', 'Lab', 'Tutorial'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedType === t
                  ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-950 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-brand-cyan" />
            <p className="text-sm font-semibold">No scheduled sessions match the filter</p>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-brand-cyan/50 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                    {slot.day}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slot.type === 'Lab'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : slot.type === 'Tutorial'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    {slot.type}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-mono text-xs font-bold text-brand-cyan">
                    {slot.subjectCode}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {slot.subjectName}
                  </h3>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{slot.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Location: <strong className="text-slate-800 dark:text-slate-200">{slot.room}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Faculty: {slot.facultyName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>3 Credits</span>
                <span className="text-brand-cyan font-semibold">Mandatory Core</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
