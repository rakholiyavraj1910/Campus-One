import React, { useState, useEffect } from 'react';
import { INITIAL_DEPARTMENTS } from '../../lib/mockData';
import { getDepartments } from '../../lib/storageService';
import { DepartmentInfo } from '../../types';
import { Building2, Users, GraduationCap, Laptop, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { ScrollReveal, ScrollStagger } from '../common/ScrollReveal';

export const DepartmentDirectory: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentInfo[]>(INITIAL_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo>(INITIAL_DEPARTMENTS[0]);

  useEffect(() => {
    getDepartments().then((data) => {
      if (data && data.length > 0) {
        setDepartments(data);
        if (!data.some((d) => d.id === selectedDept.id)) {
          setSelectedDept(data[0]);
        }
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <ScrollReveal direction="down" distance={16}>
        <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Academic Schools &amp; Faculties
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
              College Departments &amp; Centers of Excellence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore undergraduate, postgraduate, and doctoral engineering disciplines
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {departments.length} Engineering Departments
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Department Selector Grid */}
      <ScrollStagger staggerMs={20} className="grid grid-cols-2 sm:grid-cols-4 3xl:grid-cols-8 gap-2 sm:gap-3">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept)}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer interactive-card min-h-[44px] ${
              selectedDept.id === dept.id
                ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 border-transparent shadow-md'
                : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-navy-800 hover:border-brand-cyan/50'
            }`}
          >
            <span className="text-xs font-mono font-bold opacity-75">{dept.code}</span>
            <h4 className="font-bold text-xs sm:text-sm truncate mt-1">{dept.name}</h4>
            <p className="text-[10px] sm:text-[11px] opacity-75 mt-0.5">Est. {dept.establishedYear}</p>
          </button>
        ))}
      </ScrollStagger>

      {/* Selected Department Showcase Card */}
      <ScrollReveal delayMs={30}>
        <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm">
        {/* Banner with image */}
        <div className="relative h-48 sm:h-56 bg-navy-950">
          <img
            src={selectedDept.bannerImage}
            alt={selectedDept.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 text-white">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-cyan text-navy-950">
                Department Code: {selectedDept.code}
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1">{selectedDept.name}</h3>
              <p className="text-xs text-slate-300 mt-1">Established in {selectedDept.establishedYear} • NBA &amp; NAAC A++ Accredited</p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">
              <div className="bg-black/40 px-2.5 sm:px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/20">
                <span className="text-slate-300">Students: </span>
                <strong className="text-brand-cyan font-mono">{selectedDept.totalStudents}</strong>
              </div>
              <div className="bg-black/40 px-2.5 sm:px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/20">
                <span className="text-slate-300">Faculty: </span>
                <strong className="text-brand-cyan font-mono">{selectedDept.totalFaculty}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Department Details Content */}
        <div className="p-4 sm:p-6 sm:p-8 space-y-6">
          {/* Vision & Description */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Department Overview & Vision</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDept.description}
            </p>
            <div className="p-4 rounded-2xl bg-brand-cyan/5 dark:bg-brand-cyan/10 border border-brand-cyan/20">
              <p className="text-xs text-brand-cyan font-semibold">Vision Statement:</p>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5 italic">"{selectedDept.vision}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Laboratories */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Laptop className="w-4 h-4 text-brand-cyan" />
                <span>Specialized Research Laboratories</span>
              </h4>
              <div className="space-y-2">
                {selectedDept.labs.map((lab) => (
                  <div
                    key={lab}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{lab}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs Offered & HOD Contact */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span>Degree Programs Offered</span>
                </h4>
                <div className="space-y-2">
                  {selectedDept.programsOffered.map((prog) => (
                    <div
                      key={prog}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/60 dark:border-navy-700 flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{prog}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HOD Contact Card */}
              <div className="p-4 rounded-2xl bg-navy-900 text-white dark:bg-navy-800 border border-navy-700 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Head of Department (HOD)</p>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedDept.hodName}</p>
                  <p className="text-xs text-brand-cyan font-mono mt-0.5">{selectedDept.hodEmail}</p>
                </div>
                <a
                  href={`mailto:${selectedDept.hodEmail}`}
                  className="p-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold transition-all shadow-sm"
                  title="Contact HOD"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  </div>
);
};
