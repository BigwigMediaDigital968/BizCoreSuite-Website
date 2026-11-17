'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { GlassCard } from '../ui/GlassCard';
import { SectionHeader } from '../ui/SectionHeader';

export const Scene18Testimonials: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const items = siteConfig.testimonials;

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <SectionHeader
        badge="EXECUTIVE PROOF"
        title="Validated by Industry"
        highlightText="Leaders."
        subtitle="500+ fast-growing multi-branch enterprises run on Bizcore Suite."
        className="mb-8"
      />

      {/* Testimonials Carousel */}
      <div className="w-full max-w-4xl relative">
        <div data-scroll-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {items.map((t, idx) => {
            const isFeatured = currentIdx === idx;
            return (
              <GlassCard 
                key={idx} 
                className={`p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer ${
                  isFeatured 
                    ? 'border-brand-500 shadow-blue-glow scale-105 bg-white' 
                    : 'border-tint-200/80 opacity-80 hover:opacity-100'
                }`}
                onClick={() => setCurrentIdx(idx)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      {t.resultBadge}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <Quote className="w-5 h-5 text-brand-400/30 mb-1" />
                  <p className="text-xs text-navy-muted leading-relaxed italic mb-4">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-tint-100 flex items-center gap-2.5">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border border-tint-200 object-cover"
                  />
                  <div className="flex flex-col text-left">
                    <h5 className="text-xs font-bold text-navy-900 leading-tight">{t.name}</h5>
                    <span className="text-[10px] text-brand-600 font-semibold">{t.company}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                currentIdx === i ? 'w-6 h-2 bg-brand-600' : 'w-2 h-2 bg-navy-900/20'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

