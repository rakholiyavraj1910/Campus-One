import React from 'react';
import { Phone, Mail, ShieldAlert, HeartPulse, Building, ChevronRight } from 'lucide-react';
import { CAMPUS_OFFICES } from '../../lib/mockData';

interface QuickContactBarProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const QuickContactBar: React.FC<QuickContactBarProps> = ({ onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#102a43] text-white rounded-3xl p-6 sm:p-7 border border-navy-800 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>24/7 Campus Directory & Helpdesk</span>
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Emergency Contacts & Administrative Helplines
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Direct institutional contact points for students, parents, and visitors
          </p>
        </div>

        <button
          onClick={() => onNavigate('campus', 'offices')}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1"
        >
          <span>All Campus Offices & Grievances</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900/80 p-4 rounded-2xl border border-rose-500/30">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Medical & Security Emergency</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">+91 98200 99999</p>
          <p className="text-[11px] text-slate-400 mt-1">24x7 Ambulance & Campus Security</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold mb-1">
            <Building className="w-4 h-4" />
            <span>Registrar & Admissions</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">(022) 2854-1001</p>
          <p className="text-[11px] text-slate-400 mt-1">registrar@campusone.edu</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold mb-1">
            <Phone className="w-4 h-4" />
            <span>Examination Cell</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">(022) 2854-1005</p>
          <p className="text-[11px] text-slate-400 mt-1">Hall tickets, transcripts, re-evaluation</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
            <Mail className="w-4 h-4" />
            <span>Training & Placement Cell</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">(022) 2854-1012</p>
          <p className="text-[11px] text-slate-400 mt-1">placements@campusone.edu</p>
        </div>
      </div>
    </div>
  );
};
