import { useEffect, useRef, useState } from 'react';

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delayMs?: number;
  once?: boolean;
}

/**
 * Lightweight, performant hook for scroll-triggered reveal animations using native IntersectionObserver.
 * Features:
 * - Runs strictly once per element, then unobserves immediately to maximize performance.
 * - Respects user preference for reduced motion (defaults immediately to visible).
 * - Safe fallback: If IntersectionObserver is not supported, defaults immediately to visible so content is NEVER trapped invisible.
 * - Uses pure CSS transforms & opacity to avoid layout shifts.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', delayMs = 0, once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // 1. Accessibility: Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    // 2. Safe Fallback: If IntersectionObserver unsupported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              timeoutId = setTimeout(() => {
                setIsVisible(true);
              }, delayMs);
            } else {
              setIsVisible(true);
            }

            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (element) observer.unobserve(element);
      observer.disconnect();
    };
  }, [threshold, rootMargin, delayMs, once]);

  return { ref, isVisible };
}
