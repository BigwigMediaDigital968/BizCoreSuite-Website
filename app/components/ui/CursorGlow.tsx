'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

/**
 * Desktop cursor glow + ring.
 * Position lives in motion values (no React re-render per mousemove) and is
 * applied via transform only — never left/top — so it never triggers layout.
 */
export const CursorGlow: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  // The large glow trails slightly; the ring tracks tightly.
  const gx = useSpring(mx, { stiffness: 300, damping: 40, mass: 0.6 });
  const gy = useSpring(my, { stiffness: 300, damping: 40, mass: 0.6 });

  const glowTransform = useMotionTemplate`translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
  const ringTransform = useMotionTemplate`translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;

  useEffect(() => {
    // Only on devices with a real hovering pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);

    let lastPointer = false;
    let shown = false;

    const onMouseMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!shown) {
        shown = true;
        setIsVisible(true);
      }
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest('button, a, input, select, textarea, [role="button"]');
      if (interactive !== lastPointer) {
        lastPointer = interactive;
        setIsPointer(interactive);
      }
    };

    const onMouseLeave = () => {
      shown = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [mx, my]);

  if (!enabled) return null;

  return (
    <>
      {/* Soft Ambient Radial Cursor Glow (gradient already soft — no extra blur filter needed) */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-30 rounded-full will-change-transform"
        style={{
          width: 350,
          height: 350,
          transform: glowTransform,
          opacity: isVisible ? 1 : 0,
          background:
            'radial-gradient(circle, rgba(91, 140, 255, 0.14) 0%, rgba(29, 78, 216, 0.04) 45%, transparent 70%)',
        }}
      />
      {/* Small Precision Cursor Ring */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform"
        style={{ transform: ringTransform, opacity: isVisible ? 1 : 0 }}
      >
        <div
          className="w-11 h-11 rounded-full border border-brand-400/50 transition-[transform,background-color] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]"
          style={{
            transform: `scale(${isPointer ? 1 : 0.55})`,
            backgroundColor: isPointer ? 'rgba(91, 140, 255, 0.12)' : 'transparent',
          }}
        />
      </motion.div>
    </>
  );
};
