'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, Twitter, Linkedin, Github } from 'lucide-react';
import { siteConfig } from '../../config/site';

interface SiteFooterProps {
  /** Home page passes a scene jump; other pages fall back to a smooth window scroll. */
  onScrollToTop?: () => void;
  className?: string;
}

/** The landing page's compact footer bar — shared by the final scene and the blog. */
export const SiteFooter: React.FC<SiteFooterProps> = ({ onScrollToTop, className = '' }) => {
  const toTop = () => {
    if (onScrollToTop) return onScrollToTop();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className={`pt-6 border-t border-navy-900/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-navy-muted ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-navy-900 text-xs">Bizcore Suite.</span>
        <span>{siteConfig.finalCta.footerText}</span>
      </div>

      {/* Blog link, social icons & back to top */}
      <div className="flex items-center gap-3">
        <Link href="/blogs" className="px-2.5 py-1 rounded-full bg-white/80 border border-tint-200 hover:bg-white hover:text-brand-600 text-navy-900 transition-colors text-[11px] font-semibold">
          Blog
        </Link>
        <a href="#" className="p-1.5 rounded-full bg-white/80 border border-tint-200 hover:bg-white hover:text-brand-600 text-navy-muted transition-colors" aria-label="Twitter">
          <Twitter className="w-3.5 h-3.5" />
        </a>
        <a href="#" className="p-1.5 rounded-full bg-white/80 border border-tint-200 hover:bg-white hover:text-brand-600 text-navy-muted transition-colors" aria-label="LinkedIn">
          <Linkedin className="w-3.5 h-3.5" />
        </a>
        <a href="#" className="p-1.5 rounded-full bg-white/80 border border-tint-200 hover:bg-white hover:text-brand-600 text-navy-muted transition-colors" aria-label="GitHub">
          <Github className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={toTop}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-tint-200 hover:bg-white text-navy-900 transition-colors text-[11px]"
          aria-label="Back to top"
        >
          <span>Top</span>
          <ArrowUp className="w-3 h-3 text-brand-600" />
        </button>
      </div>
    </div>
  );
};
