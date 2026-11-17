'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, Users, Flame, DollarSign, Clock, BarChart3, Building2, 
  TrendingUp, Cpu, ShieldCheck, Activity, Play, ArrowRight 
} from 'lucide-react';
import { siteConfig } from '../../config/site';
import { siteAssets } from '../../config/assets';
import { GradientButton } from '../ui/GradientButton';
import { ScrollToMove } from '../ui/ScrollToMove';
import { scrollFx } from '../../utils/scrollFx';

// Copy lines leave left, one after another, as the hero scrolls away
const copyOut = (i: number) => ({
  ...scrollFx({ exit: { x: -90, o: 0 }, exitRange: [0.02 + i * 0.045, 0.45 + i * 0.045] }),
  'data-intro': String(i),
});

// Floating chips drift outward + tilt as the visual grows (bol7-style spread)
const spread = (x: number, y: number, r: number) =>
  scrollFx({ exit: { x, y, r }, exitRange: [0, 0.8] });

interface Scene01HeroProps {
  onOpenVideo?: () => void;
  onOpenDemo?: () => void;
  onExplore?: () => void;
}

export const Scene01Hero: React.FC<Scene01HeroProps> = ({ 
  onOpenVideo, 
  onOpenDemo,
  onExplore 
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users className="w-3.5 h-3.5 text-brand-600" />,
    Flame: <Flame className="w-3.5 h-3.5 text-amber-500" />,
    DollarSign: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
    Clock: <Clock className="w-3.5 h-3.5 text-blue-500" />,
    Zap: <Zap className="w-3.5 h-3.5 text-brand-500" />,
    BarChart3: <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />,
    Building2: <Building2 className="w-3.5 h-3.5 text-navy-800" />,
  };

  // On desktop the visual glides to the centre of the screen as you scroll
  // Read after mount so server and first client render match (no hydration mismatch)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div
      id="scene-hero"
      data-scroll-manual
      className="w-full h-full flex flex-col justify-between pb-2 px-4 sm:px-6 md:px-12 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-7xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        {/* Left Column: Eyebrow, Two-Line Headline, Subtext, Action Buttons */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 text-left">
          
          {/* Eyebrow Badge */}
          {/* <div {...copyOut(0)} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tint-100/90 border border-brand-600/20 text-brand-700 text-xs font-bold tracking-wider uppercase mb-5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-brand-600 fill-brand-600 animate-pulse" />
            <span>{siteConfig.hero.badge}</span>
          </div> */}

          {/* Two-Line Headline */}
          <h1 {...copyOut(1)} className="hero-display-title text-navy-900 mb-5">
            <span>{siteConfig.hero.headlineLine1}</span>
            <br />
            <span className="text-gradient-blue">{siteConfig.hero.headlineLine2}</span>
          </h1>

          {/* Subtext */}
          <p {...copyOut(2)} className="section-subtitle text-navy-muted max-w-xl font-normal mb-7">
            {siteConfig.hero.subtext}
          </p>

          {/* Buttons: Explore Suite & View Presentation */}
          <div {...copyOut(3)} className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <GradientButton
              size="lg"
              onClick={onExplore}
              showArrow
            >
              {siteConfig.hero.primaryCta}
            </GradientButton>

            <button
              onClick={onOpenVideo}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-white/90 hover:bg-white text-navy-900 font-semibold text-sm border border-tint-200/90 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>{siteConfig.hero.secondaryCta}</span>
            </button>
          </div>

          {/* Trust snippet under buttons */}
          <div {...copyOut(4)} className="mt-7 flex items-center gap-3 text-xs text-navy-muted/80">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">SJ</div>
              <div className="w-7 h-7 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">DC</div>
              <div className="w-7 h-7 rounded-full bg-brand-400 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">AM</div>
            </div>
            <span>Trusted by 500+ enterprises • Rated 4.9/5</span>
          </div>
        </div>

        {/* Right Column: Circular Halo, Rings, Dashboard/Hero Image, Floating Chips, Stat Badges */}
        <div
          data-intro="2"
          {...scrollFx({ exit: { x: isDesktop ? '-21vw' : 0, y: isDesktop ? 0 : -40, s: 1.18 }, exitRange: [0, 0.9] })}
          className="lg:col-span-5 relative flex items-center justify-center w-full min-h-[360px] sm:min-h-[460px]"
        >

          {/* Concentric Soft Blue Rings Gently Pulsing */}
          <div
            {...scrollFx({ exit: { s: 1.35 }, exitRange: [0, 0.9] })}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Outer Ring */}
            <div className="w-[320px] sm:w-[440px] lg:w-[500px] h-[320px] sm:h-[440px] lg:h-[500px] rounded-full border border-brand-400/25 animate-pulse-slow" />
            {/* Middle Ring */}
            <div className="absolute w-[260px] sm:w-[360px] lg:w-[410px] h-[260px] sm:h-[360px] lg:h-[410px] rounded-full border border-brand-400/35" />
            {/* Inner Ring */}
            <div className="absolute w-[200px] sm:w-[280px] lg:w-[320px] h-[200px] sm:h-[280px] lg:h-[320px] rounded-full border border-brand-400/45 shadow-[0_0_35px_rgba(91,140,255,0.25)]" />
          </div>

          {/* Central Halo Glow */}
          <div className="absolute w-[260px] sm:w-[360px] h-[260px] sm:h-[360px] rounded-full bg-gradient-to-tr from-brand-400/20 via-tint-100 to-transparent blur-2xl pointer-events-none" />

          {/* Center Image / Mockup Presentation */}
          <div className="relative z-10 w-[250px] sm:w-[340px] lg:w-[380px] rounded-2xl sm:rounded-3xl overflow-hidden glass-card shadow-blue-glow border border-white/80 p-2 sm:p-3 transition-transform duration-500 hover:scale-[1.02]">
            <img 
              src={siteAssets.hero.dashboard.src} 
              alt={siteAssets.hero.dashboard.alt}
              width={1280}
              height={720}
              loading="eager"
              className="w-full h-auto rounded-xl sm:rounded-2xl shadow-inner object-cover"
            />
          </div>

          {/* Floating Chips Bobbing Around the Halo */}
          {/* Chip 1: HRM */}
          <div {...spread(-90, -50, -8)} className="absolute -top-3 sm:top-2 left-4 sm:left-0 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-tint-200/90 shadow-floatingPill animate-float-slow text-xs font-semibold text-navy-900">
            {iconMap["Users"]}
            <span>HRM & People</span>
          </div>

          {/* Chip 2: CRM */}
          <div {...spread(110, -30, 7)} className="absolute top-12 sm:top-16 -right-2 sm:-right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-tint-200/90 shadow-floatingPill animate-float-medium [animation-delay:1s] text-xs font-semibold text-navy-900">
            {iconMap["Flame"]}
            <span>CRM & Leads</span>
          </div>

          {/* Chip 3: Payroll */}
          <div {...spread(-110, 40, 6)} className="absolute bottom-14 sm:bottom-18 -left-3 sm:-left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-tint-200/90 shadow-floatingPill animate-float-fast [animation-delay:2s] text-xs font-semibold text-navy-900">
            {iconMap["DollarSign"]}
            <span>Auto Payroll</span>
          </div>

          {/* Chip 4: Attendance */}
          <div {...spread(90, 70, -6)} className="absolute -bottom-3 sm:bottom-3 right-2 sm:right-0 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-tint-200/90 shadow-floatingPill animate-float-slow [animation-delay:1.5s] text-xs font-semibold text-navy-900">
            {iconMap["Clock"]}
            <span>Geo Attendance</span>
          </div>

          {/* 4 Floating Stat Badges */}
          <div {...spread(70, -90, 5)} className="absolute -top-8 sm:-top-6 right-8 z-20 hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card border border-white/90 shadow-card-soft animate-float-medium">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-navy-900">+247%</div>
              <div className="text-[10px] text-navy-muted">Conversion Rate</div>
            </div>
          </div>

          <div {...spread(-80, 90, -5)} className="absolute bottom-6 left-8 z-20 hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card border border-white/90 shadow-card-soft animate-float-slow [animation-delay:0.8s]">
            <div className="w-7 h-7 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-navy-900">24,500+</div>
              <div className="text-[10px] text-navy-muted">AI Automations / Day</div>
            </div>
          </div>

          <div {...spread(140, 10, 8)} className="absolute top-1/2 -right-8 z-20 hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card border border-white/90 shadow-card-soft animate-float-medium [animation-delay:2.2s]">
            <div className="w-7 h-7 rounded-xl bg-navy-100 flex items-center justify-center text-navy-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-navy-900">48.2K+</div>
              <div className="text-[10px] text-navy-muted">Active Employees</div>
            </div>
          </div>

          <div {...spread(-140, -10, -7)} className="absolute top-1/3 -left-8 z-20 hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-card border border-white/90 shadow-card-soft animate-float-slow [animation-delay:1.8s]">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-navy-900">99.99%</div>
              <div className="text-[10px] text-navy-muted">Real-Time Uptime</div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Center: Scroll to Move Indicator */}
      <div
        data-intro="6"
        {...scrollFx({ exit: { y: 30, o: 0 }, exitRange: [0, 0.2] })}
        className="mt-4 flex justify-center w-full z-10"
      >
        <ScrollToMove onClick={onExplore} />
      </div>
    </div>
  );
};
