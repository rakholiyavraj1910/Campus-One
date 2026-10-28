import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Receipt, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Info, 
  Lock, 
  FileText, 
  HelpCircle, 
  X,
  CreditCard,
  Sparkles,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { StudentFeeRecord } from '../../types';
import { getStudentFeeRecords } from '../../lib/storageService';
import { ScrollReveal, ScrollStagger } from '../common/ScrollReveal';

const GTU_PORTAL_URL = 'https://student.gtu.ac.in/Login.aspx';

export const FeesManagement: React.FC = () => {
  const { user } = useAuth();
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGpaModalOpen, setIsGpaModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getStudentFeeRecords(user.id)
      .then((records) => {
        if (isMounted) {
          setFeeRecords(records);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFeeRecords([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGpaModalOpen) {
        setIsGpaModalOpen(false);
      }
    };
    if (isGpaModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGpaModalOpen]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner / Identity Header */}
      <ScrollReveal direction="down" distance={16}>
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] rounded-3xl p-6 sm:p-8 text-white border border-navy-700/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center space-x-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Fees &amp; Financial Governance Desk</span>
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Government Polytechnic Ahmedabad &bull; GTU Affiliated
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Student Fees &amp; Official Payment Portals
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
                  Access official Gujarat Technological University (GTU) examination payment services and Government Polytechnic Ahmedabad (GPA) institutional fee guidelines without intermediary credential collection.
                </p>
              </div>

              {/* Quick Student Identity Pill */}
              <div className="bg-navy-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-navy-700 text-xs shrink-0 space-y-1 shadow-inner min-w-[200px]">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Student</span>
                  <span className="font-mono text-teal-300 font-bold">{user.rollNumber || 'Enrolled'}</span>
                </div>
                <p className="font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.department || 'Computer Engineering'} &bull; Sem {user.semester || 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* THE TWO SEPARATE ATTRACTIVE PAYMENT CARDS */}
      <ScrollStagger staggerMs={35} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* OPTION A: GTU FEES CARD */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />

          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Option A &bull; University Portal
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    Gujarat Technological University (GTU) Fees
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live GTU Gateway</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Gujarat Technological University handles state examination fees, enrollment confirmation, grade card issuance, and re-checking / re-assessment fees. Students can directly access the official GTU student login portal.
            </p>

            {/* Applicable Fee Types Covered */}
            <div className="space-y-2 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Applicable University Fee Categories
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Regular &amp; Remedial Semester Exam Fees</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>University Enrollment &amp; Verification Fees</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Paper Re-checking &amp; Re-assessment Dues</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Hall Ticket Release &amp; E-Receipt Generation</span>
                </li>
              </ul>
            </div>

            {/* Destination Verification Pill & Security Notice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-navy-700">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-teal-500" />
                  <span className="font-semibold">Destination:</span>
                </span>
                <code className="font-mono text-teal-600 dark:text-teal-400 font-bold truncate max-w-[200px] sm:max-w-none">
                  student.gtu.ac.in/Login.aspx
                </code>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal flex items-start space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                <span>
                  CampusOne does not collect or store your GTU username or password. This link opens the official GTU portal directly in a secure new tab.
                </span>
              </p>
            </div>
          </div>

          {/* Action Button: Pay GTU Fees */}
          <div className="pt-2">
            <a
              href={GTU_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600 text-navy-950 font-extrabold text-xs shadow-md shadow-teal-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 group-hover:scale-[1.01]"
            >
              <span>Pay GTU Fees</span>
              <ExternalLink className="w-4 h-4 text-navy-950" />
            </a>
          </div>
        </div>

        {/* OPTION B: GPA FEES CARD */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

          <div className="space-y-4">
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Option B &bull; College Administration
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    Government Polytechnic Ahmedabad (GPA) Fees
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Notice</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Institutional term fees, laboratory maintenance, student welfare contributions, and campus amenity charges are governed directly by the Directorate of Technical Education (DTE), Government of Gujarat.
            </p>

            {/* Highlights / Fee Categories */}
            <div className="space-y-2 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Institutional Fee Structure (Government Subsidized)
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Tuition &amp; Term Fees (Subsidized State Norms)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>100% Tuition Fee Exemption for Girls (Kanya Kelavani)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Laboratory, Workshop &amp; Library Maintenance Funds</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Direct Treasury &amp; Physical Cash Counter Receipts</span>
                </li>
              </ul>
            </div>

            {/* Status Notice Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  GPA fee payment details will be available soon.
                </p>
                <p className="opacity-90 mt-0.5 leading-relaxed text-[11px]">
                  Online digital payment integration for Government Polytechnic Ahmedabad is currently being coordinated with state treasury guidelines. For all term fee dues, please visit the Administrative Cash Window.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button: Pay GPA Fees */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsGpaModalOpen(true)}
              className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-navy-800 dark:hover:bg-navy-700 text-white font-extrabold text-xs shadow-md border border-slate-700 transition-all flex items-center justify-center space-x-2 group-hover:scale-[1.01] cursor-pointer btn-tactile"
            >
              <span>Pay GPA Fees</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>
      </ScrollStagger>

      {/* FEE INFORMATION & LEDGER HISTORY AREA */}
      <ScrollReveal delayMs={40}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Ledger Records & Electronic Receipts (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Fee Payment Ledger &amp; Receipts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified financial records reconciled with institutional accounts
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {feeRecords.length} Record{feeRecords.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Records Display or Genuine Institutional Empty State */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Querying institutional accounts cache...
            </div>
          ) : feeRecords.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {feeRecords.map((record) => (
                <div key={record.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{record.feeType}</p>
                    <p className="text-slate-400 text-[11px]">Due: {record.dueDate} &bull; Authority: {record.authority}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-900 dark:text-white">₹{record.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      record.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Genuine Institutional Empty State — No Fabricated Fake Amounts */
            <div className="p-8 rounded-2xl bg-slate-50/60 dark:bg-navy-950/40 border border-slate-200/80 dark:border-navy-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  No Outstanding Fee Dues Found in Database
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Official fee records are reconciled with the Government Polytechnic Ahmedabad Accounts Department. Payments made via GTU or at the campus cash counter will reflect here once audited and posted by the registrar.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <a
                  href={GTU_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold transition-colors inline-flex items-center space-x-1"
                >
                  <span>Verify GTU Exam Fee Status</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsGpaModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  View Cash Counter Hours
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Institutional Guidelines & Advisory (1 Col) */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-teal-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Fee Compliance Guidelines
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/30">
              <p className="font-bold text-teal-900 dark:text-teal-300">
                Kanya Kelavani Scheme (Girls Exemption)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Female diploma engineering students are exempt from tuition fees under Gujarat Government directives.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
              <p className="font-bold text-blue-900 dark:text-blue-300">
                Official Cash Counter Location
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Admin Building, Ground Floor, Room 102. Timings: Monday to Friday, 10:30 AM to 04:00 PM.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
              <p className="font-bold text-rose-900 dark:text-rose-300">
                Anti-Fraud Advisory
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Government Polytechnic Ahmedabad never requests payments via personal UPI IDs, QR codes, or third-party phone callers.
              </p>
            </div>
          </div>
        </div>

        </div>
      </ScrollReveal>

      {/* GPA FEES OFFICIAL GUIDANCE MODAL */}
      {isGpaModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGpaModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-navy-800 shadow-2xl relative animate-scale-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Government Polytechnic Ahmedabad
                  </h3>
                  <p className="text-xs text-slate-400">
                    Institutional Fee Guidance Notice
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGpaModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold text-sm text-amber-800 dark:text-amber-300">
                  GPA fee payment details will be available soon.
                </p>
                <p className="text-xs leading-relaxed opacity-95">
                  The online institutional fee payment integration for Government Polytechnic Ahmedabad is currently being coordinated with state treasury portals.
                </p>
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-navy-950/60 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
                <p className="font-bold text-slate-800 dark:text-white text-xs">
                  How to Pay College Term Fees Currently:
                </p>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>Visit the <strong>Administrative Cash Section</strong> (Ground Floor, Admin Block Room 102).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>Working Hours: <strong>Monday to Friday, 10:30 AM to 04:00 PM</strong> (except government holidays).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>Obtain an official stamped government treasury receipt for your records and scholarship claims.</span>
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Do not transfer funds to unauthorized third-party QR codes or personal accounts. Official digital payment updates will be announced via Campus Circulars.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGpaModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-navy-900 dark:bg-teal-500 hover:bg-navy-800 dark:hover:bg-teal-400 text-white dark:text-navy-950 font-extrabold text-xs transition-colors"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
