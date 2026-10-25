import React, { useState } from 'react';
import { INITIAL_CLUBS } from '../../lib/mockData';
import { StudentClub } from '../../types';
import { Users, Calendar, Mail, Sparkles, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNotifications } from '../../context/NotificationContext';

export const StudentClubs: React.FC = () => {
  const [clubs, setClubs] = useState<StudentClub[]>(INITIAL_CLUBS);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  const handleJoinClub = (club: StudentClub) => {
    if (joinedClubIds.includes(club.id)) return;

    setJoinedClubIds([...joinedClubIds, club.id]);
    setClubs(prev => prev.map(c => c.id === club.id ? { ...c, membersCount: c.membersCount + 1 } : c));

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    addNotification(
      'Club Membership Registered',
      `Welcome to ${club.name}! You will receive meeting invites at your college email.`,
      'event'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Student Life & Leadership
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Student Clubs, Technical Chapters & Societies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hackathons, autonomous robotics, dramatic arts, venture entrepreneurship, and music
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Student Chapters</span>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map((club) => {
          const isJoined = joinedClubIds.includes(club.id);

          return (
            <div
              key={club.id}
              className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-cyan/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                      {club.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 leading-snug">
                      {club.name}
                    </h3>
                    <p className="text-xs text-brand-cyan font-semibold mt-0.5">
                      {club.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {club.description}
                </p>

                <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Lead / President:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{club.leadName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekly Meet:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{club.weeklyMeeting}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Community:</span>
                    <span className="font-bold text-brand-cyan">{club.membersCount} student members</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <a
                  href={`mailto:${club.email}`}
                  className="text-xs text-slate-500 hover:text-brand-cyan font-semibold flex items-center space-x-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Lead</span>
                </a>

                <button
                  onClick={() => handleJoinClub(club)}
                  disabled={isJoined}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isJoined
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-sm'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Member Enrolled</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-navy-950" />
                      <span>Join Society</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
