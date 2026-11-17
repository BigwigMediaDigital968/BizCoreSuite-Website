'use client';

import React, { useState } from 'react';
import { Phone, CheckCircle2, Sparkles, Mail, Youtube } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { GradientButton } from '../ui/GradientButton';
import { SiteFooter } from '../ui/SiteFooter';

interface Scene19FinalCTAProps {
  onScrollToTop?: () => void;
}

export const Scene19FinalCTA: React.FC<Scene19FinalCTAProps> = ({ onScrollToTop }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    companySize: '50-200',
    noOfAdmin: '',
    noOfManagers: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Company-size bucket -> headcount sent to the API (upper end of the range)
  const EMPLOYEES_BY_SIZE: Record<string, number> = {
    '1-20': 20,
    '20-50': 50,
    '50-200': 200,
    '200+': 200,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          noOfemployee: EMPLOYEES_BY_SIZE[formData.companySize],
          // Optional — sent only when filled in
          noOfAdmin: formData.noOfAdmin === '' ? undefined : Number(formData.noOfAdmin),
          noOfManagers: formData.noOfManagers === '' ? undefined : Number(formData.noOfManagers),
        }),
      });
      if (res.status === 409) {
        // Same email already requested a demo — treat as success, the team already has it
        setIsSuccess(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setIsSuccess(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-between py-2 select-none text-navy-900">
      
      {/* Top CTA Stage: Headline & Short Demo Form */}
      <div className="my-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Headline & Assurances */}
        <div className="lg:col-span-6 flex flex-col text-left">
          <div className="self-start inline-flex items-center gap-2 py-1  text-brand-600 text-sm font-mono font-bold uppercase mb-4">
            <span>EXECUTIVE ONBOARDING</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 tracking-tight mb-4 leading-tight">
            {siteConfig.finalCta.heading}
          </h2>

          <p className="text-xs sm:text-sm text-navy-muted mb-6 leading-relaxed">
            {siteConfig.finalCta.subheading}
          </p>

          {/* Quick Features */}
          <div className="space-y-2 mb-6 text-xs font-medium text-navy-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>14-day free trial • Zero credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free spreadsheet & legacy software migration</span>
            </div>
          </div>

          {/* WhatsApp Direct */}
          <div>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, '')}?text=Hi%20Bizcore%20Suite,%20I'd%20like%20to%20book%20a%20demo`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-[background-color,transform] duration-200 active:scale-[0.97]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right: Short Book-a-Demo Form */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl glass-card p-6 sm:p-7 border border-navy-900/10 shadow-blue-glow">
            {isSuccess ? (
              <div className="py-8 flex flex-col items-center text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-1">
                  Walkthrough Reserved!
                </h3>
                <p className="text-xs text-navy-muted max-w-xs mb-4">
                  Thank you, {formData.name}. Our enterprise team will contact you at {formData.email} within 2 business hours.
                </p>
                <button
                  onClick={() => {
                    setFormData({ name: '', email: '', phone: '', companyName: '', companySize: '50-200', noOfAdmin: '', noOfManagers: '' });
                    setIsSuccess(false);
                  }}
                  className="px-4 py-1.5 rounded-full bg-tint-100 text-navy-900 text-xs font-semibold hover:bg-tint-200 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-navy-900">Book Executive Demo</h3>
                  <p className="text-[11px] text-navy-muted">Personalized 15-minute product tour</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-navy-900 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sarah Jenkins"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-navy-900 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-navy-900 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-navy-900 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Acme Industries"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="cta-size" className="block text-[10px] font-semibold text-navy-900 mb-1">Company Size</label>
                    <select
                      id="cta-size"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    >
                      <option value="1-20">1 - 20 employees</option>
                      <option value="20-50">20 - 50 employees</option>
                      <option value="50-200">50 - 200 employees</option>
                      <option value="200+">200+ employees (Multi-Branch)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cta-admins" className="block text-[10px] font-semibold text-navy-900 mb-1">Admins</label>
                    <input
                      id="cta-admins"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={formData.noOfAdmin}
                      onChange={(e) => setFormData({ ...formData, noOfAdmin: e.target.value })}
                      placeholder="2"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-managers" className="block text-[10px] font-semibold text-navy-900 mb-1">Managers</label>
                    <input
                      id="cta-managers"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={formData.noOfManagers}
                      onChange={(e) => setFormData({ ...formData, noOfManagers: e.target.value })}
                      placeholder="5"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-tint-200 text-navy-900 placeholder-navy-muted/50 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-[border-color,box-shadow] duration-150"
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-[11px] text-rose-700">
                    {error}
                  </p>
                )}

                <GradientButton
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="w-full justify-center mt-2"
                  showArrow
                >
                  {isSubmitting ? 'Reserving...' : 'Confirm Walkthrough'}
                </GradientButton>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Compact Footer Bar (shared with the blog) */}
      <SiteFooter onScrollToTop={onScrollToTop} />

    </div>
  );
};

