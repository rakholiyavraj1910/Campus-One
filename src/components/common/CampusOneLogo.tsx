import React from 'react';

export interface CampusOneLogoProps {
  /** Display variant:
   * - 'full': Complete horizontal logo (symbol + "CampusOne" wordmark + institutional subtitle)
   * - 'standard': Standard horizontal logo
   * - 'compact': Compact logo representation
   * - 'icon': 1:1 square brand icon (navy and orange C1 symbol with cap and gear)
   */
  variant?: 'full' | 'standard' | 'compact' | 'icon';
  /** Color theme mode:
   * - 'auto': Uses standard logo in light mode, dark-adapted logo in dark mode
   * - 'light': Forces standard navy & orange logo on light surface
   * - 'dark': Forces dark-mode optimized white & orange logo
   */
  theme?: 'auto' | 'light' | 'dark';
  /** Size preset:
   * - 'sm': 28px height (icon: 28x28px)
   * - 'md': 36px height (default navbar)
   * - 'lg': 46px height (auth headers)
   * - 'xl': 58px height (hero, landing & splash screens)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom height in pixels if preset is not sufficient */
  height?: number | string;
  /** Custom width in pixels/string if needed */
  width?: number | string;
  /** Custom icon size in pixels if size preset is not sufficient */
  iconSize?: number;
  /** Whether to enclose the logo in a clean rounded squircle badge container */
  withBadge?: boolean;
  /** Custom institutional subtext for accessibility or title */
  subtext?: string;
  /** Interactive hover animations (scale + subtle glow) */
  interactive?: boolean;
  /** Optional link destination */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Custom image alt text */
  alt?: string;
  /**
   * Responsive display: on narrow mobile screens (<sm), show the compact 1:1 icon;
   * on tablet/desktop (>=sm), show the full horizontal logo.
   * Defaults to false unless explicitly enabled.
   */
  responsive?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export interface CampusOneIconProps {
  size?: number;
  theme?: 'auto' | 'light' | 'dark';
  withBadge?: boolean;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

/**
 * Brand metadata and colour tokens for Government Polytechnic Ahmedabad:
 * Primary: Midnight Navy (#0B192C / #0E244D) - fill-navy-900
 * Secondary: Vibrant Orange (#FF671B)
 * Accent: Vibrant Turquoise (#00ADB5) - fill-brand-cyan
 */

/**
 * CampusOne 1:1 Square Brand Icon Mark:
 * Features the distinctive navy and orange C1 symbol with graduation cap and precision gear.
 */
export const CampusOneIcon: React.FC<CampusOneIconProps> = ({
  size = 36,
  theme = 'auto',
  withBadge = false,
  className = '',
  alt = 'CampusOne — Government Polytechnic Ahmedabad',
  onClick,
}) => {
  const iconSrc = 
    theme === 'dark'
      ? '/brand/campusone-icon-dark.png'
      : '/brand/campusone-icon.png';

  const iconElement = (
    <img
      src={iconSrc}
      alt={alt}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain select-none shrink-0 transition-transform ${className}`}
    />
  );

  if (withBadge) {
    return (
      <div
        onClick={onClick}
        className={`shrink-0 inline-flex items-center justify-center rounded-2xl p-1 bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-700/80 shadow-xs ${
          onClick ? 'cursor-pointer hover:shadow-md active:scale-95 transition-all' : ''
        } ${className}`}
        style={{ width: size + 8, height: size + 8 }}
        aria-label="CampusOne Logo Badge"
      >
        <img
          src="/brand/campusone-icon.png"
          alt={alt}
          width={size}
          height={size}
          loading="eager"
          decoding="async"
          style={{ width: `${size}px`, height: `${size}px` }}
          className="object-contain select-none shrink-0"
        />
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 p-0 m-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 rounded-xl"
        aria-label="CampusOne Portal Icon"
      >
        {iconElement}
      </button>
    );
  }

  return iconElement;
};

/**
 * CampusOne Shared Master Logo Component:
 * - variant="full": Complete horizontal brand logo (C1 symbol + CampusOne wordmark + Subtitle)
 * - variant="icon": 1:1 square brand icon (navy and orange C1 symbol)
 * - Preserves original aspect ratio and prevents layout shifts
 */
export const CampusOneLogo: React.FC<CampusOneLogoProps> = ({
  variant = 'standard',
  theme = 'auto',
  size = 'md',
  height,
  width,
  iconSize,
  withBadge = false,
  subtext = 'FOR GOVERNMENT POLYTECHNIC AHMEDABAD',
  interactive = false,
  href,
  onClick,
  alt = 'CampusOne — Government Polytechnic Ahmedabad',
  responsive = false,
  className = '',
}) => {
  // Height presets
  const heightPresets = {
    sm: 28,
    md: 36,
    lg: 46,
    xl: 58,
  };

  const actualHeight = height || heightPresets[size];
  const actualIconSize = iconSize || (typeof actualHeight === 'number' ? actualHeight : 36);

  // If icon-only variant is requested
  if (variant === 'icon') {
    return (
      <CampusOneIcon
        size={actualIconSize}
        theme={theme}
        withBadge={withBadge}
        className={className}
        alt={alt}
        onClick={onClick}
      />
    );
  }

  // Determine logo source according to theme
  // Light variant has navy text (#0E244D); Dark variant has crisp white text
  const lightLogoSrc = '/brand/campusone-logo.png';
  const darkLogoSrc = '/brand/campusone-logo-dark.png';

  const logoContent = (
    <div
      className={`inline-flex items-center shrink-0 select-none ${
        withBadge
          ? 'px-3 py-1.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-700/80 shadow-xs'
          : ''
      } ${interactive ? 'group cursor-pointer' : ''} ${className}`}
    >
      {responsive ? (
        <>
          {/* Mobile compact 1:1 square icon (<sm) */}
          <div className="flex sm:hidden items-center">
            <img
              src="/brand/campusone-icon.png"
              alt={alt}
              width={actualHeight}
              height={actualHeight}
              loading="eager"
              decoding="async"
              style={{ height: `${actualHeight}px`, width: `${actualHeight}px` }}
              className={`object-contain ${
                interactive ? 'group-hover:scale-105 transition-transform duration-200' : ''
              }`}
            />
          </div>

          {/* Tablet & Desktop full horizontal logo (>=sm) */}
          <div className="hidden sm:flex items-center">
            {theme === 'light' ? (
              <img
                src={lightLogoSrc}
                alt={alt}
                height={actualHeight}
                loading="eager"
                decoding="async"
                style={{ height: `${actualHeight}px`, width: 'auto' }}
                className={`max-w-none object-contain aspect-[2062/475] ${
                  interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                }`}
              />
            ) : theme === 'dark' ? (
              <img
                src={darkLogoSrc}
                alt={alt}
                height={actualHeight}
                loading="eager"
                decoding="async"
                style={{ height: `${actualHeight}px`, width: 'auto' }}
                className={`max-w-none object-contain aspect-[2062/475] ${
                  interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                }`}
              />
            ) : (
              <>
                {/* Auto theme: standard on light, dark on dark */}
                <img
                  src={lightLogoSrc}
                  alt={alt}
                  height={actualHeight}
                  loading="eager"
                  decoding="async"
                  style={{ height: `${actualHeight}px`, width: 'auto' }}
                  className={`dark:hidden max-w-none object-contain aspect-[2062/475] ${
                    interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                  }`}
                />
                <img
                  src={darkLogoSrc}
                  alt={alt}
                  height={actualHeight}
                  loading="eager"
                  decoding="async"
                  style={{ height: `${actualHeight}px`, width: 'auto' }}
                  className={`hidden dark:block max-w-none object-contain aspect-[2062/475] ${
                    interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                  }`}
                />
              </>
            )}
          </div>
        </>
      ) : (
        /* Always Full Horizontal Logo */
        <div className="flex items-center">
          {theme === 'light' ? (
            <img
              src={lightLogoSrc}
              alt={alt}
              height={actualHeight}
              loading="eager"
              decoding="async"
              style={{ 
                height: `${actualHeight}px`, 
                width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto' 
              }}
              className={`max-w-none object-contain aspect-[2062/475] ${
                interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
              }`}
            />
          ) : theme === 'dark' ? (
            <img
              src={darkLogoSrc}
              alt={alt}
              height={actualHeight}
              loading="eager"
              decoding="async"
              style={{ 
                height: `${actualHeight}px`, 
                width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto' 
              }}
              className={`max-w-none object-contain aspect-[2062/475] ${
                interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
              }`}
            />
          ) : (
            <>
              {/* Auto theme */}
              <img
                src={lightLogoSrc}
                alt={alt}
                height={actualHeight}
                loading="eager"
                decoding="async"
                style={{ 
                  height: `${actualHeight}px`, 
                  width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto' 
                }}
                className={`dark:hidden max-w-none object-contain aspect-[2062/475] ${
                  interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                }`}
              />
              <img
                src={darkLogoSrc}
                alt={alt}
                height={actualHeight}
                loading="eager"
                decoding="async"
                style={{ 
                  height: `${actualHeight}px`, 
                  width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto' 
                }}
                className={`hidden dark:block max-w-none object-contain aspect-[2062/475] ${
                  interactive ? 'group-hover:scale-102 transition-transform duration-200' : ''
                }`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 rounded-xl transition-all"
        aria-label="CampusOne Portal Home"
      >
        {logoContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center p-0 m-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 rounded-xl transition-all"
        aria-label="CampusOne Portal Home"
      >
        {logoContent}
      </button>
    );
  }

  return logoContent;
};

export default CampusOneLogo;
