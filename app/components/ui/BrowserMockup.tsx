'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Activity } from 'lucide-react';

interface BrowserMockupProps {
  imageSrc?: string;
  imageAlt?: string;
  urlPath?: string;
  className?: string;
  children?: React.ReactNode;
  blurDataURL?: string;
  statusText?: string;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  imageSrc,
  imageAlt = "Bizcore Suite Dashboard Mockup",
  urlPath = "bizcoresuite.internal / dashboard",
  className = "",
  children,
  blurDataURL,
  statusText = "LIVE 99.99% UP",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden glass-card shadow-blue-glow border border-navy-900/10 transition-all duration-500 ${className}`}>
      {/* Browser Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-tint-50/90 border-b border-tint-100/80 backdrop-blur-md select-none">
        {/* Left window control dots */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner" />
        </div>

        {/* Address bar mockup */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-tint-200/80 text-[11px] md:text-xs text-navy-muted font-medium w-6/12 max-w-sm justify-center shadow-inner">
          <Lock className="w-3 h-3 text-brand-600 shrink-0" />
          <span className="truncate">{urlPath}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] md:text-[11px] font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline font-mono">{statusText}</span>
        </div>
      </div>

      {/* Browser Viewport Canvas */}
      <div className="relative w-full aspect-video bg-white overflow-hidden">
        {imageSrc ? (
          <div className="relative w-full h-full">
            {/* Blur-up placeholder while loading */}
            {blurDataURL && !imageLoaded && (
              <img
                src={blurDataURL}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
              />
            )}
            <img
              src={imageSrc}
              alt={imageAlt}
              loading="lazy"
              width={1280}
              height={720}
              onLoad={() => setImageLoaded(true)}
              // 16:9 frame; the image is shown whole and unaltered (no cropping).
              className={`w-full h-full object-contain transition-opacity duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

