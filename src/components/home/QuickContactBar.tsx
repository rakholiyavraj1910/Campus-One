import React from 'react';
import { Phone, Mail, ShieldAlert, HeartPulse, Building, ChevronRight } from 'lucide-react';

interface QuickContactBarProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const QuickContactBar: React.FC<QuickContactBarProps> = ({ onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#102a43] text-white rounded-3xl p-6 sm:p-7 border border-navy-800 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-brand-cyan" />
            <span>Government Polytechnic Ahmedabad Directory</span>
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Administrative Helplines & Student Section
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Direct institutional contact points for students, parents, and visitors
          </p>
        </div>

        <button
          onClick={() => onNavigate('campus', 'offices')}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1 active:scale-[0.98]"
        >
          <span>All Campus Offices & Grievances</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900/80 p-4 rounded-2xl border border-rose-500/30">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Ragging Helpline</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">1800-180-5522</p>
          <p className="text-[11px] text-slate-400 mt-1">24x7 UGC / AICTE Toll-Free</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold mb-1">
            <Building className="w-4 h-4" />
            <span>Principal & Admin</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">+91 (079) 2630-0490</p>
          <p className="text-[11px] text-slate-400 mt-1">principal@gpahmedabad.ac.in</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold mb-1">
            <Phone className="w-4 h-4" />
            <span>Student & Exam Section</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">+91 (079) 2630-5516</p>
          <p className="text-[11px] text-slate-400 mt-1">GTU hall tickets & marks verification</p>
        </div>

        <div className="bg-navy-900/80 p-4 rounded-2xl border border-navy-800">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
            <Mail className="w-4 h-4" />
            <span>Training & Placement (TPO)</span>
          </div>
          <p className="text-base font-extrabold text-white font-mono">+91 (079) 2630-0490</p>
          <p className="text-[11px] text-slate-400 mt-1">tpo@gpahmedabad.ac.in</p>
        </div>
      </div>
    </div>
  );
};
