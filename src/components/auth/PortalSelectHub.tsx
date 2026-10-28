import React from 'react';
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  Bell, 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  Award,
  Clock,
  Lock,
  Layers,
  FileText,
  LogIn,
  Search,
  ExternalLink,
  ChevronRight,
  School,
  Check
} from 'lucide-react';
import { CampusOneLogo } from '../common/CampusOneLogo';
import { ScrollReveal, ScrollStagger } from '../common/ScrollReveal';

interface PortalSelectHubProps {
  onSelectPortal: (portal: 'student' | 'faculty' | 'admin', mode?: 'signin' | 'register') => void;
  onNavigatePublic?: (page: string, subTab?: string) => void;
}

const GPA_DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Automobile Engineering',
  'Electronics & Communication',
  'Instrumentation & Control',
  'Biomedical Engineering'
];

export const PortalSelectHub: React.FC<PortalSelectHubProps> = ({
  onSelectPortal,
  onNavigatePublic = () => {}
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200 dark:from-navy-950 dark:via-navy-900 dark:to-[#0a1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      
      {/* 1. Institutional Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <CampusOneLogo
            variant="full"
            size="md"
            withBadge
            responsive
            subtext="FOR GOVERNMENT POLYTECHNIC AHMEDABAD"
          />

          <nav className="flex items-center space-x-2 sm:space-x-4 text-xs font-semibold" aria-label="Main Navigation">
            <button 
              onClick={() => onNavigatePublic('notices')} 
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notices</span>
            </button>

            <button 
              onClick={() => onNavigatePublic('events')} 
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events &amp; Calendar</span>
            </button>

            <button 
              onClick={() => onNavigatePublic('campus', 'departments')} 
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments</span>
            </button>

            {/* Prominent Login Button for Existing Users */}
            <button
              onClick={() => onSelectPortal('student', 'signin')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-brand-cyan dark:hover:bg-cyan-400 text-white dark:text-navy-950 font-bold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
              title="Sign in to your CampusOne account"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Main Hub Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-5" aria-labelledby="hero-heading">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-cyan/15 dark:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Government Polytechnic Ahmedabad • Digital Campus Portal</span>
          </div>

          <h1 
            id="hero-heading"
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy-900 dark:text-white tracking-tight leading-tight"
          >
            CampusOne for GPA
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            The unified academic management and student intelligence portal for <strong>Government Polytechnic Ahmedabad</strong>. Access official circulars, examination results, classroom attendance ledgers, syllabus notes, and departmental services.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectPortal('student', 'signin')}
              className="px-5 py-2.5 rounded-xl bg-navy-900 dark:bg-brand-cyan hover:bg-navy-800 dark:hover:bg-cyan-400 text-white dark:text-navy-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enter Student Portal</span>
            </button>

            <button
              onClick={() => onSelectPortal('faculty', 'signin')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Faculty Suite</span>
            </button>

            <button
              onClick={() => onNavigatePublic('notices')}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-brand-cyan" />
              <span>View College Notices</span>
            </button>
          </div>
        </section>

        {/* 3 Dedicated Portal Cards */}
        <section aria-label="CampusOne Dedicated Portals">
          <ScrollStagger staggerMs={60} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 1. Student Portal Card */}
            <div className="bg-white dark:bg-navy-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-navy-700/80 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:border-brand-cyan/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-cyan/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 dark:bg-brand-cyan/20 text-cyan-600 dark:text-brand-cyan border border-cyan-500/30 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-brand-cyan border border-cyan-500/20">
                    Student Access
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-brand-cyan transition-colors">
                    Student Academic Portal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Dedicated self-service suite for enrolled Government Polytechnic Ahmedabad students. Track attendance, download notes, check marks, and view class timetables.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Subject Attendance &amp; 75% GTU Criteria Tracker</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Semester SGPA/CGPA &amp; Internal Assessment Marks</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Weekly Class Timetable &amp; Exam Hall Ticket</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Curriculum Notes, Syllabus &amp; PYQ Question Papers</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 space-y-2.5 relative z-10">
                <button
                  onClick={() => onSelectPortal('student', 'signin')}
                  className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-brand-cyan dark:hover:bg-cyan-400 text-white dark:text-navy-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onSelectPortal('student', 'register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>New Student Registration</span>
                </button>
              </div>
            </div>

            {/* 2. Faculty Portal Card */}
            <div className="bg-white dark:bg-navy-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-navy-700/80 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:border-emerald-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Instructional Suite
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Faculty Teaching Suite
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Authorized instructional workspace for GPA professors and lecturers. Log lecture attendance, grade continuous evaluations, and publish study materials.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Assigned Class Rosters &amp; Department Directory</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Daily Attendance Entry &amp; Lecture Topic Logging</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Internal Assessment (CAT) &amp; Lab Grading</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Publish Notices &amp; Upload PDF Study Materials</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start space-x-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Faculty accounts require departmental admin verification before access is granted.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 space-y-2.5 relative z-10">
                <button
                  onClick={() => onSelectPortal('faculty', 'signin')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
                >
                  <span>Enter Faculty Suite</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onSelectPortal('faculty', 'register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Request Faculty Access</span>
                </button>
              </div>
            </div>

            {/* 3. Admin Control Center Card */}
            <div className="bg-white dark:bg-navy-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-navy-700/80 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:border-amber-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Governance
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    Admin Control Center
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Standalone administrative interface for authorized institutional administrators. Approve faculty requests, govern user roles, and monitor security logs.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Review &amp; Approve Pending Faculty Accounts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>User &amp; Role Management with Demotion Guards</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Official Institutional Notices &amp; Event Management</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>System Health &amp; Immutable Audit Logs</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start space-x-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Restricted to verified administrators provisioned in the institutional database.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 space-y-2.5 relative z-10">
                <button
                  onClick={() => onSelectPortal('admin', 'signin')}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
                >
                  <span>Institutional Admin Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="py-2.5 px-4 text-center text-[11px] text-slate-400">
                  <span>Verified PostgreSQL Role Required</span>
                </div>
              </div>
            </div>

          </ScrollStagger>
        </section>

        {/* 4. Deep Informational Section: Purpose & Core Services */}
        <ScrollReveal direction="up" delay={40}>
          <section className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-8" aria-labelledby="features-heading">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
              Autonomous College Architecture
            </span>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
              Why CampusOne for Government Polytechnic Ahmedabad?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Designed specifically for the academic workflows of Government Polytechnic Ahmedabad, CampusOne replaces fragmented manual systems with unified digital operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                Official College Notices
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Stay updated with official circulars, GTU examination announcements, academic calendars, and fee payment deadlines.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                Study Materials &amp; PYQs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download verified semester notes, laboratory experiment manuals, syllabus references, and previous year question papers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                Verified Attendance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Continuous classroom attendance tracking with transparent GTU 75% eligibility compliance indicators.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                Evaluation &amp; Grades
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct recording of Continuous Assessment Tests (CAT), lab assignments, and semester SGPA/CGPA evaluation.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 5. Academic Departments at GPA */}
      <ScrollReveal direction="up" delay={50}>
        <section className="space-y-4" aria-labelledby="departments-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 id="departments-heading" className="text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                Academic Departments at Government Polytechnic Ahmedabad
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore diploma engineering disciplines offered at GPA Ahmedabad
              </p>
            </div>
            <button
              onClick={() => onNavigatePublic('campus', 'departments')}
              className="text-xs font-bold text-brand-cyan hover:underline inline-flex items-center space-x-1"
            >
              <span>Explore Faculty &amp; Labs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {GPA_DEPARTMENTS.map((dept) => (
              <div 
                key={dept}
                onClick={() => onNavigatePublic('campus', 'departments')}
                className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 hover:border-brand-cyan/50 cursor-pointer transition-all flex items-center space-x-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:text-brand-cyan group-hover:scale-105 transition-all">
                  <School className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-cyan transition-colors">
                  {dept}
                </span>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Public Campus Resources Grid */}
      <ScrollReveal direction="up" delay={50}>
        <section className="pt-6 border-t border-slate-200/80 dark:border-navy-800 space-y-4" aria-labelledby="public-resources-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="public-resources-heading" className="text-lg font-bold text-navy-900 dark:text-white">
                Public Campus Bulletins
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore open college bulletins and directories without requiring authentication
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigatePublic('notices')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group cursor-pointer"
            >
              <Bell className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">College Notices</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Official circulars &amp; exams</p>
            </button>

            <button
              onClick={() => onNavigatePublic('events')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Events &amp; Workshops</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Tech fests &amp; hackathons</p>
            </button>

            <button
              onClick={() => onNavigatePublic('campus', 'departments')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Departments</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Academic faculties &amp; labs</p>
            </button>

            <button
              onClick={() => onNavigatePublic('contact')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Student Helpdesk</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Admissions &amp; helplines</p>
            </button>
          </div>
        </section>
      </ScrollReveal>

        {/* 7. Institutional Transparency & Disclaimer */}
        <section className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Institutional Information &amp; Data Notice:
          </p>
          <p className="leading-relaxed">
            CampusOne is the dedicated digital campus management platform built for Government Polytechnic Ahmedabad (GPA) academic operations. Enrolled students and faculty access their verified records through authenticated accounts. Institutional notices and academic circulars are published in accordance with departmental guidelines.
          </p>
        </section>

      </main>

      {/* 8. Institutional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-navy-800 bg-white/70 dark:bg-navy-900/70 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} CampusOne Digital Portal • Government Polytechnic Ahmedabad.
          </p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <button onClick={() => onNavigatePublic('about')} className="hover:underline">About GPA</button>
            <span>•</span>
            <button onClick={() => onNavigatePublic('contact')} className="hover:underline">Helpdesk</button>
            <span>•</span>
            <button onClick={() => onNavigatePublic('notices')} className="hover:underline">Circulars</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
