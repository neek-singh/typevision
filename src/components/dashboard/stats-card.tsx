'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: 'cyan' | 'emerald' | 'purple' | 'indigo' | 'rose';
  description?: string;
}

const colorMap = {
  cyan: {
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    glow: 'bg-cyan-400',
    border: 'hover:border-cyan-500/30 hover:shadow-cyan-900/5',
  },
  emerald: {
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    glow: 'bg-emerald-400',
    border: 'hover:border-emerald-500/30 hover:shadow-emerald-900/5',
  },
  purple: {
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    glow: 'bg-purple-400',
    border: 'hover:border-purple-500/30 hover:shadow-purple-900/5',
  },
  indigo: {
    text: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    glow: 'bg-indigo-400',
    border: 'hover:border-indigo-500/30 hover:shadow-indigo-900/5',
  },
  rose: {
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    glow: 'bg-rose-400',
    border: 'hover:border-rose-500/30 hover:shadow-rose-900/5',
  },
};

export default function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  description,
}: StatsCardProps) {
  const styles = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ${styles.border} group`}>
      {/* Absolute Radial Glow in Background */}
      <div className={`absolute -right-6 -bottom-6 -z-10 h-16 w-16 opacity-5 rounded-full blur-xl transition-all duration-300 group-hover:scale-125 group-hover:opacity-10 ${styles.glow}`}></div>

      <div className="flex flex-col justify-between h-full gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles.iconBg} transition-all duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {value}
            {unit && (
              <span className="ml-1 text-sm font-semibold text-slate-400">
                {unit}
              </span>
            )}
          </h3>
          {description && (
            <p className="mt-1 text-[11px] text-slate-400 font-medium leading-none">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
