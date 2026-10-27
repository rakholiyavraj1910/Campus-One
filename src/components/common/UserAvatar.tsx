import React, { useState } from 'react';
import { User, ShieldCheck, GraduationCap } from 'lucide-react';

export interface UserAvatarProps {
  src?: string | null;
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
  showBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  role,
  size = 'md',
  className = '',
  ring = true,
  showBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute initials (up to 2 letters)
  const getInitials = (n: string): string => {
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl font-black',
  }[size];

  const badgeSizeClasses = {
    xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-1 -right-1',
    lg: 'w-5 h-5 -bottom-1 -right-1',
    xl: 'w-6 h-6 -bottom-1 -right-1',
    '2xl': 'w-8 h-8 -bottom-1 -right-1',
  }[size];

  const ringClass = ring ? 'ring-2 ring-brand-cyan/40 dark:ring-teal-400/40 shadow-sm' : '';

  const hasValidPhoto = Boolean(src && !imageError && src.trim().length > 5);

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {hasValidPhoto ? (
        <img
          src={src!}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-2xl object-cover ${ringClass} transition-transform`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-[#0e3a53] text-teal-300 font-extrabold flex items-center justify-center border border-teal-500/30 ${ringClass}`}
          title={name}
        >
          {initials.length > 0 ? (
            <span className="tracking-tight">{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-teal-300" />
          )}
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute ${badgeSizeClasses} rounded-full flex items-center justify-center border border-white dark:border-navy-950 shadow-xs ${
            role === 'admin'
              ? 'bg-amber-500 text-navy-950'
              : role === 'faculty'
              ? 'bg-blue-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}
          title={`Verified ${role || 'User'}`}
        >
          {role === 'admin' ? (
            <ShieldCheck className="w-3/4 h-3/4" />
          ) : role === 'faculty' ? (
            <GraduationCap className="w-3/4 h-3/4" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </span>
      )}
    </div>
  );
};
