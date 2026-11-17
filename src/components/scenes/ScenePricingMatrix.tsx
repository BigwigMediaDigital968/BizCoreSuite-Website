'use client';

import React from 'react';
import { Check, Minus, Sparkles } from 'lucide-react';
import { siteConfig } from '../../config/site';

type Cell = boolean | string;

const CellValue: React.FC<{ value: Cell; highlight?: boolean }> = ({ value, highlight }) => {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center" aria-label="Included">
        <Check className="w-4 h-4 text-brand-600" strokeWidth={2.5} />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center" aria-label="Not included">
        <Minus className="w-4 h-4 text-navy-muted/40" />
      </span>
    );
  return (
    <span className={`text-xs font-semibold ${highlight ? 'text-brand-700' : 'text-navy-900'}`}>{value}</span>
  );
};

/**
 * Feature matrix — capability-by-tier comparison for the three pricing plans.
 * The Growth column is tinted to match its "most popular" card.
 */
export const ScenePricingMatrix: React.FC = () => {
  const { plans, matrix } = siteConfig.pricing;
  const tiers = ['starter', 'growth', 'enterprise'] as const;
  const tierName = (id: string) => plans.find((p) => p.id === id)?.name.replace(' Suite', '').replace(' Scale', '') ?? id;

  return (
    <div className="w-full h-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <div className="w-full rounded-3xl bg-white/90 border border-navy-900/10 shadow-card-soft p-5 sm:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-navy-900">{matrix.heading}</h2>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-tint-200">
                <th scope="col" className="py-3 pr-4 text-[10px] font-bold tracking-wider text-navy-muted uppercase">
                  Capability
                </th>
                {tiers.map((t) => (
                  <th
                    key={t}
                    scope="col"
                    className={`py-3 px-4 text-center text-[10px] font-bold tracking-wider uppercase ${
                      t === 'growth' ? 'text-brand-700 bg-brand-50/70 rounded-t-xl' : 'text-navy-muted'
                    }`}
                  >
                    {tierName(t)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody data-scroll-stagger>
              {matrix.rows.map((row) => (
                <tr key={row.capability} className="border-b border-tint-100 last:border-b-0">
                  <th scope="row" className="py-3.5 pr-4 text-xs font-semibold text-navy-900">
                    {row.capability}
                  </th>
                  {tiers.map((t) => (
                    <td key={t} className={`py-3.5 px-4 text-center ${t === 'growth' ? 'bg-brand-50/70' : ''}`}>
                      <CellValue value={row[t]} highlight={t === 'growth'} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
