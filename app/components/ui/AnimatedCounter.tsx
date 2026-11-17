'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
  className = '',
}) => {
  const [currentVal, setCurrentVal] = useState<number>(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out expo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const val = easeProgress * value;
            setCurrentVal(val);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCurrentVal(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = decimals > 0 
    ? currentVal.toFixed(decimals) 
    : Math.floor(currentVal).toLocaleString();

  return (
    <span ref={counterRef} className={`font-extrabold tracking-tight tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

