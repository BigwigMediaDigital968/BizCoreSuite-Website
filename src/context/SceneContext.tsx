'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionValue } from 'framer-motion';

export interface SceneMeta {
  id: string;
  label: string;
  navKey?: string;
  isDark?: boolean;
}

export const SCENES_DATA: SceneMeta[] = [
  { id: 'hero', label: 'Hero Overview', navKey: 'Home' },
  { id: 'trusted', label: 'Trusted By' },
  { id: 'impact', label: 'Impact Metrics' },
  { id: 'roles', label: 'Role-Based Access', navKey: 'Roles' },
  { id: 'mod-branch', label: 'Branch Management', navKey: 'Modules' },
  { id: 'mod-employee', label: 'Employee Lifecycle' },
  { id: 'mod-attendance', label: 'Smart Attendance' },
  { id: 'mod-salary', label: '1-Click Payroll' },
  { id: 'mod-leave', label: 'Leave Governance' },
  { id: 'mod-task', label: 'Task Velocity' },
  { id: 'mod-revenue', label: 'Revenue Intel' },
  { id: 'mod-lead', label: 'Omnichannel Leads' },
  { id: 'mod-analytics', label: 'Executive BI' },
  { id: 'mod-activity', label: 'Activity Logs' },
  { id: 'overview', label: 'All-in-One Suite' },
  { id: 'comparison', label: 'Before & After' },
  { id: 'security', label: 'Enterprise Security' },
  { id: 'testimonials', label: 'Executive Proof' },
  { id: 'pricing', label: 'Pricing Plans', navKey: 'Pricing' },
  { id: 'pricing-matrix', label: 'Feature Matrix' },
  { id: 'final-cta', label: 'Book a Demo', navKey: 'Contact' },
];

export const TOTAL_SCENES = SCENES_DATA.length;

/** Scene index by id — use this instead of hard-coded numbers so adding a scene never breaks links. */
export const sceneIndexOf = (id: string): number => {
  const i = SCENES_DATA.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`Unknown scene id: ${id}`);
  return i;
};

interface SceneContextType {
  scrollYProgress: MotionValue<number>;
  /** Fractional scene position (0 … TOTAL_SCENES-1). Use this — not scrollYProgress — for scene math. */
  sceneFloat: MotionValue<number>;
  activeIndex: number;
  totalScenes: number;
  scenes: SceneMeta[];
  goToScene: (index: number) => void;
  /** Glide to an exact page progress (0–1), e.g. a specific Roles tab. */
  goToProgress: (progress: number, opts?: { immediate?: boolean }) => void;
  /** Remove a scene's scroll dwell once it has played (applied invisibly when the page is at rest). */
  requestDwellCollapse: (sceneIndex: number) => void;
  /** Set a scene's scroll dwell length in viewports (applied invisibly when the page is at rest). */
  requestDwellLength: (sceneIndex: number, viewports: number) => void;
  isDarkScene: boolean;
}

const SceneContext = createContext<SceneContextType | null>(null);

export const useSceneContext = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error('useSceneContext must be used within a SceneProvider');
  }
  return ctx;
};

interface SceneProviderProps {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  sceneFloat: MotionValue<number>;
  onGoToScene: (index: number) => void;
  onGoToProgress: (progress: number, opts?: { immediate?: boolean }) => void;
  onRequestDwellCollapse: (sceneIndex: number) => void;
  onRequestDwellLength: (sceneIndex: number, viewports: number) => void;
}

export const SceneProvider: React.FC<SceneProviderProps> = ({
  children,
  scrollYProgress,
  sceneFloat,
  onGoToScene,
  onGoToProgress,
  onRequestDwellCollapse,
  onRequestDwellLength,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const update = (s: number) =>
      setActiveIndex(Math.min(TOTAL_SCENES - 1, Math.max(0, Math.round(s))));
    update(sceneFloat.get());
    return sceneFloat.on('change', update);
  }, [sceneFloat]);

  const currentScene = SCENES_DATA[activeIndex] || SCENES_DATA[0];
  const isDarkScene = !!currentScene.isDark;

  return (
    <SceneContext.Provider
      value={{
        scrollYProgress,
        sceneFloat,
        activeIndex,
        totalScenes: TOTAL_SCENES,
        scenes: SCENES_DATA,
        goToScene: onGoToScene,
        goToProgress: onGoToProgress,
        requestDwellCollapse: onRequestDwellCollapse,
        requestDwellLength: onRequestDwellLength,
        isDarkScene,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
};

