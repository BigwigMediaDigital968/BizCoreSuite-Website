'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import Lenis from 'lenis';
import {
  progressToScene,
  sceneToProgress,
  getTotalScrollUnits,
  getScrollTrackVh,
  getDwellExtent,
  setDwell,
} from '../config/sceneLayout';

/** id of the tall scroll-track element rendered by App */
export const SCROLL_TRACK_ID = 'scroll-track';

/**
 * Free, momentum-smoothed scrolling (Lenis). No snapping — every element is
 * scrubbed to the scroll position, so the page moves exactly as far as the
 * user scrolls (bol7-style).
 *
 * Programmatic jumps (navbar, dots, arrow keys) glide with an ease-in-out.
 */

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function useSmoothScroll(total: number) {
  const lenisRef = useRef<Lenis | null>(null);

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const currentProgress = () => {
    const m = maxScroll();
    return m > 0 ? window.scrollY / m : 0;
  };

  // Page scroll progress (0–1), updated in the SAME frame Lenis moves the page
  // (and synchronously after layout changes). Framer's useScroll measures page
  // height asynchronously, which produced a one-frame mismatch when the layout
  // changed — this keeps scroll position and layout always consistent.
  const scrollProgress = useMotionValue(0);
  const syncProgress = () => scrollProgress.set(currentProgress());
  const currentFloatIndex = () => progressToScene(currentProgress());

  /** Glide to an exact page progress (0–1) — used for in-section steps like Roles tabs. */
  // `immediate` = jump with no glide (e.g. while dragging a slider that is bound to scroll)
  const goToProgress = useCallback((targetP: number, opts?: { immediate?: boolean }) => {
    const y = Math.min(1, Math.max(0, targetP)) * maxScroll();
    const viewports = Math.abs(targetP - currentProgress()) * getTotalScrollUnits();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const immediate = reduce || !!opts?.immediate;
    const lenis = lenisRef.current;
    if (!lenis) {
      window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
      return;
    }
    lenis.scrollTo(y, {
      immediate,
      duration: Math.min(1.8, 0.45 + viewports * 0.45),
      easing: easeInOutCubic,
      force: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const idx = Math.min(total - 1, Math.max(0, i));
      const targetP = sceneToProgress(idx);
      const y = targetP * maxScroll();
      // Duration follows real scroll distance (in viewports): a module step on
      // the rail (0.4 vp) glides quickly, a full scene ~0.9s, long jumps cap at 1.8s.
      const viewports = Math.abs(targetP - currentProgress()) * getTotalScrollUnits();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const lenis = lenisRef.current;
      if (!lenis) {
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      lenis.scrollTo(y, {
        immediate: reduce,
        duration: Math.min(1.8, 0.45 + viewports * 0.45),
        easing: easeInOutCubic,
        force: true,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total]
  );

  // ── Runtime dwell changes ─────────────────────────────────────────────
  // A scene can ask for its dwell to change length: Comparison removes its
  // dwell once played; Pricing sizes its dwell to its content overflow.
  // Applied only while the page is at rest and the viewport is outside that
  // dwell, and the scroll position is shifted by exactly the difference — so
  // nothing on screen moves.
  const pendingDwell = useRef<Map<number, number>>(new Map());
  const requestDwellLength = useCallback((i: number, len: number) => {
    pendingDwell.current.set(i, Math.max(0, len));
  }, []);
  const requestDwellCollapse = useCallback((i: number) => requestDwellLength(i, 0), [requestDwellLength]);

  const tryApplyDwellChanges = (lenis: Lenis) => {
    if (!pendingDwell.current.size || lenis.isScrolling) return;
    const vh = window.innerHeight;
    for (const [i, nextLen] of [...pendingDwell.current]) {
      const [start, end, len] = getDwellExtent(i);
      if (Math.abs(nextLen - len) < 0.001) {
        pendingDwell.current.delete(i);
        continue;
      }
      const y = window.scrollY;
      const past = y >= end * vh - 1;
      const before = y <= start * vh + 1;
      if (!past && !before) continue; // inside the dwell — wait

      setDwell(i, nextLen);
      pendingDwell.current.delete(i);
      const track = document.getElementById(SCROLL_TRACK_ID);
      if (track) track.style.height = `${getScrollTrackVh()}vh`;
      const newY = past ? y + (nextLen - len) * vh : y;
      window.scrollTo(0, newY);
      lenis.resize();
      lenis.scrollTo(newY, { immediate: true, force: true });
      // Same frame: new layout + new scroll position → identical scene on screen
      syncProgress();
    }
  };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      // lerp: how quickly the page catches up to the wheel — lower = silkier glide
      lerp: reduce ? 1 : 0.085,
      smoothWheel: !reduce,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    syncProgress();
    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      tryApplyDwellChanges(lenis);
      syncProgress(); // no-op when unchanged
      rafId = requestAnimationFrame(raf);
    });
    // Native scrolls Lenis doesn't animate (scrollbar drag, find-in-page) and resizes
    const onNative = () => syncProgress();
    window.addEventListener('scroll', onNative, { passive: true });
    window.addEventListener('resize', onNative);

    // Keyboard: step to the previous / next section with a glide
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      const cur = Math.round(currentFloatIndex());
      let next: number | null = null;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) next = cur + 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) next = cur - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = total - 1;
      if (next === null) return;
      e.preventDefault();
      goTo(next);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onNative);
      window.removeEventListener('resize', onNative);
      window.removeEventListener('keydown', onKeyDown);
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goTo, total]);

  return { goTo, goToProgress, requestDwellCollapse, requestDwellLength, scrollProgress };
}
