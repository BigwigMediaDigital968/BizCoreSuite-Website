'use client';

import React from 'react';
import { Building2, Users2, Shield, Zap, Headphones, Boxes } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';

export const Scene03ImpactStats: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    Building2: <Building2 className="w-5 h-5 text-brand-600" />,
    Users2: <Users2 className="w-5 h-5 text-indigo-600" />,
    Shield: <Shield className="w-5 h-5 text-emerald-600" />,
    Zap: <Zap className="w-5 h-5 text-amber-500" />,
    Headphones: <Headphones className="w-5 h-5 text-blue-500" />,
    Boxes: <Boxes className="w-5 h-5 text-navy-800" />,
  };

  // Duplicate stats so the loop resets seamlessly at -50%
  const stats = siteConfig.impactStats;
  const marqueeItems = [...stats, ...stats];

  return (
    <div
      id="scene-impact"
      className="w-full h-full flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Self-contained marquee keyframes — autoplays continuously (no pause on hover) */}
      <style>{`
        @keyframes impact-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-impact-marquee {
          display: flex;
          width: max-content;
          animation: impact-marquee 32s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center w-full">
        <SectionHeader
          badge="QUANTIFIABLE BUSINESS VALUE"
          title="Scale Operations with"
          highlightText="Zero Friction."
          subtitle="Real measurable efficiency gains unlocked across fast-moving enterprise teams."
          className="mb-6 sm:mb-8"
        />
      </div>

      {/* Full-bleed Marquee Track with soft left/right edge fade */}
      <div
        // shrink-0: in this flex column an overflow-hidden track would otherwise
        // shrink on short screens and slice the cards off at the bottom
        className="marquee-wrapper w-full shrink-0 overflow-hidden py-4"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        }}
      >
        <div className="animate-impact-marquee gap-4 sm:gap-6 px-2 sm:px-3">
          {marqueeItems.map((stat, i) => {
            const originalIndex = i % stats.length;
            return (
              <GlassCard
                key={`${stat.label}-${i}`}
                className="w-[280px] sm:w-[340px] lg:w-[370px] shrink-0 p-6 sm:p-7 flex flex-col justify-between group hover:border-brand-400/40"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-tint-100/80 border border-brand-200/50 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-brand-50 transition-all duration-300">
                    {iconMap[stat.icon]}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/50">
                    METRIC 0{originalIndex + 1}
                  </span>
                </div>

                <div>
                  <div className="text-3xl sm:text-5xl font-extrabold text-navy-900 tracking-tight mb-2 flex items-baseline">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.suffix === '%' ? 1 : 0}
                    />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-navy-900 mb-1">
                    {stat.label}
                  </h4>
                  <p className="text-xs text-navy-muted leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};