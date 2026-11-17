'use client';

import React, { useState } from 'react';
import { SCENES_DATA } from '../../context/SceneContext';

// Single source of truth: the same scene list that drives scroll + activeIndex.
export const scenesList = SCENES_DATA.map((s, i) => ({
  id: s.id,
  label: s.label,
  index: String(i + 1).padStart(2, '0'),
}));

interface SceneNavDotsProps {
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
}

export const SceneNavDots: React.FC<SceneNavDotsProps> = ({
  activeSceneIndex,
  onSelectScene,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <nav 
      aria-label="Scene progress navigation"
      className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-1.5 py-3 px-2 rounded-full glass-pill border border-white/80 shadow-floatingPill transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {scenesList.map((scene, idx) => {
        const isActive = activeSceneIndex === idx;
        return (
          <button
            key={scene.id}
            onClick={() => onSelectScene(idx)}
            aria-label={`Jump to ${scene.label}`}
            className="group relative flex items-center justify-center p-1 focus:outline-none"
          >
            {/* Tooltip on left */}
            <div 
              className={`absolute right-7 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 pointer-events-none shadow-md ${
                isHovered
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2'
              } ${
                isActive 
                  ? 'bg-navy-900 text-white shadow-brand-600/30' 
                  : 'bg-white/95 text-navy-900 border border-tint-200'
              }`}
            >
              <span className="text-[10px] opacity-60 mr-1.5 font-mono">{scene.index}</span>
              {scene.label}
            </div>

            {/* Dot Indicator */}
            <div 
              className={`rounded-full transition-all duration-300 ${
                isActive 
                  ? 'w-2.5 h-5 bg-gradient-to-b from-navy-900 to-brand-600 shadow-[0_0_10px_rgba(29,78,216,0.6)]' 
                  : 'w-2 h-2 bg-navy-900/25 group-hover:bg-brand-600/60 group-hover:scale-125'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
