import React, { useState } from 'react';
import { INITIAL_PLACEMENT_DRIVES } from '../../lib/mockData';
import { PlacementDrive } from '../../types';
import { Briefcase, TrendingUp, Award, Calendar, CheckCircle2, ArrowRight, Building, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNotifications } from '../../context/NotificationContext';

export const PlacementCell: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>(INITIAL_PLACEMENT_DRIVES);
  const [appliedDriveIds, setAppliedDriveIds] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  const handleApply = (drive: PlacementDrive) => {
    if (appliedDriveIds.includes(drive.id)) return;

    setAppliedDriveIds([...appliedDriveIds, drive.id]);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    addNotification(
      'Placement Application Submitted',
      `Application registered for ${drive.companyName} (${drive.role}). Online assessment slot details will follow.`,
      'academic'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Statistics */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102a43] rounded-3xl p-6 sm:p-8 text-white border border-navy-700 shadow-xl">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Corporate Relations & Career Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Training & Placement Cell
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Empowering students with industry internships, pre-placement talks, mock technical interviews, and on-campus recruitment drives.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-navy-800">
          <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Highest Package</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">₹44.0 LPA</p>
            <span className="text-[10px] text-slate-400">Google India</span>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Average CTC</span>
            <p className="text-2xl font-extrabold text-brand-cyan mt-0.5">₹9.2 LPA</p>
            <span className="text-[10px] text-brand-cyan font-semibold">+18% vs 2025</span>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Placement Rate</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">96.4%</p>
            <span className="text-[10px] text-slate-400">2026 Graduating Batch</span>
          </div>

          <div className="bg-navy-950/70 p-4 rounded-2xl border border-navy-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Hiring Partners</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">180+</p>
            <span className="text-[10px] text-slate-400">Fortune 500 Recruiters</span>
          </div>
        </div>
      </div>

      {/* Active On-Campus Drives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Active Recruitment Drives & Internships
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apply directly with your verified institutional student profile
            </p>
          </div>
          <span className="text-xs text-brand-cyan font-bold bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
            {drives.length} Active Drives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drives.map((d) => {
            const hasApplied = appliedDriveIds.includes(d.id);

            return (
              <div
                key={d.id}
                className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{d.companyName}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      d.status === 'Open'
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {d.role}
                  </h4>

                  <p className="text-sm font-extrabold text-brand-cyan mt-1">
                    {d.packageLPA}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {d.description}
                  </p>

                  {/* Eligibility criteria */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Eligible Branches:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{d.eligibleBranches.join(', ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum CGPA Required:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{d.minCGPA} / 10.0 (No Backlogs)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Application Deadline:</span>
                      <span className="font-bold text-rose-500">{d.lastDateToApply}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                  <button
                    onClick={() => handleApply(d)}
                    disabled={hasApplied}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      hasApplied
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-md'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Application Registered</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-navy-950" />
                        <span>Register Candidacy for Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
