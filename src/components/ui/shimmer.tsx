import React from 'react';

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className = '', children }: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-sm animate-pulse ${className}`}
    >
      {children}
    </div>
  );
}
