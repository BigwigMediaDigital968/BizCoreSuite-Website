'use client';

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { siteAssets } from '../../config/assets';

export const Scene02TrustedBy: React.FC = () => {
  const row1Logos = siteAssets.logos.slice(0, 8);
  const row2Logos = siteAssets.logos.slice(8, 16);

  return (
    <div
      id="scene-trusted"
      className="w-full h-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center my-auto w-full">

        {/* Section Heading & Subheading */}
        <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-600 mb-2 font-mono">
          {siteConfig.trustedBy.heading}
        </h3>
        <p className=" scene-display-title text-navy-muted max-w-2xl mb-8">
          <span className='text-gradient-blue'>
            {siteConfig.trustedBy.subheading}
          </span>
        </p>

        {/* Marquee Row 1 (Moving Left) */}
        <div className="relative w-full shrink-0 overflow-hidden py-2 select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max gap-6 animate-[marqueeLeft_35s_linear_infinite] hover:[animation-play-state:paused]">
            {[...row1Logos, ...row1Logos, ...row1Logos].map((logo, idx) => (
              <div
                key={`r1-${idx}`}
                className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-white/70 hover:bg-white border border-tint-200/80 shadow-sm transition-all duration-300 hover:shadow-card-soft hover:scale-105 group"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-8 sm:h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-75 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Moving Right) */}
        <div className="relative w-full shrink-0 overflow-hidden py-2 select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] mt-2">
          <div className="flex w-max gap-6 animate-[marqueeRight_35s_linear_infinite] hover:[animation-play-state:paused]">
            {[...row2Logos, ...row2Logos, ...row2Logos].map((logo, idx) => (
              <div
                key={`r2-${idx}`}
                className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-white/70 hover:bg-white border border-tint-200/80 shadow-sm transition-all duration-300 hover:shadow-card-soft hover:scale-105 group"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-8 sm:h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-75 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Client Avatars & Rating Stars */}
        <div className="mt-8 sm:mt-12 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-3.5 rounded-3xl glass-card border border-tint-200/80 shadow-card-soft">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-3">
            {siteConfig.trustedBy.clientAvatars.map((client, i) => (
              <img
                key={i}
                src={client.avatar}
                alt={client.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
              />
            ))}
          </div>

          {/* Stars & Text */}
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs font-extrabold text-navy-900 ml-1.5">4.9 / 5.0</span>
            </div>
            <p className="text-xs text-navy-muted mt-0.5 font-medium">
              Verified enterprise satisfaction across 500+ businesses
            </p>
          </div>

          {/* SLA badge */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-tint-200 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOC2 Type II & GDPR Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
};
