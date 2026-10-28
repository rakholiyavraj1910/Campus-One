import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`skeleton-shimmer rounded-xl bg-slate-200/80 dark:bg-navy-800/80 ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard: React.FC<{ rows?: number; count?: number; className?: string }> = ({
  rows = 3,
  count = 1,
  className = '',
}) => {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, idx) => (
          <SkeletonCard key={idx} rows={rows} className={className} />
        ))}
      </>
    );
  }

  return (
    <div
      className={`p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-3 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => {
  return (
    <div
      className={`rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm overflow-hidden p-4 space-y-3 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center space-x-4 py-2 border-b border-slate-50 dark:border-navy-800/50">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 ${c === 0 ? 'w-1/4' : c === cols - 1 ? 'w-16' : 'flex-1'} rounded-lg`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
