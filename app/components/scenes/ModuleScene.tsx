'use client';

import React, { useEffect, useRef } from 'react';
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
  Variants,
} from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { platformModules, ModuleItem } from '../../config/modules';
import { useSceneContext } from '../../context/SceneContext';
import { MODULE_SCENE_OFFSET, MODULE_SCENE_LAST } from '../../config/sceneLayout';
import { BrowserMockup } from '../ui/BrowserMockup';

export { MODULE_SCENE_OFFSET };

/**
 * Modules section — fully scroll-scrubbed.
 *
 *  Left:  a title "drum" — all 10 module titles in a vertical reel that rolls
 *         with the scroll; the current one is large, neighbours shrink + fade.
 *  Right: a card deck — the front dashboard lifts, tilts and flies off while
 *         the next card rises from the stack behind it.
 *
 * Both are pure functions of scroll position (no timers), so they move in
 * lockstep with the smooth scroll and reverse exactly when scrolling back.
 * Only the detail copy (tagline, chips, stats) swaps discretely — with a
 * short crossfade, since text can't be scrubbed meaningfully.
 */

const COUNT = platformModules.length;
const ROW = 60; // px between drum rows
const EASE_OUT = [0.23, 1, 0.32, 1] as const;


// ── Drum row ───────────────────────────────────────────────────────────
const DrumRow: React.FC<{
  i: number;
  module: ModuleItem;
  progress: MotionValue<number>;
  focusable: boolean;
  reduce: boolean;
  onSelect: () => void;
}> = ({ i, module, progress, focusable, reduce, onSelect }) => {
  const d = useTransform(progress, (p) => i - p);
  const y = useTransform(d, (v) => v * ROW);
  const scale = useTransform(d, (v) => (reduce ? 1 : 1 - Math.min(Math.abs(v), 2.5) * 0.16));
  const opacity = useTransform(d, (v) =>
    reduce ? (Math.abs(v) < 0.5 ? 1 : 0) : Math.max(0, 1 - Math.abs(v) * 0.45)
  );
  const transform = useMotionTemplate`translate3d(0, ${y}px, 0) scale(${scale})`;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      tabIndex={focusable ? 0 : -1}
      aria-label={`Show module ${module.number}: ${module.title}`}
      style={{ transform, opacity, height: ROW, marginTop: -ROW / 2 }}
      className="absolute left-0 top-1/2 origin-left flex items-center gap-3 text-left whitespace-nowrap will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-lg"
    >
      <span className="font-mono text-xs font-bold text-brand-600 tabular-nums">{module.number}</span>
      <span className="text-[clamp(1.5rem,2.2vw,2.15rem)] font-extrabold tracking-tight text-navy-900 leading-none">
        {module.title}
      </span>
    </motion.button>
  );
};

// ── Deck card ──────────────────────────────────────────────────────────
const DeckCard: React.FC<{
  i: number;
  module: ModuleItem;
  progress: MotionValue<number>;
  reduce: boolean;
}> = ({ i, module, progress, reduce }) => {
  const d = useTransform(progress, (p) => i - p);

  const transform = useTransform(d, (v) => {
    if (reduce) return 'none';
    if (v < 0) {
      // Front card leaving: lift, drift left, tilt — like dealing it off the deck
      const t = Math.min(1, -v);
      return `translate3d(${-t * 80}px, ${-t * 260}px, 0) rotate(${-t * 9}deg)`;
    }
    // Waiting cards: stacked behind, each a little lower and smaller
    const k = Math.min(v, 3);
    return `translate3d(0, ${k * 28}px, 0) scale(${1 - k * 0.06})`;
  });
  const opacity = useTransform(d, (v) => {
    if (reduce) return Math.max(0, 1 - Math.abs(v) * 2);
    // Leaving card stays solid (no two dashboards ghosting through each other)
    // until it has lifted mostly clear, then fades out.
    if (v < 0) {
      const t = -v;
      return t < 0.45 ? 1 : Math.max(0, 1 - (t - 0.45) * 3.2);
    }
    if (v > 2.6) return Math.max(0, 1 - (v - 2.6) * 2.5); // only 3 cards in the stack
    return 1;
  });
  // Leaving card stays on top while it flies off; the stack orders front-to-back
  const zIndex = useTransform(d, (v) => (v < 0 ? 40 : Math.round(30 - v * 3)));
  const visibility = useTransform(opacity, (o) => (o <= 0.001 ? 'hidden' : 'visible'));
  // Cards further back read slightly washed-out for depth (cheap overlay, no filter)
  const veil = useTransform(d, (v) => (v <= 0 ? 0 : Math.min(v, 3) * 0.18));

  return (
    <motion.div
      aria-hidden="true"
      style={{ transform, opacity, zIndex, visibility }}
      className="absolute inset-0 origin-bottom will-change-transform"
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-blue-glow border border-navy-900/10 bg-white">
        <BrowserMockup
          imageSrc={module.image.src}
          imageAlt={module.image.alt}
          urlPath={`bizcoresuite.internal / modules / ${module.id}`}
          statusText="ACTIVE"
        />
        <motion.div aria-hidden="true" style={{ opacity: veil }} className="absolute inset-0 bg-tint-50 pointer-events-none" />
      </div>

      <div className="absolute -top-3 left-5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-tint-200 shadow-card-soft text-[11px] font-bold text-navy-900">
        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
        <span>{module.chips[0]}</span>
      </div>
    </motion.div>
  );
};

