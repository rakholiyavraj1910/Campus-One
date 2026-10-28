import React, { useState } from 'react';
import { CAMPUS_OFFICES, FREQUENT_FAQS } from '../../lib/mockData';
import { 
  Building, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { submitFeedback } from '../../lib/storageService';
import { useNotifications } from '../../context/NotificationContext';
import { feedbackSchema } from '../../lib/validationSchemas';

export const ContactPage: React.FC = () => {
  const { addNotification } = useNotifications();

  // Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Facilities' | 'Hostel/Canteen' | 'Exam Cell' | 'General'>('General');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // FAQ state
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredFaqs = FREQUENT_FAQS.filter(faq => {
    if (!faqSearch.trim()) return true;
    const q = faqSearch.toLowerCase();
    return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = feedbackSchema.safeParse({
      userName,
      userEmail,
      category,
      message,
    });

    if (!result.success) {
      setFormError(result.error.issues[0]?.message || 'Please check form fields.');
      return;
    }

    submitFeedback(userName, userEmail, category, message);
    setIsSuccess(true);
    addNotification('Inquiry / Grievance Registered', `Ticket dispatched to ${category} section.`, 'alert');

    setTimeout(() => {
      setUserName('');
      setUserEmail('');
      setMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-8 sm:p-10 text-white border border-navy-700 shadow-xl space-y-3">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
          Official Helpdesk & Campus Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Contact College Administration & Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Need academic guidance, fee receipts, transcript verification, or emergency assistance? Reach out to authorized campus offices or submit your inquiries directly.
        </p>
      </div>

      {/* 2. Key Administrative Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMPUS_OFFICES.map((off) => (
          <div
            key={off.title}
            className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {off.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                In-Charge: {off.head}
              </p>

              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{off.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-mono text-xs text-brand-cyan">{off.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{off.hours}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location: <strong className="text-slate-700 dark:text-slate-300">{off.location}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Feedback / Inquiry Form (Validated with Zod) */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Student & Public Helpdesk Portal</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Submit Inquiry, Grievance, or Academic Feedback
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
          Messages submitted through this portal are routed directly to the designated department administrator and tracked via audit logs.
        </p>

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <h4 className="font-bold text-sm">Thank you! Your inquiry was successfully recorded.</h4>
            <p className="text-xs text-slate-500">The administration office will respond to {userEmail} within 24 business hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Institutional / Personal Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="student@campusone.edu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="General">General Campus Inquiry</option>
                <option value="Academic">Academic Curriculum & Syllabus</option>
                <option value="Exam Cell">Exam Cell, Hall Tickets & Transcripts</option>
                <option value="Facilities">Campus Facilities & Laboratories</option>
                <option value="Hostel/Canteen">Hostel & Dining Hall Feedback</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry, request, or constructive suggestion in detail..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-navy-950" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>

      {/* 4. Frequently Asked Questions (FAQs) */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Knowledge Base & Guidelines</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Frequently Asked Questions (FAQs)
            </h3>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions or keywords..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200/80 dark:border-navy-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between bg-slate-50/50 dark:bg-navy-800/40 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900 dark:text-white pr-4">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand-cyan shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-navy-900 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-navy-800 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
