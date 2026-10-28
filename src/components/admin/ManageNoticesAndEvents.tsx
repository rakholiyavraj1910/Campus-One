import React, { useState } from 'react';
import { Bell, Calendar, Layers } from 'lucide-react';
import { Notice, EventItem } from '../../types';
import { ManageNotices } from './ManageNotices';
import { ManageEvents } from './ManageEvents';

interface ManageNoticesAndEventsProps {
  notices: Notice[];
  events: EventItem[];
  onRefreshNotices: () => void;
  onRefreshEvents: () => void;
}

export const ManageNoticesAndEvents: React.FC<ManageNoticesAndEventsProps> = ({
  notices,
  events,
  onRefreshNotices,
  onRefreshEvents
}) => {
  const [subTab, setSubTab] = useState<'notices' | 'events'>('notices');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Subtab Switcher */}
      <div className="bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-2 max-w-md">
        <button
          onClick={() => setSubTab('notices')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            subTab === 'notices'
              ? 'bg-teal-500 text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Campus Notices &amp; Circulars</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            subTab === 'notices' ? 'bg-navy-950/30 text-navy-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {notices.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('events')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            subTab === 'events'
              ? 'bg-teal-500 text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Campus Events Calendar</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            subTab === 'events' ? 'bg-navy-950/30 text-navy-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {events.length}
          </span>
        </button>
      </div>

      {/* Render Active View */}
      {subTab === 'notices' ? (
        <ManageNotices notices={notices} onRefreshNotices={onRefreshNotices} />
      ) : (
        <ManageEvents events={events} onRefreshEvents={onRefreshEvents} />
      )}
    </div>
  );
};
