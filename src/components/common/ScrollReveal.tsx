import React from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  delayMs?: number; // alias for delay in ms
  duration?: number; // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // px offset for translation
  threshold?: number;
  rootMargin?: string;
  as?: any;
}

/**
 * ScrollReveal: Zero-dependency, accessible scroll reveal component.
 * Features:
 * - Hardware accelerated CSS transitions (opacity, transform)
 * - Safe fallback (content is visible immediately if JS/IntersectionObserver fails)
 * - Disconnects after reveal to preserve CPU and battery
 * - Honors prefers-reduced-motion
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  delayMs,
  duration = 500,
  direction = 'up',
  distance,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  as: Component = 'div',
}) => {
  const effectiveDelay = delayMs !== undefined ? delayMs : delay;
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin, delayMs: effectiveDelay });

  const getTransformClasses = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';

    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-4';
      case 'down':
        return 'opacity-0 -translate-y-4';
      case 'left':
        return 'opacity-0 translate-x-4';
      case 'right':
        return 'opacity-0 -translate-x-4';
      case 'none':
      default:
        return 'opacity-0';
    }
  };

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all ${getTransformClasses()} ${className}`}
    >
      {children}
    </Component>
  );
};

export interface ScrollStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * ScrollStagger: Automatically cascades children with incremental delays when revealed.
 * Perfect for card grids (e.g., Quick Campus Services, Portal Cards, Metrics).
 */
export const ScrollStagger: React.FC<ScrollStaggerProps> = ({
  children,
  className = '',
  staggerMs = 50,
  threshold = 0.1,
  direction = 'up',
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold });

  const getTransformClasses = () => {
    if (isVisible) return 'opacity-100 translate-y-0 scale-100';
    return direction === 'up' ? 'opacity-0 translate-y-4' : 'opacity-0';
  };

  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, idx) => (
        <div
          key={idx}
          style={{
            transitionDuration: '500ms',
            transitionDelay: `${idx * staggerMs}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`transition-all ${getTransformClasses()}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export interface AnimatedProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  barColor?: string;
  bgColor?: string;
  heightClass?: string;
  showLabel?: boolean;
}

/**
 * AnimatedProgressBar: Smoothly animates width from 0 to value when scrolled into view.
 */
export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  className = '',
  barColor = 'bg-brand-cyan',
  bgColor = 'bg-slate-200 dark:bg-navy-800',
  heightClass = 'h-2',
  showLabel = false,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div ref={ref} className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Progress</span>
          <span className="font-mono">{clamped}%</span>
        </div>
      )}
      <div className={`w-full ${heightClass} ${bgColor} rounded-full overflow-hidden`}>
        <div
          style={{
            width: isVisible ? `${clamped}%` : '0%',
            transitionDuration: '800ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`${heightClass} ${barColor} rounded-full transition-all`}
        />
      </div>
    </div>
  );
};
