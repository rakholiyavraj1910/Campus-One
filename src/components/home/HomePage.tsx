import React from 'react';
import { HeroBanner } from './HeroBanner';
import { QuickAccessGrid } from './QuickAccessGrid';
import { TodayScheduleWidget } from './TodayScheduleWidget';
import { UrgentNoticesTicker } from './UrgentNoticesTicker';
import { UpcomingEventsCarousel } from './UpcomingEventsCarousel';
import { CampusNewsSection } from './CampusNewsSection';
import { QuickContactBar } from './QuickContactBar';
import { Notice, EventItem } from '../../types';

interface HomePageProps {
  notices: Notice[];
  events: EventItem[];
  onNavigate: (page: string, subTab?: string, itemId?: string) => void;
  onOpenNotice: (notice: Notice) => void;
  onRefreshEvents?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  notices,
  events,
  onNavigate,
  onOpenNotice,
  onRefreshEvents
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Personalized Hero Banner with quick stats */}
      <HeroBanner onNavigate={onNavigate} />

      {/* 2. 8 Quick-Access Portal Cards */}
      <QuickAccessGrid onNavigate={onNavigate} />

      {/* 3. Dynamic 2-column split: Today's Classes & Important Circulars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <TodayScheduleWidget onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-6">
          <UrgentNoticesTicker
            notices={notices}
            onNavigate={onNavigate}
            onOpenNotice={onOpenNotice}
          />
        </div>
      </div>

      {/* 4. Upcoming Events & Competitions Carousel */}
      <UpcomingEventsCarousel
        events={events}
        onNavigate={onNavigate}
        onRefreshEvents={onRefreshEvents}
      />

      {/* 5. Campus News & Achievements */}
      <CampusNewsSection />

      {/* 6. Emergency & Office Contact Bar */}
      <QuickContactBar onNavigate={onNavigate} />
    </div>
  );
};
