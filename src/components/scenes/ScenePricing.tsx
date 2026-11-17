'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { useSceneContext } from '../../context/SceneContext';
import { PRICING_SCENE, dwellProgress } from '../../config/sceneLayout';
import { SectionHeader } from '../ui/SectionHeader';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface ScenePricingProps {
  onSelectPlan?: () => void;
  onCompareAll?: () => void;
}

/**
 * Pricing — three roomy plan cards with the full feature list and a
 * Monthly / Annual segmented toggle.
 *
 * The content is allowed to be taller than the screen: we measure how much it
 * overflows, give the scene a scroll dwell of exactly that length, and move the
 * content up 1:1 with the page scroll — so you read down through the cards,
 * then the page moves on. If it fits, it simply stays centred (no dwell).
 */
export const ScenePricing: React.FC<ScenePricingProps> = ({ onSelectPlan, onCompareAll }) => {
  const pricing = siteConfig.pricing;
  const [annual, setAnnual] = useState(true);
  const reduce = !!useReducedMotion();
  const { scrollYProgress, requestDwellLength } = useSceneContext();

  // ── Overflow scroll ──────────────────────────────────────────────────
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overflowPx = useRef(0);
  const offsetY = useMotionValue(0);
  const contentTransform = useTransform(offsetY, (y) => `translate3d(0, ${y}px, 0)`);
  // Soft top edge once content scrolls under the navbar (none at rest, so the badge is never faded)
  const topFade = useTransform(offsetY, (y) => {
    const f = Math.min(40, Math.max(0, -y));
    return f < 1 ? 'none' : `linear-gradient(to bottom, transparent 0px, black ${f}px)`;
  });
  const dwell = useTransform(scrollYProgress, (p) => dwellProgress(p, PRICING_SCENE));

  const updateOffset = () => offsetY.set(-overflowPx.current * dwell.get());

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    const content = contentRef.current;
    if (!vp || !content) return;
    const measure = () => {
      const overflow = Math.max(0, Math.ceil(content.scrollHeight - vp.clientHeight));
      overflowPx.current = overflow;
      // dwell length in viewports = overflow in px → 1:1 with the page scroll
      requestDwellLength(PRICING_SCENE, overflow / window.innerHeight);
      updateOffset();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    ro.observe(content);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestDwellLength]);

  useEffect(() => dwell.on('change', updateOffset), [dwell]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      ref={viewportRef}
      style={{ maskImage: topFade, WebkitMaskImage: topFade }}
      className="relative w-full h-full overflow-hidden select-none"
    >
      <motion.div
        ref={contentRef}
        style={{ transform: contentTransform }}
        className="w-full min-h-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-2 flex flex-col justify-center items-center will-change-transform"
      >
        <SectionHeader
          badge={pricing.badge}
          title={pricing.headingLead}
          highlightText={pricing.headingHighlight}
          subtitle={pricing.subheadingShort}
          className="mb-7"
        />

        {/* Billing — segmented control with a sliding thumb */}
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="relative inline-flex items-center p-1 rounded-full bg-white/80 border border-navy-900/10 shadow-sm mb-10"
        >
          {([
            { value: false, label: 'Monthly' },
            { value: true, label: 'Annual' },
          ] as const).map((opt) => {
            const active = annual === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setAnnual(opt.value)}
                className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-navy-muted hover:text-navy-900'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="billing-thumb"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-navy-900 to-brand-600 shadow-button"
                    transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.35, bounce: 0.12 }}
                  />
                )}
                {opt.label}
                {opt.value && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide transition-colors duration-200 ${
                      active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {pricing.annualDiscountLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Plans — 3 columns on desktop, swipe row on phones */}
        <div
          data-scroll-stagger
          className="w-full flex md:grid md:grid-cols-3 gap-6 items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {pricing.plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            const popular = plan.popular;

            return (
              <div key={plan.id} className="snap-center shrink-0 w-[85%] sm:w-[60%] md:w-auto flex">
                <div
                  className={`relative w-full flex flex-col rounded-3xl p-7 lg:p-8 transition-shadow duration-200 ${
                    popular
                      ? 'bg-white border border-transparent ring-2 ring-brand-500/50 shadow-blue-glow'
                      : 'bg-white/85 border border-navy-900/[0.08] shadow-card-soft hover:shadow-card-hover'
                  }`}
                >
                  {/* Name + description */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-navy-900">{plan.name}</h3>
                    {popular && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold whitespace-nowrap">
                        <Sparkles className="w-3 h-3" />
                        Most popular
                      </span>
                    )}
                  </div>
                  {/* Reserve 3 lines so price, button and list line up across all cards */}
                  <p className="mt-2 text-sm text-navy-muted leading-relaxed min-h-[4.3rem]">{plan.desc}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="relative inline-grid overflow-hidden text-5xl font-extrabold tracking-tight text-navy-900 leading-none tabular-nums">
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={price}
                          className="[grid-area:1/1]"
                          initial={{ opacity: 0, transform: `translateY(${reduce ? 0 : 60}%)` }}
                          animate={{ opacity: 1, transform: 'translateY(0%)', transition: { duration: 0.22, ease: EASE_OUT } }}
                          exit={{ opacity: 0, transform: `translateY(${reduce ? 0 : -60}%)`, transition: { duration: 0.16, ease: EASE_OUT } }}
                        >
                          ${price}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="text-sm text-navy-muted">/ user / month</span>
                  </div>
                  <p className="mt-2 text-xs text-navy-muted/80">
                    {annual ? `$${plan.priceAnnual * 12} per user, billed yearly` : 'Billed monthly · cancel anytime'}
                  </p>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={onSelectPlan}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold transition-[background-color,box-shadow,border-color,transform] duration-150 active:scale-[0.97] ${
                      popular
                        ? 'bg-gradient-to-r from-navy-900 to-brand-600 text-white shadow-button hover:shadow-glow'
                        : 'bg-white text-navy-900 border border-navy-900/15 hover:border-brand-500/50 hover:bg-tint-50'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Full feature list */}
                  <div className="mt-7 pt-7 border-t border-tint-200 flex-1 flex flex-col">
                    <p className="mb-4 text-[11px] font-bold tracking-wider text-navy-900 uppercase">Everything included</p>
                    <ul className="space-y-3.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-navy-900 leading-snug">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCompareAll}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Compare every feature across plans
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
};
