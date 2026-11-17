'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { scenesList } from './SceneNavDots';

interface SceneControllerBarProps {
  activeSceneIndex: number;
  totalScenes: number;
  onPrev: () => void;
  onNext: () => void;
}

export const SceneControllerBar: React.FC<SceneControllerBarProps> = ({
  activeSceneIndex,
  totalScenes,
  onPrev,
  onNext,
}) => {
  const currentScene = scenesList[activeSceneIndex] || scenesList[0];
  const isFirst = activeSceneIndex === 0;
  const isLast = activeSceneIndex === totalScenes - 1;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none">
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-white/80 shadow-floatingPill pointer-events-auto transition-all duration-300">
        
        {/* Prev Button */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            isFirst 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white text-navy-900 hover:scale-110 active:scale-90 shadow-xs'
          }`}
          aria-label="Previous scene"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Scene Info */}
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-navy-900">
          <span className="font-mono text-brand-600 font-bold">
            {currentScene.index}
          </span>
          <span className="text-navy-muted/60">/</span>
          <span className="font-mono text-navy-muted text-[11px]">
            {String(totalScenes).padStart(2, '0')}
          </span>
          <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span className="hidden md:inline-block text-navy-text tracking-tight font-medium text-[11px] truncate max-w-[140px]">
            {currentScene.label}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={isLast}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            isLast 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white text-navy-900 hover:scale-110 active:scale-90 shadow-xs'
          }`}
          aria-label="Next scene"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Hint */}
      <span className="hidden lg:block text-[9px] font-mono uppercase tracking-widest text-navy-muted/60 mt-1">
        Scroll or use ↑ ↓ keys
      </span>
    </div>
  );
};

