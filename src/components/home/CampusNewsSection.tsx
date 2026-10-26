import React from 'react';
import { Newspaper, Trophy, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

export const CampusNewsSection: React.FC = () => {
  const newsItems = [
    {
      id: 'news-1',
      title: 'Government Polytechnic Ahmedabad Secures Top Ranking & NBA Accreditation',
      category: 'Institutional Achievement',
      date: 'Oct 22, 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      summary: 'With cutting-edge engineering laboratories, high-impact technical initiatives, and an outstanding placement record, Government Polytechnic Ahmedabad continues to lead technical education excellence.'
    },
    {
      id: 'news-2',
      title: 'CSE Research Team Wins ₹45 Lakh DST Grant for Autonomous Swarm Robotics',
      category: 'Research & Grants',
      date: 'Oct 19, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      summary: 'Led by Dr. Radhika Sen and student researchers, the AI Lab received funding from the Department of Science and Technology for developing disaster-relief drone swarms.'
    },
    {
      id: 'news-3',
      title: 'Alumni Spotlight: 2021 Batch Founder Raises $8M Series A for Green Hydrogen Tech',
      category: 'Alumni Network',
      date: 'Oct 14, 2026',
      readTime: '2 min read',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
      summary: 'Varun Nair, graduate of Mechanical Engineering, celebrated his clean energy startup milestone, crediting the campus incubation hub Ignite for early support.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-navy-900 dark:text-white flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-brand-cyan" />
            <span>Campus News & Research Highlights</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stories, student achievements, and academic breakthroughs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {newsItems.map((news) => (
          <div
            key={news.id}
            className="group bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-navy-900/90 text-brand-cyan backdrop-blur-xs border border-brand-cyan/30">
                  {news.category}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2">
                  <span>{news.date}</span>
                  <span>•</span>
                  <span>{news.readTime}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-cyan transition-colors leading-snug">
                  {news.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {news.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center text-xs font-bold text-brand-cyan group-hover:translate-x-1 transition-transform">
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
