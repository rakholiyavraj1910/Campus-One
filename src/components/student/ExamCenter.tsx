import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

export const ExamCenter: React.FC = () => {
  const { user } = useAuth();
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);

  const examSchedules = [
    { date: 'Nov 10, 2026', time: '10:00 AM - 01:00 PM', code: 'CS601', name: 'Distributed Systems', room: 'Block B - Exam Hall 201', seat: 'Row C - 14' },
    { date: 'Nov 12, 2026', time: '10:00 AM - 01:00 PM', code: 'CS602', name: 'Cloud Computing & DevOps', room: 'Block B - Exam Hall 201', seat: 'Row C - 14' },
    { date: 'Nov 16, 2026', time: '10:00 AM - 01:00 PM', code: 'CS603', name: 'Compiler Design', room: 'Block B - Exam Hall 204', seat: 'Row A - 08' },
    { date: 'Nov 18, 2026', time: '10:00 AM - 01:00 PM', code: 'CS604', name: 'Network Security', room: 'Block B - Exam Hall 204', seat: 'Row A - 08' },
    { date: 'Nov 20, 2026', time: '10:00 AM - 01:00 PM', code: 'CS605', name: 'Software Engineering Principles', room: 'Block B - Exam Hall 201', seat: 'Row C - 14' }
  ];

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHallTicketModal) {
        setShowHallTicketModal(false);
      }
    };
    if (showHallTicketModal) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHallTicketModal]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <ScrollReveal direction="down" distance={16}>
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Office of Controller of Examinations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Semester Examination Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Even Semester 2026 Examination Schedule &amp; Digital Hall Ticket
            </p>
          </div>

          <button
            onClick={() => setShowHallTicketModal(true)}
            className="px-5 py-3 rounded-2xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-extrabold text-xs shadow-lg shadow-brand-cyan/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer btn-tactile"
          >
            <Award className="w-4 h-4" />
            <span>View / Print Hall Ticket</span>
          </button>
        </div>
      </ScrollReveal>

      {/* Exam Timetable List */}
      <ScrollReveal delayMs={30}>
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Mid-Semester Theory Examination Timetable
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exam timings: 10:00 AM sharp. Students must report 20 minutes prior.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              Seat Allotted
            </span>
          </div>

          <div className="overflow-x-auto momentum-scroll">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3">Subject Code &amp; Title</th>
                  <th className="py-3 px-3">Examination Venue</th>
                  <th className="py-3 px-3">Seat Number</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 font-medium text-slate-700 dark:text-slate-300">
                {examSchedules.map((ex) => (
                  <tr key={ex.code} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{ex.date}</p>
                      <p className="text-[11px] text-slate-400">{ex.time}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-brand-cyan">{ex.code}</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {ex.room}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-cyan">
                      {ex.seat}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Guidelines Card */}
      <ScrollReveal delayMs={50}>
        <div className="bg-slate-50 dark:bg-navy-900/60 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Mandatory Examination Instructions for Candidates</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Physical printed Hall Ticket and institutional Smart RFID ID Card must be placed on candidate desk at all times.</li>
            <li>Electronic devices including smartwatches, programmable calculators, and Bluetooth wearables are strictly prohibited.</li>
            <li>Entry into the examination hall closes precisely 15 minutes after the exam commences.</li>
            <li>In case of medical emergencies or clash in timetable, report to Controller of Examinations Suite 102 immediately.</li>
          </ul>
        </div>
      </ScrollReveal>

      {/* Hall Ticket Preview Modal */}
      {showHallTicketModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHallTicketModal(false);
          }}
        >
          <div 
            className="w-full max-w-2xl bg-white text-navy-950 rounded-3xl shadow-2xl p-5 sm:p-8 space-y-6 border border-slate-300 relative print:m-0 print:p-0 print:border-none max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close / Print bar */}
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <span className="text-xs font-bold text-slate-500">Official Admit Card Preview</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer btn-tactile"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowHallTicketModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-navy-950 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* University Hall Ticket Layout */}
            <div className="text-center space-y-1 border-b pb-4">
              <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                Government Polytechnic Ahmedabad
              </p>
              <h2 className="text-xl font-extrabold text-navy-900 tracking-tight">
                END-SEMESTER / MID-TERM EXAMINATION ADMIT CARD
              </h2>
              <p className="text-xs text-slate-600">Academic Year: 2025 - 2026 • Even Semester</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 py-2 border-b pb-4">
              <div className="space-y-1.5 text-xs">
                <p><strong>Candidate Name:</strong> {user.name}</p>
                <p><strong>Roll Number:</strong> {user.rollNumber || '21CS104'}</p>
                <p><strong>PRN:</strong> {user.prn || '2021016400987654'}</p>
                <p><strong>Branch / Degree:</strong> B.Tech Computer Science & Engineering</p>
                <p><strong>Semester & Division:</strong> Semester 6 • Division A</p>
                <p><strong>Examination Center:</strong> Main Campus Examination Block B</p>
              </div>

              <div className="flex flex-col items-center space-y-2 shrink-0">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt="Student"
                  className="w-24 h-28 object-cover border border-navy-900 rounded"
                />
                <QrCode className="w-16 h-16" />
              </div>
            </div>

            {/* Subjects on ticket */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Registered Examination Papers:</p>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Code</th>
                    <th className="p-2">Subject Title</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {examSchedules.map((ex) => (
                    <tr key={ex.code}>
                      <td className="p-2 font-mono font-bold">{ex.code}</td>
                      <td className="p-2">{ex.name}</td>
                      <td className="p-2">{ex.date}</td>
                      <td className="p-2 text-slate-300 font-serif">Verified</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-end pt-4 border-t text-xs">
              <div>
                <p className="text-[10px] text-slate-500">Security Hash: SHA256:7e8a9...b4c2</p>
                <p className="text-[10px] text-emerald-600 font-bold">Attendance Eligibility: 84.6% (Verified)</p>
              </div>
              <div className="text-center">
                <p className="font-serif italic text-base text-navy-900">Prof. H. R. Joshi</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Controller of Examinations</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
