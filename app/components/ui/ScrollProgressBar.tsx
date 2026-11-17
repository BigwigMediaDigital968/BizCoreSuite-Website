'use client';

import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollProgressBarProps {
  /** Page scroll progress 0–1 (continuous, from the smooth-scroll hook). */
  progress: MotionValue<number>;
  /** Click handler — scrolls back to the top. */
  onClick?: () => void;
}

const SIZE = 52;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;

/**
 * Circular scroll-progress indicator, fixed bottom-left.
 * The ring is a pure function of scroll position (no transition), so it fills
 * in lockstep with the smooth scroll. Shows the percentage; on hover the
 * number swaps to an arrow and clicking scrolls back to the top.
 */
export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ progress, onClick }) => {
  const clamped = useTransform(progress, (p) => Math.min(1, Math.max(0, p)));
  const percent = useTransform(clamped, (p) => `${Math.round(p * 100)}%`);
  // A round line-cap draws a dot even at length 0 — hide the stroke until there's progress
  const strokeOpacity = useTransform(clamped, (p) => (p > 0.002 ? 1 : 0));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll progress — back to top"
      className="group fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-40 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-card-soft transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] active:scale-95 [@media(hover:hover)]:hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="scroll-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A1A4A" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#5B8CFF" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#E4ECFD" strokeWidth={STROKE} />
        {/* Progress */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="url(#scroll-ring-grad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          style={{ pathLength: clamped, opacity: strokeOpacity }}
        />
      </svg>

      {/* Percentage → arrow on hover */}
      <span className="absolute inset-0 flex items-center justify-center">
        <motion.span className="text-[11px] font-bold tabular-nums text-navy-900 transition-opacity duration-150 [@media(hover:hover)]:group-hover:opacity-0">
          {percent}
        </motion.span>
        <ArrowUp className="absolute w-4 h-4 text-brand-600 opacity-0 transition-opacity duration-150 [@media(hover:hover)]:group-hover:opacity-100" />
      </span>
    </button>
  );
};
