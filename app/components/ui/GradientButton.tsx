'use client';

import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  showArrow?: boolean;
  className?: string;
  href?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  showArrow = false,
  className = '',
  href,
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold rounded-full gap-1.5',
    md: 'px-6 py-3 text-sm font-semibold rounded-full gap-2',
    lg: 'px-8 py-4 text-base font-bold rounded-full gap-2.5',
  };

  const variantClasses = {
    primary: 'relative bg-gradient-to-r from-navy-900 to-brand-600 text-white shadow-button hover:shadow-cardHover border border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden',
    secondary: 'bg-white/80 hover:bg-white text-navy-900 border border-tint-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
    dark: 'bg-navy-950/80 hover:bg-navy-900 text-white border border-brand-400/30 shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-brand-600/10 text-brand-600 border border-brand-600/40 hover:border-brand-600 transition-all duration-300',
  };

  const content = (
    <>
      {/* Shimmer sweep effect for primary */}
      {variant === 'primary' && (
        <span 
          aria-hidden="true" 
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] pointer-events-none animate-shimmer-sweep"
        />
      )}
      
      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />}
      <span className="relative z-10 tracking-tight">{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`group inline-flex items-center justify-center select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        onClick={onClick as any}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`group inline-flex items-center justify-center select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

