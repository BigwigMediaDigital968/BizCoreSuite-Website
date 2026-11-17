'use client';

import React from 'react';

interface BackgroundAtmosphereProps {
  /** Driven by SCENES_DATA[].isDark (Security, Final CTA). */
  isDarkScene?: boolean;
  scrollProgress?: number;
}

export const BackgroundAtmosphere: React.FC<BackgroundAtmosphereProps> = ({
  isDarkScene = false,
  scrollProgress = 0,
}) => {

  // Compute parallax positions based on scene index and scroll progress
  const p1 = (scrollProgress * 400) % 600;
  const p2 = (scrollProgress * 550) % 700;
  const p3 = (scrollProgress * 300) % 500;

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Dynamic Background Base Tint */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
          isDarkScene ? 'bg-navy-950 opacity-100' : 'bg-tint-50 opacity-100'
        }`}
      />

      {/* Persistent Morphing Gradient Halo (Center / Right)
          Moves with transform only (GPU-composited). The blur is painted once
          and never re-rasterised; light/dark swap is an opacity crossfade. */}
      <div
        className="absolute rounded-full blur-[110px] will-change-transform transition-transform duration-1000 [transition-timing-function:cubic-bezier(0.77,0,0.175,1)]"
        style={{
          width: '750px',
          height: '750px',
          top: '15%',
          right: '10%',
          transform: `translate3d(${-Math.sin(scrollProgress * Math.PI * 4) * 12}vw, ${-scrollProgress * 15}vh, 0) scale(${1 + Math.sin(scrollProgress * Math.PI * 3) * 0.15})`,
        }}
      >
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-1000 ease-out ${isDarkScene ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'radial-gradient(circle, rgba(91, 140, 255, 0.20) 0%, rgba(228, 236, 253, 0.5) 45%, transparent 75%)' }}
        />
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-1000 ease-out ${isDarkScene ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'radial-gradient(circle, rgba(29, 78, 216, 0.35) 0%, rgba(10, 26, 74, 0.15) 60%, transparent 80%)' }}
        />
      </div>

      {/* Morphing Secondary Ambient Glow (Left / Bottom) */}
      <div
        className="absolute rounded-full blur-[130px] will-change-transform transition-transform duration-1000 [transition-timing-function:cubic-bezier(0.77,0,0.175,1)]"
        style={{
          width: '650px',
          height: '650px',
          top: '40%',
          left: '5%',
          transform: `translate3d(${Math.cos(scrollProgress * Math.PI * 4) * 8}vw, ${scrollProgress * 12}vh, 0)`,
        }}
      >
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-1000 ease-out ${isDarkScene ? 'opacity-0' : 'opacity-100'}`}
          style={{ background: 'radial-gradient(circle, rgba(29, 78, 216, 0.08) 0%, rgba(238, 243, 255, 0.7) 50%, transparent 75%)' }}
        />
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-1000 ease-out ${isDarkScene ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'radial-gradient(circle, rgba(16, 40, 110, 0.4) 0%, transparent 70%)' }}
        />
      </div>

      {/* Floating Micro Particles & Ring Accents with Parallax */}
      <div 
        className="absolute top-[15%] left-[8%] w-4 h-4 rounded-full border border-brand-400/30 opacity-70 transition-transform duration-700 ease-out"
        style={{ transform: `translateY(${-p1}px)` }}
      />
      <div 
        className="absolute top-[35%] right-[12%] w-3 h-3 rounded-full bg-brand-400/25 opacity-60 transition-transform duration-700 ease-out"
        style={{ transform: `translateY(${-p2}px)` }}
      />
      <div 
        className="absolute top-[60%] left-[15%] w-6 h-6 rounded-full border border-brand-600/20 opacity-50 transition-transform duration-700 ease-out"
        style={{ transform: `translateY(${-p3}px)` }}
      />
      <div 
        className="absolute top-[80%] right-[20%] w-3.5 h-3.5 rounded-full bg-brand-600/20 opacity-60 transition-transform duration-700 ease-out"
        style={{ transform: `translateY(${-p1 * 0.7}px)` }}
      />

      {/* Subtle Star Sparkle SVG */}
      <svg 
        className="absolute top-[28%] left-[22%] w-6 h-6 text-brand-400/40 animate-pulse-slow transition-transform duration-700 ease-out" 
        style={{ transform: `translateY(${-p2 * 0.5}px)` }}
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      <svg 
        className="absolute top-[72%] right-[8%] w-5 h-5 text-brand-500/35 animate-pulse-slow transition-transform duration-700 ease-out" 
        style={{ transform: `translateY(${-p1 * 0.6}px)` }}
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      {/* Thin curved vector arrow floating in background */}
      <svg 
        className="absolute top-[48%] right-[5%] w-24 h-24 text-brand-400/20 hidden md:block transition-transform duration-700 ease-out" 
        style={{ transform: `translateY(${-p3 * 0.8}px) rotate(${scrollProgress * 90}deg)` }}
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      >
        <path d="M10 80 Q 50 10, 90 50" strokeDasharray="4 4"/>
        <path d="M85 45 L 90 50 L 85 55"/>
      </svg>
    </div>
  );
};
