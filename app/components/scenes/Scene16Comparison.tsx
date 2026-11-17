'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTransform } from 'framer-motion';
import { XCircle, CheckCircle2, AlertTriangle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { useSceneContext } from '../../context/SceneContext';
import { COMPARISON_SCENE, dwellProgress } from '../../config/sceneLayout';
import { SectionHeader } from '../ui/SectionHeader';

// The slider rests briefly at the start of the scroll dwell, then travels to the end.
const REST = 0.1;
const dwellToPos = (t: number) => Math.min(100, Math.max(0, ((t - REST) / (1 - 2 * REST)) * 100));

export const Scene16Comparison: React.FC = () => {
  const comp = siteConfig.comparison;
  const { scrollYProgress, requestDwellCollapse } = useSceneContext();

  // Scroll pushes the slider FORWARD only: 0 = "Without" → 100 = "With Bizcore".
  // We keep the furthest point scroll has reached; scrolling back up never
  // rewinds the slider (the before → after story plays once).
  const dwell = useTransform(scrollYProgress, (p) => dwellProgress(p, COMPARISON_SCENE));
  const scrollHighWater = useRef(dwellToPos(dwell.get()));
  const [sliderPos, setSliderPos] = useState(scrollHighWater.current);
  useEffect(
    () =>
      dwell.on('change', (t) => {
        const v = dwellToPos(t);
        if (v > scrollHighWater.current) {
          scrollHighWater.current = v;
          setSliderPos(v);
          // Story finished → drop the scroll hold, so passing back through this
          // section (or down again) doesn't pause on a slider that no longer moves.
          if (v >= 100) requestDwellCollapse(COMPARISON_SCENE);
        }
      }),
    [dwell, requestDwellCollapse]
  );

  // Manual control (drag / label click) still works both ways; it just sets the
  // slider and doesn't move the page.
  const setPos = (pos: number) => setSliderPos(Math.min(100, Math.max(0, pos)));

  // The side the slider moves TOWARD comes forward; the other recedes.
  // Both are fully visible at the centre; continuous, not a hard threshold.
  const t = sliderPos / 100;
  const withWeight = Math.min(1, t * 2); // 0 at far-left → 1 from centre rightwards
  const withoutWeight = Math.min(1, (1 - t) * 2); // 1 up to centre → 0 at far-right
  const emphasis = (w: number): React.CSSProperties => ({
    opacity: 0.35 + 0.65 * w,
    transform: `scale(${0.96 + 0.04 * w})`,
  });

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <SectionHeader
        badge="THE OPERATIONAL SHIFT"
        title={comp.heading}
        highlightText="Before & After."
        subtitle="Eliminate disconnected tools and manual spreadsheet errors permanently."
        className="mb-6 sm:mb-8"
      />

      {/* Slider Control */}
      <div className="flex items-center justify-between w-full max-w-md mb-6 px-4 py-1.5 rounded-full glass-pill border border-white/80 shadow-sm text-xs font-bold text-navy-900">
        <button
          type="button"
          onClick={() => setPos(0)}
          className={`font-mono text-[11px] transition-colors duration-200 ${withoutWeight > withWeight ? 'text-navy-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          WITHOUT
        </button>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
          <input
            type="range"
            min="0"
            max="100"
            step="any"
            value={sliderPos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Compare: slide left for without Bizcore, right for with Bizcore"
            aria-valuetext={sliderPos < 50 ? 'Showing without Bizcore' : sliderPos > 50 ? 'Showing with Bizcore' : 'Showing both'}
            className="w-28 sm:w-36 accent-brand-600 cursor-pointer"
          />
        </div>
        <button
          type="button"
          onClick={() => setPos(100)}
          className={`font-mono text-[11px] transition-colors duration-200 ${withWeight > withoutWeight ? 'text-brand-600' : 'text-brand-600/50 hover:text-brand-600'}`}
        >
          WITH BIZCORE
        </button>
      </div>

      {/* 2 Panels Grid — the outer cells belong to the scroll animation;
          the slider's emphasis lives on the inner card so they never overwrite each other */}
      <div data-scroll-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">

        {/* Left: Without */}
        <div className="flex">
        <div
          style={emphasis(withoutWeight)}
          className="w-full rounded-2xl p-5 sm:p-6 bg-slate-100/90 border border-slate-300 shadow-sm flex flex-col justify-between transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold uppercase mb-3">
              <AlertTriangle className="w-3 h-3 text-slate-500" />
              <span>{comp.without.title}</span>
            </div>

            <div className="space-y-2.5">
              {comp.without.points.map((pt, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-200 text-slate-700 text-xs">
                  <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-medium text-slate-500">
            Lost revenue and delayed payouts.
          </div>
        </div>
        </div>

        {/* Right: With Bizcore */}
        <div className="flex">
        <div
          style={emphasis(withWeight)}
          className="w-full rounded-2xl p-5 sm:p-6 bg-white border-2 border-brand-500/40 shadow-blue-glow flex flex-col justify-between transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-mono font-bold uppercase mb-3">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span>{comp.with.title}</span>
            </div>

            <div className="space-y-2.5">
              {comp.with.points.map((pt, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-tint-50 border border-brand-200/60 text-navy-900 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-tint-200 text-[11px] font-bold text-brand-700">
            Instant operations, zero error, +247% lead conversion.
          </div>
        </div>
        </div>

      </div>
    </div>
  );
};

