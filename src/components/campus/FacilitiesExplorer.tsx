import React, { useState } from 'react';
import { INITIAL_FACILITIES } from '../../lib/mockData';
import { CampusFacility } from '../../types';
import { Building2, MapPin, Clock, User, CheckCircle2, Search, Sparkles } from 'lucide-react';

export const FacilitiesExplorer: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);

  const categories = ['All', 'Academic', 'Sports', 'Recreation', 'Health', 'Canteen'];

  const filtered = INITIAL_FACILITIES.filter(f => {
    if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            World-Class Infrastructure
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Campus Facilities, Labs & Amenities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Laboratories, sports complexes, libraries, health center, and recreational hubs
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto momentum-scroll scrollbar-none text-xs pb-1 max-w-full">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap min-h-[38px] ${
                categoryFilter === c
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 sm:gap-6">
        {filtered.map((fac) => (
          <div
            key={fac.id}
            onClick={() => setSelectedFacility(fac)}
            className="group bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm hover:border-brand-cyan/60 hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-48 overflow-hidden bg-navy-950">
                <img
                  src={fac.image}
                  alt={fac.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-cyan text-navy-950 shadow-sm">
                  {fac.category}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {fac.block}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors leading-snug">
                  {fac.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {fac.description}
                </p>

                {/* Features Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.features.slice(0, 3).map((feat) => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span className="truncate">{fac.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{fac.timings}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2">
              <button className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-cyan hover:text-navy-950 dark:bg-navy-800 dark:hover:bg-brand-cyan dark:text-white dark:hover:text-navy-950 text-slate-800 text-xs font-bold transition-all">
                View Specs & Timings
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Details Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div 
            className="w-full max-w-xl bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden max-h-[90vh] overflow-y-auto momentum-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-60 overflow-hidden">
              <img
                src={selectedFacility.image}
                alt={selectedFacility.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedFacility(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-cyan text-navy-950">
                  {selectedFacility.category}
                </span>
                <h3 className="text-xl font-extrabold mt-1">{selectedFacility.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {selectedFacility.description}
              </p>

              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-400">Key Equipment & Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedFacility.features.map(f => (
                    <div key={f} className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200/60 dark:border-navy-700 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-800 space-y-1">
                <p><strong>Location:</strong> {selectedFacility.location} ({selectedFacility.block})</p>
                <p><strong>Opening Hours:</strong> {selectedFacility.timings}</p>
                <p><strong>Facility In-Charge:</strong> {selectedFacility.inCharge}</p>
              </div>

              <button
                onClick={() => setSelectedFacility(null)}
                className="w-full py-2.5 rounded-xl bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 font-bold"
              >
                Close Facility Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
