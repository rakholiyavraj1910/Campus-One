import React from 'react';
import { DepartmentDirectory } from './DepartmentDirectory';
import { FacultyDirectory } from './FacultyDirectory';
import { FacilitiesExplorer } from './FacilitiesExplorer';
import { LibraryPortal } from './LibraryPortal';
import { InteractiveCampusMap } from './InteractiveCampusMap';
import { CanteenAndFood } from './CanteenAndFood';
import { StudentClubs } from './StudentClubs';
import { PlacementCell } from './PlacementCell';
import { OfficeAndFAQs } from './OfficeAndFAQs';
import { 
  Building2, 
  Users, 
  BookOpen, 
  MapPin, 
  Coffee, 
  Sparkles, 
  Briefcase, 
  HelpCircle,
  Laptop
} from 'lucide-react';

interface CampusHubProps {
  currentSubTab?: string;
  onNavigateSubTab: (subTab: string) => void;
}

export const CampusHub: React.FC<CampusHubProps> = ({
  currentSubTab = 'departments',
  onNavigateSubTab
}) => {
  const tabs = [
    { id: 'departments', label: 'Departments & Labs', icon: Building2 },
    { id: 'faculty', label: 'Faculty Directory', icon: Users },
    { id: 'facilities', label: 'Campus Facilities', icon: Laptop },
    { id: 'library', label: 'Central Library', icon: BookOpen },
    { id: 'map', label: 'Interactive Campus Map', icon: MapPin },
    { id: 'canteen', label: 'Canteen & Food', icon: Coffee },
    { id: 'clubs', label: 'Clubs & Societies', icon: Sparkles },
    { id: 'placement', label: 'Placement Cell', icon: Briefcase },
    { id: 'offices', label: 'Offices & FAQs', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-tab Navigation Bar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-2 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentSubTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onNavigateSubTab(t.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Sub-tab Views */}
      {currentSubTab === 'departments' && <DepartmentDirectory />}
      {currentSubTab === 'faculty' && <FacultyDirectory />}
      {currentSubTab === 'facilities' && <FacilitiesExplorer />}
      {currentSubTab === 'library' && <LibraryPortal />}
      {currentSubTab === 'map' && <InteractiveCampusMap />}
      {currentSubTab === 'canteen' && <CanteenAndFood />}
      {currentSubTab === 'clubs' && <StudentClubs />}
      {currentSubTab === 'placement' && <PlacementCell />}
      {currentSubTab === 'offices' && <OfficeAndFAQs />}
    </div>
  );
};
