'use client';

import React from 'react';
import { ShieldCheck, Lock, FileCheck, Database, KeyRound, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';

export const Scene17Security: React.FC = () => {
  const sec = siteConfig.security;

  const iconMap: Record<string, React.ReactNode> = {
    UserCheck: <KeyRound className="w-5 h-5 text-brand-600" />,
    Lock: <Lock className="w-5 h-5 text-brand-600" />,
    FileCheck: <FileCheck className="w-5 h-5 text-brand-600" />,
    Database: <Database className="w-5 h-5 text-brand-600" />,
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      {/* Central Shield Icon */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-900 to-brand-600 border border-brand-400/40 shadow-button flex items-center justify-center text-white animate-pulse-slow">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <SectionHeader
        badge={sec.badge}
        title={sec.heading}
        subtitle={sec.subheading}
        className="mb-8"
      />

      {/* 4 Short Security Cards */}
      <div data-scroll-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {sec.cards.map((card, idx) => (
          <GlassCard
            key={idx}
            className="p-5 flex flex-col justify-between group hover:border-brand-400/50"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                {iconMap[card.icon]}
              </div>

              <h4 className="text-base font-bold text-navy-900 mb-1.5 group-hover:text-brand-600 transition-colors">
                {card.title}
              </h4>

              <p className="text-xs text-navy-muted leading-relaxed">
                {card.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-tint-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active 24/7</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Compliance Bar */}
      <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 px-6 py-2.5 rounded-full bg-white/90 border border-tint-200 shadow-sm text-xs font-semibold text-navy-900">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> SOC2 Type II
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> ISO/IEC 27001
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> GDPR Compliant
        </span>
      </div>
    </div>
  );
};
