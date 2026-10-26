import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Building2, 
  BookOpen, 
  Cpu, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { CampusOneIcon } from '../common/CampusOneLogo';

interface AboutPageProps {
  onNavigate: (page: string, subTab?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] text-white p-8 sm:p-12 border border-navy-700 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center space-x-3 mb-1">
            <CampusOneIcon size={44} withBadge className="shadow-lg" />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Empowering Higher Education Digitalization
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Entire Campus. <br />
            <span className="text-brand-cyan">One Centralized Platform.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            CampusOne is an institutional enterprise platform engineered to unify fragmented college websites, WhatsApp circular groups, paper noticeboards, and spreadsheet trackers into a single, cohesive, role-based ecosystem.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('campus', 'departments')}
              className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              Explore Departments
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
            >
              Contact Administration
            </button>
          </div>
        </div>
      </div>

      {/* 2. Platform Core Goals & Digitalization Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Unified Information Hub</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Eliminates lost notifications and conflicting deadlines. Class timetables, urgent circulars, exam schedules, and library catalogs are synchronized across all devices in real-time.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Zero Trust Authorization</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Strict role-based access control (RBAC) powered by database-level Row Level Security policies. Private marks, attendance compliance, and mentor advisories are visible solely to authorized eyes.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Actionable Student Intelligence</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Smart attendance calculators project eligibility thresholds, target grade simulators forecast required exam scores, and countdown timers prevent missed assignment submissions.
          </p>
        </div>
      </div>

      {/* 3. About the Institution (Government Polytechnic Ahmedabad) */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">Institutional Heritage</span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Government Polytechnic Ahmedabad
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Premier Polytechnic &amp; Technical Institution • Directorate of Technical Education, Gujarat</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span>NBA Accredited Programs</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <p>
              Founded with the vision to cultivate skilled engineers, innovative technicians, and industrial leaders, Government Polytechnic Ahmedabad spans a vibrant campus with state-of-the-art laboratories, technical workshops, and modern computing facilities.
            </p>
            <p>
              As one of the foremost polytechnic institutions in Gujarat, GP Ahmedabad fosters direct industry partnerships, student innovation, and technical skill development across all engineering disciplines.
            </p>
          </div>

          <div className="space-y-2 bg-slate-50 dark:bg-navy-950/60 p-5 rounded-2xl border border-slate-200/60 dark:border-navy-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">Campus Highlights at a Glance</h4>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" /><span>Over 2,400 undergraduate, postgraduate, and doctoral scholars</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" /><span>120+ Distinguished faculty members with Ph.D. degrees from premier institutions</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" /><span>NVIDIA DGX Supercomputing Cluster with 512-core high-bandwidth backhaul</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0" /><span>96.4% placement record with Highest CTC reaching ₹44.0 LPA</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Leadership & Administration */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Platform Governance & Academic Leadership</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700">
            <p className="text-xs text-slate-400 font-semibold uppercase">Dean of Academic Affairs</p>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Prof. K. Verma</h4>
            <p className="text-[11px] text-brand-cyan font-mono mt-0.5">dean.academic@campusone.edu</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700">
            <p className="text-xs text-slate-400 font-semibold uppercase">Dean of Research & Labs</p>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Dr. Meenakshi Sundaram</h4>
            <p className="text-[11px] text-brand-cyan font-mono mt-0.5">meenakshi.s@campusone.edu</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700">
            <p className="text-xs text-slate-400 font-semibold uppercase">Head of AI Lab & CSE</p>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Dr. Radhika Sen</h4>
            <p className="text-[11px] text-brand-cyan font-mono mt-0.5">radhika.sen@campusone.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
};
