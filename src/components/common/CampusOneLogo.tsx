import React from 'react';

export interface CampusOneLogoProps {
  /** Display variant:
   * - 'full': Icon + "CampusOne" wordmark + Subtitle + active pulse indicator
   * - 'standard': Icon + "CampusOne" wordmark + active pulse indicator
   * - 'compact': Icon + "CampusOne" wordmark (no subtext/pulse, tighter tracking)
   * - 'icon': Geometric dual-colour icon only (for collapsed sidebars / mobile buttons)
   */
  variant?: 'full' | 'standard' | 'compact' | 'icon';
  /** Color theme mode:
   * - 'auto': Uses midnight navy in light mode, crisp white in dark mode
   * - 'light': Forces midnight navy (#0B192C) text & collegiate arch
   * - 'dark': Forces white (#FFFFFF) text & collegiate arch
   */
  theme?: 'auto' | 'light' | 'dark';
  /** Size preset:
   * - 'sm': 28px icon, 16px font
   * - 'md': 36px icon, 20px font (default navbar)
   * - 'lg': 44px icon, 24px font (auth headers)
   * - 'xl': 56px icon, 30px font (hero & splash)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom icon size in pixels if size preset is not sufficient */
  iconSize?: number;
  /** Whether to enclose the icon in a midnight navy squircle badge container */
  withBadge?: boolean;
  /** Custom institutional subtext (defaults to 'FOR GOVERNMENT POLYTECHNIC AHMEDABAD') */
  subtext?: string;
  /** Interactive hover animations (scale + glow) */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Optional responsive mode flag */
  responsive?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export interface CampusOneIconProps {
  size?: number;
  theme?: 'auto' | 'light' | 'dark';
  withBadge?: boolean;
  className?: string;
}

/**
 * CampusOne Dual-Colour Geometric Icon Mark:
 * - Left Architectural Portal ("C"): Represents the collegiate hall, colonnade, and institutional foundation.
 * - Right Clocktower Spire ("1"): Represents the university landmark, unified portal, and numeral "1".
 * - Connected Network Pulse Node: Represents the interconnected digital campus network.
 * - Dual Colours: Midnight Navy (#0B192C) & Vibrant Turquoise (#00ADB5).
 */
export const CampusOneIcon: React.FC<CampusOneIconProps> = ({
  size = 36,
  theme = 'auto',
  withBadge = false,
  className = '',
}) => {
  // Resolve fill colors based on theme mode
  const getCollegiateArchFill = () => {
    if (withBadge) {
      return '#FFFFFF';
    }
    if (theme === 'light') return '#0B192C';
    if (theme === 'dark') return '#FFFFFF';
    return undefined; // Handled via CSS class
  };

  const archFill = getCollegiateArchFill();

  if (withBadge) {
    return (
      <div 
        className={`shrink-0 inline-flex items-center justify-center rounded-2xl bg-navy-900 border border-slate-700/60 shadow-md ${className}`}
        style={{ width: size, height: size }}
        aria-label="CampusOne Logo Badge"
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Collegiate Gateway Arch 'C' in crisp white */}
          <path
            d="M25 8H14C9.58 8 6 11.58 6 16V32C6 36.42 9.58 40 14 40H36C37.1 40 38 39.1 38 38V33C38 31.9 37.1 31 36 31H17C14.79 31 13 29.21 13 27V19C13 16.79 14.79 15 17 15H25C26.1 15 27 14.1 27 13V10C27 8.9 26.1 8 25 8Z"
            fill="#FFFFFF"
          />
          {/* 'One' Clocktower Spire in vibrant turquoise */}
          <path d="M30 18L34.5 14.5V30H30.5V18Z" fill="#00ADB5" />
          {/* Connected Network Pulse Node */}
          <circle cx="32.5" cy="9.5" r="3.2" fill="#00ADB5" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="CampusOne Collegiate Emblem"
    >
      {/* Collegiate Gateway Arch 'C' */}
      <path
        d="M25 8H14C9.58 8 6 11.58 6 16V32C6 36.42 9.58 40 14 40H36C37.1 40 38 39.1 38 38V33C38 31.9 37.1 31 36 31H17C14.79 31 13 29.21 13 27V19C13 16.79 14.79 15 17 15H25C26.1 15 27 14.1 27 13V10C27 8.9 26.1 8 25 8Z"
        fill={archFill}
        className={archFill ? undefined : 'fill-navy-900 dark:fill-white transition-colors duration-200'}
      />
      {/* 'One' Clocktower Spire */}
      <path
        d="M30 18L34.5 14.5V30H30.5V18Z"
        fill="#00ADB5"
        className="fill-brand-cyan"
      />
      {/* Connected Network Pulse Node */}
      <circle
        cx="32.5"
        cy="9.5"
        r="3.2"
        fill="#00ADB5"
        className="fill-brand-cyan"
      />
    </svg>
  );
};

export const CampusOneLogo: React.FC<CampusOneLogoProps> = ({
  variant = 'standard',
  theme = 'auto',
  size = 'md',
  iconSize,
  withBadge = false,
  subtext = 'FOR GOVERNMENT POLYTECHNIC AHMEDABAD',
  interactive = false,
  onClick,
  responsive = false,
  className = '',
}) => {
  // Preset dimensions
  const dimensions = {
    sm: { icon: 26, title: 'text-base', sub: 'text-[7.5px] sm:text-[8px] tracking-[0.14em]' },
    md: { icon: 34, title: 'text-xl', sub: 'text-[8.5px] sm:text-[9.5px] tracking-[0.16em]' },
    lg: { icon: 42, title: 'text-2xl', sub: 'text-[9.5px] sm:text-[10.5px] tracking-[0.16em]' },
    xl: { icon: 54, title: 'text-3xl', sub: 'text-[11px] sm:text-[12px] tracking-[0.18em]' },
  }[size];

  const actualIconSize = iconSize || dimensions.icon;

  // Resolve typography color classes
  const getTextColorClass = () => {
    if (theme === 'light') return 'text-navy-900';
    if (theme === 'dark') return 'text-white';
    return 'text-navy-900 dark:text-white';
  };

  const getSubtextColorClass = () => {
    if (theme === 'light') return 'text-slate-500';
    if (theme === 'dark') return 'text-slate-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  const content = (
    <div
      className={`inline-flex items-center space-x-2.5 text-left select-none ${
        interactive ? 'group cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Dual-Colour Emblem */}
      <div className={interactive ? 'group-hover:scale-105 transition-transform duration-200' : ''}>
        <CampusOneIcon
          size={actualIconSize}
          theme={theme}
          withBadge={withBadge}
        />
      </div>

      {/* Wordmark & Optional Subtext */}
      {variant !== 'icon' && (
        <div className={`flex flex-col justify-center ${responsive ? 'hidden xs:flex' : ''}`}>
          <div className="flex items-center space-x-1.5 leading-none">
            <span
              className={`font-extrabold tracking-tight font-sans ${dimensions.title} ${getTextColorClass()}`}
            >
              Campus<span className="text-brand-cyan">One</span>
            </span>
            {variant !== 'compact' && (
              <span
                className="inline-block w-2 h-2 rounded-full bg-brand-cyan animate-pulse shrink-0"
                aria-hidden="true"
              />
            )}
          </div>

          {variant === 'full' && subtext && (
            <p
              className={`font-bold uppercase tracking-wider mt-0.5 truncate leading-none ${dimensions.sub} ${getSubtextColorClass()}`}
            >
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 rounded-xl transition-all"
        aria-label="CampusOne Portal Home"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default CampusOneLogo;
