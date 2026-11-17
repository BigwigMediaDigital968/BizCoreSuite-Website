'use client';

import React, { useState } from 'react';
import { useSceneContext, sceneIndexOf } from '../../context/SceneContext';
import { platformModules } from '../../config/modules';

// Scene positions by id — never hard-code numbers (adding a scene shifts them)
const S = {
  hero: sceneIndexOf('hero'),
  trusted: sceneIndexOf('trusted'),
  impact: sceneIndexOf('impact'),
  roles: sceneIndexOf('roles'),
  overview: sceneIndexOf('overview'),
  comparison: sceneIndexOf('comparison'),
  security: sceneIndexOf('security'),
  testimonials: sceneIndexOf('testimonials'),
  pricing: sceneIndexOf('pricing'),
  pricingMatrix: sceneIndexOf('pricing-matrix'),
  finalCta: sceneIndexOf('final-cta'),
};

// Global UI Components
import { Navbar } from '../ui/Navbar';
import { ScrollProgressBar } from '../ui/ScrollProgressBar';
import { SceneNavDots } from '../ui/SceneNavDots';
import { BackgroundAtmosphere } from '../ui/BackgroundAtmosphere';
import { CursorGlow } from '../ui/CursorGlow';
import { VideoModal } from '../ui/VideoModal';

// Scene Wrapper
import { SceneWrapper } from './SceneWrapper';

// 19 Scenes
import { Scene01Hero } from '../scenes/Scene01Hero';
import { Scene02TrustedBy } from '../scenes/Scene02TrustedBy';
import { Scene03ImpactStats } from '../scenes/Scene03ImpactStats';
import { Scene04Roles } from '../scenes/Scene04Roles';
import { ModulesScene } from '../scenes/ModuleScene';
import { MODULE_SCENE_OFFSET, MODULE_SCENE_LAST } from '../../config/sceneLayout';
import { Scene15Overview } from '../scenes/Scene15Overview';
import { Scene16Comparison } from '../scenes/Scene16Comparison';
import { Scene17Security } from '../scenes/Scene17Security';
import { Scene18Testimonials } from '../scenes/Scene18Testimonials';
import { ScenePricing } from '../scenes/ScenePricing';
import { ScenePricingMatrix } from '../scenes/ScenePricingMatrix';
import { Scene19FinalCTA } from '../scenes/Scene19FinalCTA';

export const Stage: React.FC = () => {
  const { scrollYProgress, activeIndex, totalScenes, goToScene, isDarkScene } = useSceneContext();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-[100svh] h-[100dvh] overflow-hidden bg-tint-50 text-navy-text">
      
      {/* Circular scroll progress (bottom-left) — click to return to top */}
      <ScrollProgressBar progress={scrollYProgress} onClick={() => goToScene(S.hero)} />

      {/* Floating Glass Pill Navbar */}
      <Navbar
        activeSceneIndex={activeIndex}
        onSelectScene={goToScene}
        onOpenDemo={() => goToScene(S.finalCta)}
      />

      {/* Vertical Scene Progress Dot Navigation (Desktop) */}
      <SceneNavDots
        activeSceneIndex={activeIndex}
        onSelectScene={goToScene}
      />

      {/* Persistent Morphing Background Atmosphere (Halo, glowing rings, drifting particles) */}
      <BackgroundAtmosphere
        isDarkScene={isDarkScene}
        scrollProgress={activeIndex / (totalScenes - 1)}
      />

      {/* Soft Desktop Cursor Glow */}
      <CursorGlow />

      {/* Video Presentation Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      {/* All 19 Pinned Scenes Stacked at Absolute Inset-0 */}
      <div className="relative w-full h-full">
        
        {/* Scene 1: Hero */}
        <SceneWrapper index={S.hero} transitionType="fade" intro>
          <Scene01Hero
            onOpenVideo={() => setVideoModalOpen(true)}
            onOpenDemo={() => goToScene(S.finalCta)}
            onExplore={() => goToScene(S.trusted)}
          />
        </SceneWrapper>

        {/* Scene 2: Trusted By */}
        <SceneWrapper index={S.trusted} transitionType="slide-up">
          <Scene02TrustedBy />
        </SceneWrapper>

        {/* Scene 3: Impact Stats */}
        <SceneWrapper index={S.impact} transitionType="zoom-in">
          <Scene03ImpactStats />
        </SceneWrapper>

        {/* Scene 4: Roles */}
        <SceneWrapper index={S.roles} transitionType="slide-up">
          <Scene04Roles />
        </SceneWrapper>

        {/* Scenes 5–14: one pinned Modules section; content swaps per scroll step */}
        <SceneWrapper
          index={MODULE_SCENE_OFFSET}
          endIndex={MODULE_SCENE_LAST}
          transitionType="slide-up"
        >
          <ModulesScene onJumpToModule={goToScene} />
        </SceneWrapper>

        {/* Scene 15: All-in-One Overview (Hub & Spoke) */}
        <SceneWrapper index={S.overview} transitionType="scale-blur">
          <Scene15Overview />
        </SceneWrapper>

        {/* Without vs With Bizcore */}
        <SceneWrapper index={S.comparison} transitionType="horizontal">
          <Scene16Comparison />
        </SceneWrapper>

        {/* Security & Reliability */}
        <SceneWrapper index={S.security} transitionType="scale-blur">
          <Scene17Security />
        </SceneWrapper>

        {/* Testimonials */}
        <SceneWrapper index={S.testimonials} transitionType="slide-up">
          <Scene18Testimonials />
        </SceneWrapper>

        {/* Pricing plans */}
        <SceneWrapper index={S.pricing} transitionType="slide-up">
          <ScenePricing
            onSelectPlan={() => goToScene(S.finalCta)}
            onCompareAll={() => goToScene(S.pricingMatrix)}
          />
        </SceneWrapper>

        {/* Pricing feature matrix */}
        <SceneWrapper index={S.pricingMatrix} transitionType="slide-up">
          <ScenePricingMatrix />
        </SceneWrapper>

        {/* Final CTA & Compact Footer */}
        <SceneWrapper index={S.finalCta} transitionType="fade">
          <Scene19FinalCTA onScrollToTop={() => goToScene(0)} />
        </SceneWrapper>

      </div>

      {/* Visually hidden plain text for SEO & Screen Readers */}
      <div className="sr-only">
        <h1>Bizcore Suite — AI-Powered All-in-One HRM + CRM Platform</h1>
        <p>Unify people, sales, payroll and performance in one intelligent workspace.</p>
        <h2>Platform Modules:</h2>
        <ul>
          {platformModules.map((m) => (
            <li key={m.id}>
              <h3>{m.title}</h3>
              <p>{m.oneLiner}</p>
              <p>Key features: {m.chips.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
