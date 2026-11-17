'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useTransform, useReducedMotion, easeInOut } from 'framer-motion';
import { useSceneContext } from '../../context/SceneContext';
import { useSceneScrub } from '../../hooks/useSceneScrub';

export interface SceneWrapperProps {
  index: number;
  /** Last scene index this wrapper stays pinned for (inclusive). Defaults to `index`. */
  endIndex?: number;
  transitionType?: 'slide-up' | 'scale-blur' | 'clip-wipe' | 'horizontal' | 'rotate-in' | 'fade' | 'zoom-in';
  /** Play a one-time, time-based entrance on page load (hero only). */
  intro?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  index,
  endIndex,
  transitionType = 'fade',
  intro = false,
  children,
  className = '',
}) => {
  const { sceneFloat, activeIndex, totalScenes } = useSceneContext();
  const reduceMotion = !!useReducedMotion();

  const lastIndex = endIndex ?? index;

  // All maths in scene coordinates (sceneFloat), so it stays correct whatever
  // scroll length each gap gets in config/sceneLayout.ts.
  // Crossfade window: from 0.25 to 0.75 of the gap, outgoing & incoming overlap 1:1.
  const fadeStart = 0.25;
  const fadeEnd = 0.75;

  const isFirst = index === 0;
  const isLast = lastIndex === totalScenes - 1;

  const range = isFirst
    ? [0, lastIndex + fadeStart, lastIndex + fadeEnd]
    : isLast
      ? [index - fadeEnd, index - fadeStart, totalScenes - 1]
      : [index - fadeEnd, index - fadeStart, lastIndex + fadeStart, lastIndex + fadeEnd];

  // Helper to pick [enter, holdStart, holdEnd, exit] values cleanly per scene position
  const getValues = <T,>(enter: T, hold: T, exit: T): T[] => {
    if (isFirst) return [hold, hold, exit];
    if (isLast) return [enter, hold, hold];
    return [enter, hold, hold, exit];
  };

  // 1. Synchronized Opacity (1 -> 0 overlaps directly with 0 -> 1)
  // Ease each crossfade segment instead of mapping scroll linearly, so scenes
  // glide in/out rather than tracking every wheel tick 1:1.
  const ease = { ease: easeInOut };

  // 1. Synchronized Opacity
  const opacity = useTransform(sceneFloat, range, getValues(0, 1, 0), ease);

  // 2–5. Per-type motion, composed into ONE transform string (GPU-composited).
  //  Note: 'scale-blur' no longer animates filter: blur() — blurring a full-screen
  //  layer full of backdrop-filter glass cards was the main source of dropped frames.
  const yPx = transitionType === 'slide-up' ? getValues(35, 0, -35) : getValues(0, 0, 0);
  const xPx = transitionType === 'horizontal' ? getValues(50, 0, -50) : getValues(0, 0, 0);
  const scaleVals =
    transitionType === 'scale-blur' || transitionType === 'rotate-in'
      ? getValues(0.95, 1, 0.95)
      : transitionType === 'zoom-in'
        ? getValues(0.95, 1, 1.12)
        : getValues(1, 1, 1);
  const rotVals = transitionType === 'rotate-in' ? getValues(-1.5, 0, 1.5) : getValues(0, 0, 0);

  const y = useTransform(sceneFloat, range, yPx, ease);
  const x = useTransform(sceneFloat, range, xPx, ease);
  const scale = useTransform(sceneFloat, range, scaleVals, ease);
  const rotate = useTransform(sceneFloat, range, rotVals, ease);

  const transform = useTransform(
    [x, y, scale, rotate],
    ([tx, ty, s, r]: number[]) =>
      `translate3d(${tx}px, ${ty}px, 0) scale(${s}) rotate(${r}deg)`
  );

  const isCurrent = activeIndex >= index && activeIndex <= lastIndex;
  const isNear = activeIndex >= index - 1 && activeIndex <= lastIndex + 1;

  // ── Per-element scroll scrub ───────────────────────────────────────
  // Local progress of this scene: -1 (below, entering) → 0 (centred) → +1 (above, gone).
  // Every element inside maps this to its own staggered motion (useSceneScrub).
  const innerRef = useRef<HTMLDivElement>(null);
  const local = useTransform(sceneFloat, (s) => {
    if (s < index) return Math.max(-1.2, s - index);
    if (s > lastIndex) return Math.min(1.2, s - lastIndex);
    return 0;
  });
  useSceneScrub(innerRef, local, { reduceMotion });

  // ── One-time load intro (hero) ─────────────────────────────────────
  // Time-based, because nothing has been scrolled yet on first paint.
  useEffect(() => {
    if (!intro || reduceMotion || window.scrollY > 10) return;
    const root = innerRef.current?.firstElementChild;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-intro]'));
    const anims = targets.map((el) => {
      const order = Number(el.dataset.intro) || 0;
      return el.animate(
        [
          { opacity: 0, transform: 'translateY(28px) scale(0.98)' },
          { opacity: 1, transform: 'none' },
        ],
        {
          duration: 900,
          delay: 150 + order * 90,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
          fill: 'backwards',
          composite: 'add',
        }
      );
    });
    return () => anims.forEach((a) => a.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      style={{
        opacity,
        transform,
        // Only layers that can be on screen get promoted to their own GPU layer
        willChange: isNear ? 'transform, opacity' : 'auto',
        pointerEvents: isCurrent ? 'auto' : 'none',
        // Incoming scene stays cleanly layered while both are visible
        zIndex: isCurrent ? 20 : 10,
        visibility: isNear ? 'visible' : 'hidden',
      }}
      className={`absolute inset-0 w-full h-[100svh] h-[100dvh] flex flex-col justify-center items-center overflow-hidden ${className}`}
    >
      {/* Reserve space for the fixed navbar so content never slides under it */}
      <div ref={innerRef} className="w-full h-full pt-20 sm:pt-24 pb-4 sm:pb-6">
        {children}
      </div>
    </motion.div>
  );
};