// ── Section ────────────────────────────────────────────────────────────
interface ModulesSceneProps {
  onJumpToModule?: (sceneIndex: number) => void;
}

export const ModulesScene: React.FC<ModulesSceneProps> = ({ onJumpToModule }) => {
  const { activeIndex, sceneFloat } = useSceneContext();
  const reduce = !!useReducedMotion();

  // Continuous position through the modules: 0 … 9 (fractional between modules)
  const progress = useTransform(sceneFloat, (s) =>
    Math.min(COUNT - 1, Math.max(0, s - MODULE_SCENE_OFFSET))
  );
  const barFill = useTransform(sceneFloat, (s) => {
    const t = (s - MODULE_SCENE_OFFSET) / (MODULE_SCENE_LAST - MODULE_SCENE_OFFSET);
    return `scaleX(${Math.min(1, Math.max(0, t))})`;
  });

  const moduleIndex = Math.min(COUNT - 1, Math.max(0, activeIndex - MODULE_SCENE_OFFSET));
  const module = platformModules[moduleIndex];

  // Direction for the detail-copy crossfade
  const prevIndex = useRef(moduleIndex);
  const direction = moduleIndex >= prevIndex.current ? 1 : -1;
  useEffect(() => {
    prevIndex.current = moduleIndex;
  }, [moduleIndex]);

  // Preload every module image so cards never flash empty
  useEffect(() => {
    platformModules.forEach((m) => {
      const img = new Image();
      img.src = m.image.src;
    });
  }, []);

  const detailVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, transform: `translateY(${reduce ? 0 : 10 * dir}px)` }),
    center: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.24, ease: EASE_OUT } },
    exit: (dir: number) => ({
      opacity: 0,
      transform: `translateY(${reduce ? 0 : -6 * dir}px)`,
      transition: { duration: 0.12, ease: EASE_OUT },
    }),
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        {/* ── Left: eyebrow + title drum + details ── */}
        <div className="lg:col-span-5 flex flex-col text-left min-w-0">
          {/* Eyebrow with scroll-linked progress */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono font-bold tracking-wider text-brand-600 uppercase">
              Module <span className="tabular-nums">{module.number}</span>
              <span className="text-navy-muted/50"> / 10</span>
            </span>
            <div aria-hidden="true" className="relative h-[3px] w-24 rounded-full bg-navy-900/10 overflow-hidden">
              <motion.div className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ transform: barFill }} />
            </div>
          </div>

          {/* Title drum — rolls with the scroll */}
          <div
            className="relative w-full shrink-0 overflow-hidden"
            style={{
              height: ROW * 3.4,
              maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            }}
          >
            {platformModules.map((m, i) => (
              <DrumRow
                key={m.id}
                i={i}
                module={m}
                progress={progress}
                reduce={reduce}
                focusable={Math.abs(i - moduleIndex) <= 1}
                onSelect={() => onJumpToModule?.(i + MODULE_SCENE_OFFSET)}
              />
            ))}
          </div>

          {/* Details — short crossfade on module change */}
          <div className="grid mt-4">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={module.id}
                custom={direction}
                variants={detailVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="[grid-area:1/1] flex flex-col"
              >
                <p className="text-sm sm:text-base font-semibold text-brand-600 mb-5 leading-snug">
                  {module.oneLiner}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {module.chips.map((chip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-tint-200/90 shadow-xs text-xs font-semibold text-navy-900"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{chip}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {module.stats.map((st, i) => (
                    <div key={i} className="px-3.5 py-2 rounded-xl bg-white/70 border border-tint-200 text-left">
                      <div className="text-[10px] text-navy-muted font-medium">{st.label}</div>
                      <div className="text-xs sm:text-sm font-extrabold text-navy-900">{st.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: dashboard card deck ── */}
        <div className="lg:col-span-7 relative pb-16 pt-4">
          <div className="relative">
            {/* Invisible sizer so the absolutely-stacked cards get the mockup's exact height */}
            <div className="invisible" aria-hidden="true">
              <BrowserMockup />
            </div>
            {platformModules.map((m, i) => (
              <DeckCard key={m.id} i={i} module={m} progress={progress} reduce={reduce} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
