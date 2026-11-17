'use client';

import React from 'react';
import { X, Play, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title = "Bizcore Suite 3-Minute Platform Tour",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-4xl rounded-3xl glass-card overflow-hidden shadow-2xl border border-white/20 bg-navy-900 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-navy-950/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Simulation */}
        <div className="relative aspect-video bg-navy-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-radial-glow opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center max-w-lg">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-navy-900 to-brand-600 flex items-center justify-center shadow-glow mb-6 border border-brand-400/40">
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </div>

            <h4 className="text-xl md:text-2xl font-bold mb-2">
              The Architecture of Infinite Control
            </h4>
            <p className="text-xs md:text-sm text-blue-200/80 mb-6">
              Watch how 500+ enterprises unify their multi-branch HRM, geofenced attendance, 1-click payroll, and omnichannel CRM pipeline.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-blue-200">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Full HD 1080p Walkthrough</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-400" /> Live Branch Demo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

