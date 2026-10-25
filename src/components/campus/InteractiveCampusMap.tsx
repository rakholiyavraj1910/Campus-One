import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Building, Coffee, Dumbbell, HeartPulse, Search, Sparkles } from 'lucide-react';

interface CampusPin {
  id: string;
  name: string;
  category: 'Academic' | 'Admin' | 'Recreation' | 'Sports' | 'Canteen' | 'Health';
  x: number; // percentage
  y: number; // percentage
  floors: string;
  description: string;
  facilitiesInside: string[];
}

export const InteractiveCampusMap: React.FC = () => {
  const [activePinId, setActivePinId] = useState<string>('block-c');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [mapSearch, setMapSearch] = useState<string>('');

  const campusPins: CampusPin[] = [
    {
      id: 'block-a',
      name: 'Block A: Academic & Central Library',
      category: 'Academic',
      x: 30,
      y: 45,
      floors: 'Ground + 4 Floors',
      description: 'Houses Central Digital Library (2nd & 3rd Fl), Computer Science Classrooms, and Academic Registrar Office.',
      facilitiesInside: ['Central Library', 'Registrar Suite 102', 'Lecture Halls 101-108', 'Server Room']
    },
    {
      id: 'block-b',
      name: 'Block B: Innovation Center & Auditorium',
      category: 'Recreation',
      x: 52,
      y: 35,
      floors: 'Ground + 3 Floors',
      description: '1,200 seat Steve Jobs Convention Auditorium, GDSC Incubation Pod, Robotics Lab, and Seminar Rooms.',
      facilitiesInside: ['Steve Jobs Auditorium', 'AI Incubation Center', 'Robotics Arena', 'Examination Hall 201-204']
    },
    {
      id: 'block-c',
      name: 'Block C: Tech Tower (AI & CSE Labs)',
      category: 'Academic',
      x: 70,
      y: 55,
      floors: 'Ground + 6 Floors',
      description: 'NVIDIA Supercomputing Cluster, Cloud DevOps Sandbox, Faculty Cabins, and Department Heads offices.',
      facilitiesInside: ['NVIDIA AI Supercluster', 'HOD Office 401', 'Faculty Cabins 301-415', 'Cloud Lab 301']
    },
    {
      id: 'sports-pav',
      name: 'Sports Complex & Olympic Arena',
      category: 'Sports',
      x: 25,
      y: 75,
      floors: 'Ground + 2 Floors',
      description: '50m heated pool, indoor basketball stadium, badminton courts, fitness gym, and athletics track.',
      facilitiesInside: ['Olympic Swimming Pool', 'Maple Basketball Court', 'CrossFit Gym', 'Locker Rooms']
    },
    {
      id: 'food-hub',
      name: 'The Hub: Food Court & Student Plaza',
      category: 'Canteen',
      x: 55,
      y: 65,
      floors: 'Ground + 1 Floor',
      description: 'Central cafeteria offering multi-cuisine dining, artisan espresso bar, juice counter, and open lawn.',
      facilitiesInside: ['Subsidized Student Mess', 'Espresso Lounge', 'Live Sandwich Bar', 'Garden Amphitheatre']
    },
    {
      id: 'health-wing',
      name: 'Block H: Medical & Residential Wing',
      category: 'Health',
      x: 80,
      y: 25,
      floors: 'Ground + 5 Floors',
      description: '24/7 Medical emergency clinic with standby ambulance, resident doctors, dispensary, and hostels.',
      facilitiesInside: ['24x7 Ambulance Bay', 'Emergency Trauma Room', 'Dispensary', 'Counseling Center']
    }
  ];

  const activePin = campusPins.find(p => p.id === activePinId) || campusPins[0];

  const filteredPins = campusPins.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (mapSearch.trim() && !p.name.toLowerCase().includes(mapSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
            Interactive Campus Navigation
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
            Campus Blueprint & Facility Locator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on buildings to inspect departments, floor guides, and facilities
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search block, lab, hall..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Academic', 'Sports', 'Canteen', 'Health', 'Recreation'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map Interactive Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vector SVG Campus Map */}
        <div className="lg:col-span-8 bg-gradient-to-tr from-[#0b192c] via-[#102a43] to-[#1e3e62] rounded-3xl p-6 border border-navy-700 shadow-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00ADB5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Compass / Orientation */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white">
            <div className="flex items-center space-x-2 bg-navy-950/80 px-3 py-1.5 rounded-xl border border-navy-700">
              <Compass className="w-4 h-4 text-brand-cyan animate-spin-slow" />
              <span className="font-bold">Main Campus Quadrangle (Apex-54)</span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono">Scale 1:500m</span>
          </div>

          {/* Graphical Building Map Representation */}
          <div className="relative w-full h-80 my-4 z-10">
            {/* Pathways / Roads SVG */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-40">
              <line x1="30%" y1="45%" x2="52%" y2="35%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
              <line x1="52%" y1="35%" x2="70%" y2="55%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
              <line x1="30%" y1="45%" x2="55%" y2="65%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
              <line x1="55%" y1="65%" x2="70%" y2="55%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
              <line x1="30%" y1="45%" x2="25%" y2="75%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
              <line x1="52%" y1="35%" x2="80%" y2="25%" stroke="#00ADB5" strokeWidth="2" strokeDasharray="4" />
            </svg>

            {/* Pins on the Map */}
            {filteredPins.map((pin) => {
              const isSelected = pin.id === activePinId;

              return (
                <div
                  key={pin.id}
                  onClick={() => setActivePinId(pin.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <div className={`flex flex-col items-center ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}>
                    {/* Pulsing ring on active */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-brand-cyan/40 animate-ping" />
                    )}

                    <div className={`p-2.5 rounded-2xl shadow-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-cyan text-navy-950 font-bold ring-4 ring-white'
                        : 'bg-navy-900/90 text-white border border-navy-700 hover:border-brand-cyan'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 whitespace-nowrap shadow-md ${
                      isSelected
                        ? 'bg-white text-navy-950 font-extrabold'
                        : 'bg-navy-950/80 text-slate-300 border border-navy-700'
                    }`}>
                      {pin.name.split(':')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Click any location pin to view floor guides & facilities inside</span>
            <span className="text-brand-cyan font-bold">{filteredPins.length} buildings located</span>
          </div>
        </div>

        {/* Right Details Panel for Active Building */}
        <div className="lg:col-span-4 bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {activePin.category}
            </span>
            <span className="text-xs font-mono text-slate-400">{activePin.floors}</span>
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
              {activePin.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {activePin.description}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Facilities & Wings Inside:
            </h4>
            <div className="space-y-1.5">
              {activePin.facilitiesInside.map((f) => (
                <div
                  key={f}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2 border border-slate-200/60 dark:border-navy-700"
                >
                  <Building className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => alert(`Directions generated: From Main Gate, follow North-East walkway towards ${activePin.name}. Distance: 250 meters.`)}
            className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md mt-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Walking Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
