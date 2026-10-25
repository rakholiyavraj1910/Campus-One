import React, { useState } from 'react';
import { CAMPUS_OFFICES, FREQUENT_FAQS } from '../../lib/mockData';
import { 
  Building, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const OfficeAndFAQs: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { addNotification } = useNotifications();

  const filteredFaqs = FREQUENT_FAQS.filter(faq => {
    if (!faqSearch.trim()) return true;
    const q = faqSearch.toLowerCase();
    return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
  });

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackSent(true);
    addNotification('Feedback Recorded', 'Your grievance / suggestion was received by the Dean of Student Welfare.', 'alert');
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Administrative Offices Directory */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Administrative Directory
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            College Administrative Offices & Student Services
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official points of contact for certificates, fee receipts, scholarships, and exam inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAMPUS_OFFICES.map((off) => (
            <div
              key={off.title}
              className="bg-white dark:bg-navy-900 rounded-3xl p-5 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-800 text-brand-cyan flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {off.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  In-Charge: {off.head}
                </p>

                <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{off.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-xs">{off.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{off.hours}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 text-[11px] text-slate-400">
                Location: <strong className="text-slate-700 dark:text-slate-300">{off.location}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Frequently Asked Questions (FAQs) */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Campus Knowledge Base</span>
            </div>
            <h3 className="text-xl font-extrabold text-navy-900 dark:text-white mt-1">
              Frequently Asked Questions (FAQs)
            </h3>
          </div>

          <div className="relative min-w-[260px]">
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

        {/* Accordion */}
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

      {/* 3. Feedback & Grievance Box */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-brand-cyan text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Student Feedback & Grievance Cell</span>
        </div>
        <h3 className="text-xl font-extrabold text-white">
          Have feedback, suggestions, or grievances?
        </h3>
        <p className="text-xs text-slate-300 max-w-xl">
          All student submissions are strictly confidential and reviewed directly by the Dean of Student Welfare.
        </p>

        <form onSubmit={handleSendFeedback} className="space-y-3 max-w-xl">
          <textarea
            rows={3}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Type your constructive suggestions or campus queries here..."
            className="w-full p-3 rounded-2xl bg-navy-950/80 border border-navy-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs transition-all shadow-md flex items-center space-x-2"
          >
            {feedbackSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>Message Dispatched</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-navy-950" />
                <span>Submit Grievance / Feedback</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
