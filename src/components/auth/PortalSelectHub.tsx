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
  FileText
} from 'lucide-react';
import { CampusOneLogo } from '../common/CampusOneLogo';

interface PortalSelectHubProps {
  onSelectPortal: (portal: 'student' | 'faculty' | 'admin', mode?: 'signin' | 'register') => void;
  onNavigatePublic?: (page: string, subTab?: string) => void;
}

export const PortalSelectHub: React.FC<PortalSelectHubProps> = ({
  onSelectPortal,
  onNavigatePublic = () => {}
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200 dark:from-navy-950 dark:via-navy-900 dark:to-[#0a1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-brand-cyan/25 selection:text-brand-cyan">
      
      {/* Institutional Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-navy-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <CampusOneLogo
            variant="full"
            size="md"
            withBadge
            subtext="FOR GOVERNMENT POLYTECHNIC AHMEDABAD"
          />

          <div className="flex items-center space-x-3 text-xs">
            <button 
              onClick={() => onNavigatePublic('notices')} 
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 font-medium transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Public Notices</span>
            </button>
            <button 
              onClick={() => onNavigatePublic('events')} 
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events &amp; Calendar</span>
            </button>
            <button 
              onClick={() => onNavigatePublic('campus')} 
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-cyan hover:bg-slate-100 dark:hover:bg-navy-800 font-medium transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-cyan/15 dark:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous College Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight leading-tight">
            Institutional Digital Access Portals
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Select your dedicated portal below to access academic coursework, instructional management tools, or administrative operations.
          </p>
        </div>

        {/* The 3 Dedicated Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. Student Portal Card */}
          <div className="bg-white dark:bg-navy-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-navy-700/80 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:border-brand-cyan/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-cyan/20 transition-all" />

            <div className="space-y-6 relative z-10">
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
                  Dedicated self-service suite for enrolled college students. Track attendance, download notes, check marks, and view class timetables.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Subject Attendance &amp; 75% Criteria Tracker</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Semester SGPA/CGPA &amp; Internal Assessment Marks</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Weekly Timetable &amp; Exam Hall Ticket</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Course Material, Notes &amp; PYQ Question Papers</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-3 relative z-10">
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

            <div className="space-y-6 relative z-10">
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
                  Authorized instructional platform for professors and lecturers. Log lecture attendance, grade exams, and mentor enrolled students.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Assigned Class Rosters &amp; Student Lists</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>One-Click Daily Attendance Entry &amp; Topics</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Internal Assessment Marks &amp; Lab Grading</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Course Announcements &amp; Syllabus Notes Upload</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start space-x-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Faculty accounts require departmental admin verification before access is granted.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-3 relative z-10">
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

            <div className="space-y-6 relative z-10">
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
                  Institutional governance hub for college registrars and administrators. Approve faculty, publish official notices, and manage security logs.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Review &amp; Approve Pending Faculty Requests</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Student &amp; Faculty PostgreSQL Account Directory</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Official Campus Notices &amp; Event Scheduling</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Security Audit Logs &amp; Supabase RLS Registry</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-start space-x-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Restricted to verified administrators provisioned in the institutional database.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-3 relative z-10">
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

        </div>

        {/* Public Information Grid */}
        <div className="mt-14 sm:mt-20 pt-10 border-t border-slate-200/80 dark:border-navy-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white">
                Public Campus Resources
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore open college bulletins and directories without requiring authentication
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigatePublic('notices')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group"
            >
              <Bell className="w-5 h-5 text-brand-cyan mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">College Notices</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Official circulars &amp; exams</p>
            </button>

            <button
              onClick={() => onNavigatePublic('events')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group"
            >
              <Calendar className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Events &amp; Workshops</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Tech fests &amp; hackathons</p>
            </button>

            <button
              onClick={() => onNavigatePublic('campus', 'departments')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group"
            >
              <Building2 className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Departments</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Academic faculties &amp; labs</p>
            </button>

            <button
              onClick={() => onNavigatePublic('contact')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-left hover:border-brand-cyan transition-all group"
            >
              <HelpCircle className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white">Student Helpdesk</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Admissions &amp; helplines</p>
            </button>
          </div>
        </div>

      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-navy-800 bg-white/60 dark:bg-navy-900/60 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} CampusOne Digital Portal • Government Polytechnic Ahmedabad.
          </p>
          <p className="text-[11px] text-slate-400">
            Powered by React, Vite, Supabase &amp; Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
};
