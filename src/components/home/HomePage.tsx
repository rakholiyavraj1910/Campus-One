import React from 'react';
import { HeroBanner } from './HeroBanner';
import { QuickAccessGrid } from './QuickAccessGrid';
import { TodayScheduleWidget } from './TodayScheduleWidget';
import { UrgentNoticesTicker } from './UrgentNoticesTicker';
import { UpcomingEventsCarousel } from './UpcomingEventsCarousel';
import { CampusNewsSection } from './CampusNewsSection';
import { ScrollReveal } from '../common/ScrollReveal';
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
      <ScrollReveal direction="up" delay={40}>
        <QuickAccessGrid onNavigate={onNavigate} />
      </ScrollReveal>

      {/* 3. Dynamic 2-column split: Today's Classes & Important Circulars */}
      <ScrollReveal direction="up" delay={60}>
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
      </ScrollReveal>

      {/* 4. Upcoming Events & Competitions Carousel */}
      <ScrollReveal direction="up" delay={60}>
        <UpcomingEventsCarousel
          events={events}
          onNavigate={onNavigate}
          onRefreshEvents={onRefreshEvents}
        />
      </ScrollReveal>

      {/* 5. Campus News & Achievements */}
      <ScrollReveal direction="up" delay={60}>
        <CampusNewsSection />
      </ScrollReveal>
    </div>
  );
};
