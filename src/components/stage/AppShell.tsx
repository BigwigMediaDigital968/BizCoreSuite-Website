'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { useMotionValue } from 'framer-motion';
import { useSmoothScroll, SCROLL_TRACK_ID } from '../../hooks/useSmoothScroll';
import { SceneProvider, TOTAL_SCENES } from '../../context/SceneContext';
import { progressToScene, getScrollTrackVh, subscribeLayout } from '../../config/sceneLayout';

/**
 * Client-side shell: Lenis-smoothed scrolling + scene context.
 * Lives here (not in layout.tsx) because it uses hooks, which Server Components can't.
 */
export function AppShell({ children }: { children: ReactNode }) {
  // scrollProgress is updated in the same frame Lenis moves the page (see hook),
  // so layout changes never show a mismatched frame.
  const {
    goTo,
    goToProgress,
    requestDwellCollapse,
    requestDwellLength,
    scrollProgress: scrollYProgress,
  } = useSmoothScroll(TOTAL_SCENES);

  // Fractional scene position through the weighted scroll layout
  // Driven from an effect (not useTransform) — useTransform re-sets its value during
  // render, which notifies SceneProvider's listener mid-render and triggers React's
  // "Cannot update a component while rendering a different component" error.
  const sceneFloat = useMotionValue(0);
  useEffect(() => {
    const sync = (p: number) => sceneFloat.set(progressToScene(p));
    sync(scrollYProgress.get());
    return scrollYProgress.on('change', sync);
  }, [scrollYProgress, sceneFloat]);

  // Track height follows the live layout (a one-time dwell can be removed)
  const trackVh = useSyncExternalStore(subscribeLayout, getScrollTrackVh, getScrollTrackVh);

  return (
    <SceneProvider
      scrollYProgress={scrollYProgress}
      sceneFloat={sceneFloat}
      onGoToScene={goTo}
      onGoToProgress={goToProgress}
      onRequestDwellCollapse={requestDwellCollapse}
      onRequestDwellLength={requestDwellLength}
    >
      {/* Tall scroll track for Lenis — length comes from the scroll layout */}
      <div
        id={SCROLL_TRACK_ID}
        className="relative w-full bg-tint-50 pointer-events-none"
        style={{ height: `${trackVh}vh` }}
      />

      {/* Pinned 100svh / 100dvh fixed stage */}
      {children}
    </SceneProvider>
  );
}
