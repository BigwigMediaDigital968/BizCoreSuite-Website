'use client';

import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  highlightText?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  highlightText,
  subtitle,
  align = 'center',
  dark = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {/* Pill Eyebrow Badge */}
      {/* {badge && (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4 transition-all duration-300 ${
          dark 
            ? 'bg-navy-800/80 text-brand-400 border border-brand-400/30 shadow-[0_0_15px_rgba(91,140,255,0.2)]' 
            : 'bg-tint-100/90 text-brand-600 border border-brand-600/20 shadow-sm'
        }`}>
          <BadgeIcon className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
          <span>{badge}</span>
        </div>
      )} */}

      {/* Main Headline */}
      <h2 className={`scene-display-title mb-4 ${dark ? 'text-white' : 'text-navy-text'}`}>
        {title}{' '}
        {highlightText && (
          <span className={dark ? 'text-gradient-white' : 'text-gradient-blue'}>
            {highlightText}
          </span>
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className={`section-subtitle max-w-2xl font-normal leading-relaxed ${
          dark ? 'text-blue-100/80' : 'text-navy-muted'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

