'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollToMoveProps {
  onClick?: () => void;
}

export const ScrollToMove: React.FC<ScrollToMoveProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer text-navy-muted/70 hover:text-brand-600 transition-colors duration-300"
      aria-label="Scroll to discover Bizcore Suite"
    >
      <span className="text-[11px] font-bold tracking-[0.25em] uppercase font-mono group-hover:tracking-[0.3em] transition-all duration-300">
        Scroll to Move
      </span>
      <div className="flex flex-col items-center -space-y-2">
        <ChevronDown className="w-4 h-4 animate-bounce opacity-80" />
        <ChevronDown className="w-4 h-4 opacity-40 -mt-2 animate-pulse" />
      </div>
    </button>
  );
};
