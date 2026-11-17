'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useTransform, Variants } from 'framer-motion';
import { Briefcase, Shield, Users, UserCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { useSceneContext } from '../../context/SceneContext';
import { ROLES_SCENE, dwellProgress, dwellToProgress } from '../../config/sceneLayout';
import { BrowserMockup } from '../ui/BrowserMockup';
import { SectionHeader } from '../ui/SectionHeader';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Roles — the tabs step HEAD → ADMIN → MANAGER → EMPLOYEE as you scroll.
 * The scene stays pinned for a short "dwell" (config/sceneLayout) while the
 * dwell progress (0→1) picks the tab; clicking a tab glides the page to that
 * tab's slot, so scroll and clicks never disagree.
 */
export const Scene04Roles: React.FC = () => {
  const roles = siteConfig.roles;
  const count = roles.length;
  const { scrollYProgress, goToProgress } = useSceneContext();
  const reduce = !!useReducedMotion();

  // 0 → 1 through this scene's dwell
  const dwell = useTransform(scrollYProgress, (p) => dwellProgress(p, ROLES_SCENE));
  const barFill = useTransform(dwell, (t) => `scaleX(${t})`);

  // Active tab follows the scroll position
  const toIndex = (t: number) => Math.min(count - 1, Math.floor(t * count));
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(() => toIndex(dwell.get()));
  useEffect(() => dwell.on('change', (t) => setSelectedRoleIndex(toIndex(t))), [dwell]);

  // Direction for the content crossfade
  const prev = useRef(selectedRoleIndex);
  const direction = selectedRoleIndex >= prev.current ? 1 : -1;
  useEffect(() => {
    prev.current = selectedRoleIndex;
  }, [selectedRoleIndex]);

  // Preload all role images so a tab switch never shows an empty frame
  useEffect(() => {
    roles.forEach((r) => {
      const img = new Image();
      img.src = r.image.src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click → scroll to the middle of that tab's slot
  const selectRole = (idx: number) => goToProgress(dwellToProgress(ROLES_SCENE, (idx + 0.5) / count));

  const currentRole = roles[selectedRoleIndex];
  const roleIcons = [
    <Briefcase key="head" className="w-4 h-4" />,
    <Shield key="admin" className="w-4 h-4" />,
    <Users key="mgr" className="w-4 h-4" />,
    <UserCheck key="emp" className="w-4 h-4" />,
  ];


  // Fast, interruptible swaps — tabs can change every couple of wheel notches
  const swap: Variants = {
    enter: (dir: number) => ({ opacity: 0, transform: `translateY(${reduce ? 0 : 12 * dir}px)` }),
    center: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.26, ease: EASE_OUT } },
    exit: (dir: number) => ({
      opacity: 0,
      transform: `translateY(${reduce ? 0 : -8 * dir}px)`,
      transition: { duration: 0.12, ease: EASE_OUT },
    }),
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <SectionHeader
        badge="GRANULAR PERMISSION ARCHITECTURE"
        title="The Right View for"
        highlightText="Every Role."
        subtitle="One unified platform, tailored specifically for every tier of your organization."
        className="mb-4 sm:mb-5"
      />

      {/* Role tabs — active pill slides; thin bar shows scroll progress through the roles */}
      <div className="relative max-w-2xl w-full mb-5">
        <div
          role="tablist"
          aria-label="Roles"
          className="flex items-center gap-1.5 p-1.5 rounded-full glass-pill border border-white/80 shadow-card-soft w-full justify-between overflow-x-auto"
        >
          {roles.map((role, idx) => {
            const isActive = selectedRoleIndex === idx;
            return (
              <button
                key={role.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => selectRole(idx)}
                className={`relative flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold transition-colors duration-200 select-none ${
                  isActive ? 'text-white' : 'text-navy-muted hover:text-navy-900'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="roles-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-navy-900 to-brand-600 shadow-button"
                    transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0.12 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {roleIcons[idx]}
                  <span>{role.tabLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div aria-hidden="true" className="absolute left-6 right-6 -bottom-2 h-[2px] rounded-full bg-navy-900/[0.06] overflow-hidden">
          <motion.div className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ transform: barFill }} />
        </div>
      </div>

      {/* Two-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
        {/* Left Column: Role Details & 3 Bullet Chips */}
        <div className="lg:col-span-5 grid text-left">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentRole.id}
              custom={direction}
              variants={swap}
              initial="enter"
              animate="center"
              exit="exit"
              className="[grid-area:1/1] flex flex-col"
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 font-mono">
                <span>Role Portal: {currentRole.tabLabel}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-4">
                {currentRole.title}
              </h3>

              <div className="space-y-2.5 mb-6">
                {currentRole.chips.map((chip, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-tint-200/90 shadow-xs"
                  >
                    <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-navy-900">{chip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Browser Frame Mockup */}
        {/* Width capped by viewport height so the mockup never runs off short screens */}
        <div className="lg:col-span-7 relative w-full lg:max-w-[calc((100dvh-470px)*1.78)] lg:ml-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-blue-glow border border-navy-900/10 grid">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentRole.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
                className="[grid-area:1/1]"
              >
                <BrowserMockup
                  imageSrc={currentRole.image.src}
                  imageAlt={currentRole.image.alt}
                  urlPath={`bizcoresuite.internal / portal / ${currentRole.id}`}
                  statusText="RBAC SECURED"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute -bottom-3 -left-3 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-card border border-white shadow-card-soft text-xs font-bold text-navy-900">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Least-Privilege RBAC</span>
          </div>

          <div className="absolute -top-3 -right-2 sm:right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-card border border-white shadow-card-soft text-xs font-bold text-navy-900">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Live Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
