'use client';

import React from 'react';
import { 
  Building, UserCheck, Clock4, Wallet, CalendarRange, 
  CheckSquare, CircleDollarSign, Target, LineChart, FileSearch, 
  Sparkles 
} from 'lucide-react';
import { siteConfig } from '../../config/site';
import { SectionHeader } from '../ui/SectionHeader';
import { scrollFx } from '../../utils/scrollFx';

const ORBIT_RADIUS = 150;

export const Scene15Overview: React.FC = () => {
  const iconList = [
    { label: "Branch", icon: <Building className="w-4 h-4" />, angle: 0 },
    { label: "Employees", icon: <UserCheck className="w-4 h-4" />, angle: 36 },
    { label: "Attendance", icon: <Clock4 className="w-4 h-4" />, angle: 72 },
    { label: "Payroll", icon: <Wallet className="w-4 h-4" />, angle: 108 },
    { label: "Leaves", icon: <CalendarRange className="w-4 h-4" />, angle: 144 },
    { label: "Tasks", icon: <CheckSquare className="w-4 h-4" />, angle: 180 },
    { label: "Revenue", icon: <CircleDollarSign className="w-4 h-4" />, angle: 216 },
    { label: "Leads", icon: <Target className="w-4 h-4" />, angle: 252 },
    { label: "Analytics", icon: <LineChart className="w-4 h-4" />, angle: 288 },
    { label: "Audit Logs", icon: <FileSearch className="w-4 h-4" />, angle: 324 },
  ];

  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col justify-center items-center select-none">
      <SectionHeader
        badge="CENTRAL COMMAND ARCHITECTURE"
        title={siteConfig.overview.heading}
        subtitle={siteConfig.overview.subheading}
        className="mb-4 sm:mb-6"
      />

      {/* Orbiting Architecture Stage */}
      <div className="relative w-full max-w-4xl min-h-[370px] flex items-center justify-center">

        {/* Concentric SVG Spoke Lines & Circles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 370">
          <circle cx="400" cy="185" r={ORBIT_RADIUS} fill="none" stroke="#5B8CFF" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
          <circle cx="400" cy="185" r="100" fill="none" stroke="#1D4ED8" strokeWidth="1" strokeOpacity="0.3" />

          {/* Connector spoke lines */}
          {iconList.map((item, idx) => {
            const rad = ((item.angle - 90) * Math.PI) / 180;
            const x2 = 400 + Math.cos(rad) * ORBIT_RADIUS;
            const y2 = 185 + Math.sin(rad) * ORBIT_RADIUS;
            return (
              <line
                key={idx}
                x1="400"
                y1="185"
                x2={x2}
                y2={y2}
                stroke="#5B8CFF"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            );
          })}
        </svg>

        {/* Center Logo in Halo */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center p-6 rounded-full glass-card border-2 border-brand-400 shadow-blue-glow w-36 h-36 sm:w-44 sm:h-44 bg-white/95">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-navy-900 to-brand-600 flex items-center justify-center text-white shadow-md mb-1.5">
            <Sparkles className="w-6 h-6 text-brand-300 animate-pulse" />
          </div>
          <h3 className="text-sm font-extrabold text-navy-900">Bizcore Core</h3>
          <span className="text-[9px] font-bold text-brand-600 uppercase font-mono">1 Database</span>
        </div>

        {/* Desktop Orbiting Modules */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          {iconList.map((item, idx) => {
            const radius = ORBIT_RADIUS;
            const rad = ((item.angle - 90) * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div
                key={idx}
                // Scroll in: chips burst out of the core into orbit, one after another.
                // Scroll out: they keep flying outward and fade.
                {...scrollFx({
                  enter: { x: -x, y: -y, s: 0.4, o: 0 },
                  enterRange: [-0.8 + idx * 0.035, -0.18 + idx * 0.035],
                  exit: { x: x * 0.55, y: y * 0.55, o: 0 },
                  exitRange: [0.08, 0.7],
                })}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  left: '50%',
                  top: '50%',
                }}
                className="absolute pointer-events-auto"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border border-tint-200 shadow-sm text-xs font-bold text-navy-900 bg-white/90 hover:scale-110 transition-transform">
                  <div className="text-brand-600">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:hidden z-20 mt-4">
          {iconList.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl glass-card border border-tint-200 text-xs font-bold text-navy-900">
              <div className="text-brand-600">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

