import React, { useState } from 'react';
import { STUDENT_TIMETABLE } from '../../lib/mockData';
import { Clock, MapPin, User, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

interface TodayScheduleWidgetProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const TodayScheduleWidget: React.FC<TodayScheduleWidgetProps> = ({ onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const filteredSlots = STUDENT_TIMETABLE.filter(s => s.day === selectedDay);

  const getSlotColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300';
      case 'cyan':
        return 'border-l-brand-cyan bg-cyan-50/50 dark:bg-brand-cyan/10 text-cyan-800 dark:text-cyan-300';
      case 'emerald':
        return 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';
      case 'purple':
        return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300';
      case 'amber':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300';
      default:
        return 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300';
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Today's Class Schedule
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            B.Tech CSE Sem 6 • Section A (Tech Tower LH-302)
          </p>
        </div>

        <button
          onClick={() => onNavigate('student', 'timetable')}
          className="text-xs font-bold text-brand-cyan hover:underline flex items-center space-x-1"
        >
          <span>Full Timetable</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-3 mb-2 scrollbar-none text-xs">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Class slots list */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {filteredSlots.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-brand-cyan" />
            <p className="text-xs font-medium">No scheduled lectures on {selectedDay}</p>
          </div>
        ) : (
          filteredSlots.map((slot, index) => {
            const isFirst = index === 0 && selectedDay === 'Monday';

            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-2xl border-l-4 transition-all relative ${getSlotColor(slot.color)} border border-slate-200/50 dark:border-navy-800/80`}
              >
                {isFirst && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-white shadow-xs">
                    Next Up
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span className="font-mono text-brand-cyan">{slot.subjectCode}</span>
                    <span>•</span>
                    <span className="truncate">{slot.subjectName}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    slot.type === 'Lab' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    {slot.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{slot.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{slot.room}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-navy-700/50 flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">Faculty: {slot.facultyName}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
